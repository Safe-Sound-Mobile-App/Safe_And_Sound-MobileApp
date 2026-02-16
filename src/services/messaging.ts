/**
 * Push notifications via Firebase Cloud Messaging (FCM).
 * - Requests permission and gets FCM token, saves to Firestore (users/{uid}.fcmToken).
 * - A Cloud Function sends FCM when a notification doc is created (see functions/).
 */
import { Platform, PermissionsAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

let messaging: typeof import('@react-native-firebase/messaging').default | null = null;

async function getMessaging() {
  if (messaging) return messaging;
  try {
    messaging = (await import('@react-native-firebase/messaging')).default;
    return messaging;
  } catch {
    return null;
  }
}

/** สร้างช่องการแจ้งเตือนบน Android (importance สูง) เพื่อให้ push แสดงบนหน้าจอ */
async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('fcm_fallback_notification_channel', {
      name: 'Safe & Sound',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22c55e',
    });
  } catch (_) {
    // บางเครื่องอาจไม่รองรับ
  }
}

/** Android 13+ ต้องขอ POST_NOTIFICATIONS ถึงจะแสดง push ได้ */
async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const apiLevel = Platform.OS === 'android' ? Number(Platform.Version) : 0;
  if (apiLevel < 33) return true; // ก่อน Android 13 ไม่ต้องขอ runtime
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'การแจ้งเตือน',
        message: 'เปิดการแจ้งเตือนเพื่อรับข้อความสำคัญ เช่น คำขอจาก caregiver และการแจ้งเหตุฉุกเฉิน',
        buttonPositive: 'อนุญาต',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Request notification permission (iOS/Android) and get FCM token, then save to Firestore.
 * Call when user is logged in (e.g. in App or after auth state change).
 */
export async function registerForPushNotifications(): Promise<void> {
  const user = auth().currentUser;
  if (!user) return;

  const messagingInstance = await getMessaging();
  if (!messagingInstance) return;

  try {
    if (Platform.OS === 'android') {
      await ensureAndroidNotificationChannel();
      const allowed = await requestAndroidNotificationPermission();
      if (!allowed) {
        console.warn('Push notification permission denied on Android');
        return;
      }
    } else {
      await messagingInstance().requestPermission();
    }
    const token = await messagingInstance().getToken();
    if (token) {
      await firestore().collection('users').doc(user.uid).update({
        fcmToken: token,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    // Refresh token when it changes
    messagingInstance().onTokenRefresh(async (newToken) => {
      if (auth().currentUser) {
        await firestore().collection('users').doc(auth().currentUser!.uid).update({
          fcmToken: newToken,
          fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    });
  } catch (e) {
    console.warn('Push notification registration failed:', e);
  }
}

/**
 * Call when user signs out to stop receiving push (optional: clear fcmToken in Firestore).
 */
export async function clearFcmToken(): Promise<void> {
  const user = auth().currentUser;
  if (!user) return;
  try {
    await firestore().collection('users').doc(user.uid).update({
      fcmToken: firestore.FieldValue.delete(),
      fcmTokenUpdatedAt: firestore.FieldValue.delete(),
    });
  } catch (_) {}
}
