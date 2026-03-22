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
    console.log('📱 Creating Android notification channel: fcm_fallback_notification_channel');
    await Notifications.setNotificationChannelAsync('fcm_fallback_notification_channel', {
      name: 'Safe & Sound',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22c55e',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
    console.log('✅ Android notification channel created successfully');
  } catch (error) {
    console.error('❌ Failed to create Android notification channel:', error);
  }
}

/** Android 13+ ต้องขอ POST_NOTIFICATIONS ถึงจะแสดง push ได้ */
async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const apiLevel = Platform.OS === 'android' ? Number(Platform.Version) : 0;
  if (apiLevel < 33) {
    console.log('📱 Android version < 33, no runtime permission needed');
    return true; // ก่อน Android 13 ไม่ต้องขอ runtime
  }
  
  try {
    // ตรวจสอบ permission status ก่อน
    const checkResult = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    
    console.log('📱 Current notification permission status:', checkResult ? 'GRANTED' : 'DENIED');
    
    if (checkResult) {
      console.log('✅ Notification permission already granted');
      return true;
    }
    
    // ถ้ายังไม่มี permission ให้ขอ
    console.log('📱 Requesting notification permission...');
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'การแจ้งเตือน',
        message: 'เปิดการแจ้งเตือนเพื่อรับข้อความสำคัญ เช่น คำขอจาก caregiver และการแจ้งเหตุฉุกเฉิน',
        buttonPositive: 'อนุญาต',
        buttonNegative: 'ปฏิเสธ',
      }
    );
    
    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
    console.log('📱 Permission request result:', granted, isGranted ? '✅ GRANTED' : '❌ DENIED');
    
    return isGranted;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Request notification permission (iOS/Android) and get FCM token, then save to Firestore.
 * Call when user is logged in (e.g. in App or after auth state change).
 */
export async function registerForPushNotifications(): Promise<void> {
  const user = auth().currentUser;
  if (!user) {
    console.warn('❌ No user logged in, cannot register for push notifications');
    return;
  }

  const messagingInstance = await getMessaging();
  if (!messagingInstance) {
    console.warn('❌ FCM messaging not available');
    return;
  }

  try {
    console.log('📱 Starting push notification registration for user:', user.uid);
    
    if (Platform.OS === 'android') {
      console.log('📱 Setting up Android notification channel...');
      await ensureAndroidNotificationChannel();
      
      console.log('📱 Requesting Android notification permission...');
      const allowed = await requestAndroidNotificationPermission();
      if (!allowed) {
        console.warn('❌ Push notification permission denied on Android');
        return;
      }
      console.log('✅ Android notification permission granted');
    } else {
      const permission = await messagingInstance().requestPermission();
      console.log('📱 iOS notification permission:', permission);
    }
    
    console.log('📱 Getting FCM token...');
    const token = await messagingInstance().getToken();
    if (token) {
      console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
      await firestore().collection('users').doc(user.uid).update({
        fcmToken: token,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ FCM token saved to Firestore');
    } else {
      console.warn('❌ No FCM token received');
    }

    // Refresh token when it changes
    messagingInstance().onTokenRefresh(async (newToken) => {
      console.log('🔄 FCM token refreshed:', newToken.substring(0, 20) + '...');
      if (auth().currentUser) {
        await firestore().collection('users').doc(auth().currentUser!.uid).update({
          fcmToken: newToken,
          fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });
        console.log('✅ New FCM token saved to Firestore');
      }
    });
  } catch (e) {
    console.error('❌ Push notification registration failed:', e);
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

/**
 * Lightweight: ensure channel exists and refresh FCM token when app comes to foreground.
 * Use this to keep token in sync (e.g. after token rotation) so Cloud doesn't send to stale token.
 */
export async function refreshFcmTokenOnForeground(): Promise<void> {
  const user = auth().currentUser;
  if (!user) return;

  const messagingInstance = await getMessaging();
  if (!messagingInstance) return;

  try {
    if (Platform.OS === 'android') {
      await ensureAndroidNotificationChannel();
    }
    const token = await messagingInstance().getToken();
    if (!token) return;
    const doc = await firestore().collection('users').doc(user.uid).get();
    const currentToken = doc.data()?.fcmToken;
    if (currentToken !== token) {
      await firestore().collection('users').doc(user.uid).update({
        fcmToken: token,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('📱 FCM token refreshed on foreground and saved to Firestore');
    }
  } catch (e) {
    console.warn('📱 Refresh FCM token on foreground failed:', e);
  }
}

/**
 * Check notification permission status
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    const messagingInstance = await getMessaging();
    if (!messagingInstance) return false;
    const authStatus = await messagingInstance().hasPermission();
    return authStatus === messagingInstance.AuthorizationStatus.AUTHORIZED ||
           authStatus === messagingInstance.AuthorizationStatus.PROVISIONAL;
  }
  
  const apiLevel = Platform.OS === 'android' ? Number(Platform.Version) : 0;
  if (apiLevel < 33) return true; // ก่อน Android 13 ไม่ต้องขอ runtime
  
  try {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return result;
  } catch {
    return false;
  }
}

/**
 * Setup FCM message handlers for foreground and background notifications
 * Call this once when app starts (in App.tsx)
 */
export async function setupFCMHandlers(): Promise<() => void> {
  console.log('🔧 Setting up FCM handlers...');
  const messagingInstance = await getMessaging();
  
  if (!messagingInstance) {
    console.warn('❌ FCM messaging not available');
    return () => {};
  }

  console.log('✅ FCM messaging instance obtained');

  // Ensure expo will show notifications while the app is in foreground.
  // This is required because by default some platforms may suppress alerts in foreground.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Handle foreground messages (when app is open)
  const unsubscribeForeground = messagingInstance().onMessage(async (remoteMessage) => {
    console.log('📨 FCM foreground message received:', JSON.stringify(remoteMessage, null, 2));
    
    if (remoteMessage.notification) {
      console.log('📨 Notification payload:', {
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
      });
      
      // Show local notification when app is in foreground
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || 'Safe & Sound',
            body: remoteMessage.notification.body || '',
            data: remoteMessage.data || {},
            sound: true,
            // Ensure it uses the same Android notification channel as FCM.
            android: {
              channelId: 'fcm_fallback_notification_channel',
              priority: 'high',
            },
          },
          trigger: null, // Show immediately
        });
        console.log('✅ Local notification shown for foreground message, ID:', notificationId);
      } catch (error) {
        console.error('❌ Failed to show local notification:', error);
      }
    } else {
      console.warn('⚠️ FCM message received but no notification payload');
    }
  });

  console.log('✅ Foreground message handler registered');

  // Handle notification taps (when user taps notification)
  const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('🔔 Notification tapped:', response);
    const data = response.notification.request.content.data;
    // You can navigate to specific screen based on notification type here
    // Example: navigation.navigate('NotificationScreen', { notifId: data.notifId });
  });

  // Handle background messages (when app is in background)
  // Note: setBackgroundMessageHandler must be called outside of React component
  // It's typically registered in index.js or a separate background handler file
  // For now, background messages are handled automatically by the system

  // Return cleanup function
  return () => {
    unsubscribeForeground();
    notificationResponseSubscription.remove();
  };
}
