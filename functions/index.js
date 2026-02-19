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
    const fcmToken = userData?.fcmToken;
    
    if (!fcmToken) {
      console.log(`❌ No FCM token found for user ${userId}`);
      return false;
    }
    
    console.log(`📤 Sending FCM push to user ${userId}, token: ${fcmToken.substring(0, 20)}...`);
    
    const message = {
      token: fcmToken,
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
        },
      },
    };
    
    const response = await admin.messaging().send(message);
    console.log(`✅ Successfully sent FCM push for notification ${notifId} (type: ${type}) to user ${userId}, messageId: ${response}`);
    return true;
  } catch (e) {
    // Handle specific FCM errors
    if (e.code === 'messaging/invalid-registration-token' || e.code === 'messaging/registration-token-not-registered') {
      console.error(`❌ Invalid/expired FCM token for user ${userId}, notification ${notifId}:`, e.message);
      // Optionally: clear the invalid token from Firestore
      try {
        await admin.firestore().collection("users").doc(userId).update({
          fcmToken: admin.firestore.FieldValue.delete(),
        });
        console.log(`🗑️ Deleted invalid FCM token for user ${userId}`);
      } catch (deleteError) {
        console.error(`Failed to delete invalid token:`, deleteError);
      }
    } else {
      console.error(`❌ FCM send error for notification ${notifId}, user ${userId}:`, e.code, e.message);
    }
    return false;
  }
}

/**
 * Scheduled Function: ส่ง push ทุก 1 นาทีสำหรับ notification ที่ยัง pushSent: false
 * ใช้ scheduled function เท่านั้นเพราะ HTTP function ไม่สามารถตั้งค่า IAM invoker ได้
 */
exports.sendPushOnNotificationCreate = onSchedule(
  {
    schedule: "every 1 minutes",
    region: "asia-southeast2",
    timeZone: "Asia/Bangkok",
  },
  async () => {
    const db = admin.firestore();
    console.log("Scheduled function running: checking for unsent notifications...");
    
    // Query notifications ที่ยังไม่ส่ง push
    // รวมทั้ง documents ที่ไม่มี field pushSent (ของเก่า) และ pushSent: false
    const snapshot = await db
      .collection("notifications")
      .limit(100)
      .get();
    
    // Filter documents ที่ pushSent ไม่ใช่ true (รวม false และ undefined)
    const unsentDocs = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.pushSent !== true; // รวม false และ undefined
    });

    console.log(`Found ${unsentDocs.length} unsent notifications (out of ${snapshot.size} total)`);

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
 * Helper Function: Reset pushSent to false for testing
 * Call this manually from Firebase Console or via HTTP trigger if needed
 */
exports.resetPushSent = require("firebase-functions/v2/https").onRequest(
  {
    region: "asia-southeast2",
    cors: true,
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
