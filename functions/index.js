/**
 * Firebase Cloud Functions (Gen2) for Safe & Sound
 * - Scheduled Function: ส่ง push ทุก 1 นาทีสำหรับ notification ที่ยัง pushSent: false
 * ใช้ scheduled function เท่านั้นเพราะ HTTP function ไม่สามารถตั้งค่า IAM invoker ได้ (ถูกบล็อกโดยนโยบายองค์กร)
 *
 * Deploy: firebase deploy --only functions
 */
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Helper: ส่ง FCM push notification
 */
async function sendPushNotification(userId, title, body, type, notifId) {
  if (!userId) {
    console.log(`❌ No userId provided for notification ${notifId}`);
    return false;
  }
  
  try {
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`❌ User ${userId} not found in Firestore`);
      return false;
    }
    
    const userData = userDoc.data();

    // Support multi-device tokens:
    // - Preferred: users/{uid}.fcmTokens.{installationId}.token
    // - Fallback: users/{uid}.fcmToken (legacy single token)
    const tokenMap =
      userData?.fcmTokens && typeof userData.fcmTokens === "object" ? userData.fcmTokens : null;

    /** tokenEntries: { token: string, key: string|null } */
    const tokenEntries = [];

    if (tokenMap) {
      for (const [key, val] of Object.entries(tokenMap)) {
        const tok = val && typeof val === "object" ? val.token : null;
        if (typeof tok === "string" && tok.length > 0) {
          tokenEntries.push({ token: tok, key });
        }
      }
    }

    const legacyToken = typeof userData?.fcmToken === "string" ? userData.fcmToken : null;
    if (legacyToken && legacyToken.length > 0) {
      tokenEntries.push({ token: legacyToken, key: null });
    }

    // Deduplicate by token string
    const seen = new Set();
    const uniqueEntries = [];
    for (const e of tokenEntries) {
      if (seen.has(e.token)) continue;
      seen.add(e.token);
      uniqueEntries.push(e);
    }

    if (!uniqueEntries.length) {
      console.log(`❌ No FCM tokens found for user ${userId}`);
      return false;
    }

    const tokens = uniqueEntries.map((e) => e.token);
    console.log(`📤 Sending FCM push to user ${userId}, tokens: ${tokens.length}`);

    const message = {
      tokens,
      notification: { title, body },
      data: {
        type: String(type || ""),
        notifId: String(notifId || ""),
      },
      android: {
        priority: "high",
        notification: {
          channelId: "fcm_fallback_notification_channel",
          priority: "high",
          tag: String(notifId || ""),
          defaultSound: true,
          defaultVibrateTimings: true,
          visibility: "public",
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    const successCount = response.successCount || 0;
    const failureCount = response.failureCount || 0;

    console.log(
      `✅ FCM multicast for notification ${notifId} (type: ${type}) to user ${userId}: success=${successCount}, failure=${failureCount}`
    );

    // Best-effort cleanup for invalid tokens
    try {
      if (tokenMap && failureCount > 0) {
        const invalidTokenKeys = new Set();
        response.responses.forEach((r, idx) => {
          if (r.success) return;
          const code = r.error?.code;
          const key = uniqueEntries[idx]?.key;
          if (!key) return;
          if (
            code === "messaging/invalid-registration-token" ||
            code === "messaging/registration-token-not-registered"
          ) {
            invalidTokenKeys.add(key);
          }
        });

        if (invalidTokenKeys.size > 0) {
          const updates = {};
          for (const key of invalidTokenKeys) {
            updates[`fcmTokens.${key}`] = admin.firestore.FieldValue.delete();
          }
          await admin.firestore().collection("users").doc(userId).update(updates);
          console.log(`🗑️ Deleted ${invalidTokenKeys.size} invalid fcmTokens for user ${userId}`);
        }
      }
    } catch (cleanupErr) {
      console.error("FCM token cleanup failed:", cleanupErr);
    }

    return successCount > 0;
  } catch (e) {
    // Handle specific FCM errors
    console.error(`❌ FCM send error for notification ${notifId}, user ${userId}:`, e.code, e.message);
    return false;
  }
}

/**
 * Scheduled Function: ส่ง push ทุก 1 นาทีสำหรับ notification ที่ยัง pushSent: false
 * ใช้ scheduled function เท่านั้นเพราะ HTTP function ไม่สามารถตั้งค่า IAM invoker ได้
 */
exports.sendPushOnNotificationCreate = onSchedule(
  {
    // Scheduled retry mechanism (fallback).
    // Use the shortest interval supported by your project.
    // NOTE: Cloud Scheduler for Firebase Functions v2 typically runs at minute granularity.
    schedule: "every 1 minutes",
    region: "asia-southeast2",
    timeZone: "Asia/Bangkok",
  },
  async () => {
    const db = admin.firestore();
    console.log("Scheduled function running: checking for unsent notifications...");
    
    // Only pull docs that are explicitly waiting for push.
    // (We avoid limit-only query to not miss newly created notifications.)
    const snapshot = await db
      .collection("notifications")
      .where("pushSent", "==", false)
      .limit(200)
      .get();

    const unsentDocs = snapshot.docs;
    console.log(`Found ${unsentDocs.length} notifications with pushSent=false`);

    const batch = db.batch();
    let sentCount = 0;
    let skippedCount = 0;
    
    for (const doc of unsentDocs) {
      const data = doc.data();
      const userId = data.userId;
      const title = data.title || "Safe & Sound";
      const body = data.message || "";
      const notifId = doc.id;
      const type = data.type || "";

      if (!userId) {
        batch.update(doc.ref, { pushSent: true });
        skippedCount++;
        continue;
      }

      console.log(`Processing notification ${notifId}: type=${type}, title="${title}", userId=${userId}`);
      const sent = await sendPushNotification(userId, title, body, type, notifId);
      
      if (sent) {
        batch.update(doc.ref, { pushSent: true });
        sentCount++;
        console.log(`✅ Marked notification ${notifId} as sent (type: ${type}, userId: ${userId})`);
      } else {
        // ไม่ mark pushSent: true เพื่อให้รอบถัดไปลองใหม่
        // แต่ถ้าไม่มี token หรือ token invalid แล้ว ก็ไม่ควร retry ต่อ
        console.log(`⚠️ Failed to send push for notification ${notifId} (type: ${type}, userId: ${userId}) - will retry next run`);
      }
    }

    if (unsentDocs.length > 0) {
      await batch.commit();
      console.log(`Processed ${unsentDocs.length} notifications: ${sentCount} sent, ${skippedCount} skipped`);
    }
    return null;
  }
);

/**
 * Health status notifier (scheduled):
 * ตรวจ every 1 นาทีว่า health status เป็น Warning/Danger หรือไม่
 * ถ้าใช่ จะสร้าง notification (pushSent:false) ให้ caregiver ตาม relationship ที่ active
 *
 * ออกแบบให้ "ไม่ต้อง detect การเปลี่ยน" (จะส่งซ้ำทุกนาทีเท่าที่สถานะยังเป็น Warning/Danger)
 */
exports.sendHealthStatusNotifications = onSchedule(
  {
    schedule: "every 1 minutes",
    region: "asia-southeast2",
    timeZone: "Asia/Bangkok",
  },
  async () => {
    const db = admin.firestore();
    const minuteBucket = Math.floor(Date.now() / 60000);

    const normalizeStatus = (statusRaw) => {
      if (!statusRaw || typeof statusRaw !== "string") return "Not Wearing";
      const normalized = statusRaw.replace(/_/g, " ").trim().toLowerCase();
      if (normalized === "warning") return "Warning";
      if (normalized === "danger") return "Danger";
      if (normalized === "normal") return "Normal";
      if (
        normalized === "not wearing" ||
        normalized === "not_wearing" ||
        normalized === "notwearing"
      )
        return "Not Wearing";
      return "Not Wearing";
    };

    try {
      // Load all active caregiver<->elder relationships
      const relationshipsSnapshot = await db
        .collection("relationships")
        .where("status", "==", "active")
        .get();

      const eldersStatusCache = new Map(); // elderId -> normalized status
      const eldersNameCache = new Map(); // elderId -> elderName

      let createdCount = 0;

      for (const relDoc of relationshipsSnapshot.docs) {
        const rel = relDoc.data() || {};
        const caregiverId = rel.caregiverId;
        const elderId = rel.elderId;
        if (!caregiverId || !elderId) continue;

        // Respect notification preferences
        const prefSnap = await db.collection("notificationPreferences").doc(caregiverId).get();
        const healthChangesEnabled = prefSnap.exists
          ? !!prefSnap.data().healthChanges
          : true;
        if (!healthChangesEnabled) continue;

        // Fetch/cached elder name
        let elderName = eldersNameCache.get(elderId);
        if (!elderName) {
          const elderUserSnap = await db.collection("users").doc(elderId).get();
          const u = elderUserSnap.exists ? elderUserSnap.data() : null;
          elderName = u
            ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || "An elder"
            : "An elder";
          eldersNameCache.set(elderId, elderName);
        }

        // Fetch/cached elder health status
        let normalizedStatus = eldersStatusCache.get(elderId);
        if (!normalizedStatus) {
          const healthSnap = await db.collection("healthData").doc(elderId).get();
          const d = healthSnap.exists ? healthSnap.data() : null;

          const statusRaw =
            d?.sensorPayload?.health?.status ??
            d?.aiPrediction?.status ??
            d?.status ??
            null;

          normalizedStatus = normalizeStatus(statusRaw);
          eldersStatusCache.set(elderId, normalizedStatus);
        }

        if (normalizedStatus !== "Warning" && normalizedStatus !== "Danger") {
          continue;
        }

        const notifType = normalizedStatus === "Warning" ? "warning" : "danger";
        const title = "Health Alert";
        const message = `${elderName} is ${normalizedStatus}.`;

        // Deterministic docId to avoid duplicates in the same minute bucket
        const notifDocId = `healthStatus_${caregiverId}_${elderId}_${notifType}_${minuteBucket}`;
        const notifRef = db.collection("notifications").doc(notifDocId);

        // Create only if not exists
        try {
          await notifRef.create({
            userId: caregiverId,
            type: notifType,
            title,
            message,
            relatedId: elderId,
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            pushSent: false,
          });
          createdCount++;
        } catch (err) {
          // ignore already exists / other create errors (scheduled may overlap)
        }
      }

      console.log(`Health status notifications created: ${createdCount}`);
    } catch (e) {
      console.error("sendHealthStatusNotifications failed:", e);
    }

    return null;
  }
);

/**
 * Helper Function: Reset pushSent to false for testing
 * Call this manually from Firebase Console or via HTTP trigger if needed
 */
exports.resetPushSent = require("firebase-functions/v2/https").onRequest(
  {
    region: "asia-southeast2",
    cors: true,
    invoker: "private",
  },
  async (req, res) => {
    // Security: Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const db = admin.firestore();
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: "notificationIds array required" });
    }

    try {
      const batch = db.batch();
      let resetCount = 0;

      for (const notifId of notificationIds) {
        const docRef = db.collection("notifications").doc(notifId);
        const doc = await docRef.get();
        
        if (doc.exists) {
          batch.update(docRef, { pushSent: false });
          resetCount++;
        }
      }

      await batch.commit();
      return res.status(200).json({ 
        success: true, 
        message: `Reset ${resetCount} notifications` 
      });
    } catch (error) {
      console.error("Error resetting pushSent:", error);
      return res.status(500).json({ error: error.message });
    }
  }
);
