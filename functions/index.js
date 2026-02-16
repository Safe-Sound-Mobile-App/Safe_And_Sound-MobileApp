/**
 * Firebase Cloud Functions (Gen2) for Safe & Sound
 * ใช้ Scheduled Function แทน Firestore trigger เพราะ Firestore อยู่ asia-southeast3
 * ซึ่ง Cloud Functions ไม่รองรับ — ฟังก์ชันรันใน asia-southeast2 แล้ว query Firestore
 *
 * Deploy: firebase deploy --only functions
 */
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendPushOnNotificationCreate = onSchedule(
  {
    schedule: "every 1 minutes",
    region: "asia-southeast2",
    timeZone: "Asia/Bangkok",
  },
  async () => {
    const db = admin.firestore();
    const snapshot = await db
      .collection("notifications")
      .where("pushSent", "==", false)
      .limit(50)
      .get();

    const batch = db.batch();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userId = data.userId;
      const title = data.title || "Safe & Sound";
      const body = data.message || "";
      const notifId = doc.id;

      if (!userId) {
        batch.update(doc.ref, { pushSent: true });
        continue;
      }

      try {
        const userDoc = await db.collection("users").doc(userId).get();
        const fcmToken = userDoc.exists && userDoc.data() ? userDoc.data().fcmToken : null;

        if (fcmToken) {
          await admin.messaging().send({
            token: fcmToken,
            notification: { title, body },
            data: {
              type: String(data.type || ""),
              notifId: String(notifId),
            },
            android: {
              priority: "high",
              notification: {
                channelId: "fcm_fallback_notification_channel",
                priority: "high",
              },
            },
          });
        }
      } catch (e) {
        console.error("FCM send error for", notifId, e);
      }
      batch.update(doc.ref, { pushSent: true });
    }

    if (snapshot.size > 0) {
      await batch.commit();
    }
    return null;
  }
);
