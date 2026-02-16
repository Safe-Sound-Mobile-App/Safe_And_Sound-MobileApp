# Cloud Functions – Push Notifications

เมื่อมี document ใหม่ใน Firestore collection `notifications` ฟังก์ชันจะส่ง push (FCM) ไปยังอุปกรณ์ของผู้ใช้ (userId) ที่มี `fcmToken` ใน `users/{userId}`

## การ deploy

1. ติดตั้ง Firebase CLI และ login: `npm i -g firebase-tools` แล้ว `firebase login`
2. ในโฟลเดอร์โปรเจกต์ (ระดับเดียวกับ `src/`): `firebase init functions` (เลือกใช้โฟลเดอร์ `functions` ที่มีอยู่แล้ว ถ้ามี)
3. เข้าโฟลเดอร์ `functions`: `cd functions` แล้ว `npm install`
4. Deploy: `firebase deploy --only functions`

หมายเหตุ: ต้องใช้ Firebase Blaze plan เพื่อให้ Cloud Functions ทำงานได้
