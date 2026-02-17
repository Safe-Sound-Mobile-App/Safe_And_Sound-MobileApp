import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';

import App from './src/App';

// Register background message handler
// This must be called before registerRootComponent
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📨 FCM background message received:', remoteMessage);
  // Background messages are automatically displayed by the system
  // No need to show local notification here
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
