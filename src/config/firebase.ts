import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
// Web Client ID from google-services.json
const WEB_CLIENT_ID = '218489558221-mk7gp0j6f26o1irscrnb3aif0fb60jje.apps.googleusercontent.com';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
  });
};

// Initialize Google Sign-In on app start
configureGoogleSignIn();

export { auth, GoogleSignin };
