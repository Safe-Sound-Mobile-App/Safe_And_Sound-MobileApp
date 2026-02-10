import { auth, GoogleSignin } from '../config/firebase';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface AuthResult {
  success: boolean;
  user?: FirebaseAuthTypes.User;
  error?: string;
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    let errorMessage = 'An error occurred during sign up';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    let errorMessage = 'An error occurred during sign in';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get user's ID token
    const { data } = await GoogleSignin.signIn();
    
    if (!data?.idToken) {
      return {
        success: false,
        error: 'Google Sign-In was cancelled or failed',
      };
    }
    
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
    
    // Sign in with the credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    let errorMessage = 'An error occurred during Google sign in';
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      errorMessage = 'Google Sign-In was cancelled';
    } else if (error.code === 'IN_PROGRESS') {
      errorMessage = 'Google Sign-In is already in progress';
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      errorMessage = 'Google Play Services is not available';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<AuthResult> => {
  try {
    // Try to sign out from Google (if applicable)
    // Don't let Google sign out failure prevent Firebase sign out
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
    } catch (googleError) {
      console.log('Google sign out error (non-critical):', googleError);
      // Continue to Firebase sign out even if Google sign out fails
    }
    
    // Sign out from Firebase
    await auth().signOut();
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during sign out',
    };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string): Promise<AuthResult> => {
  try {
    await auth().sendPasswordResetEmail(email);
    return {
      success: true,
    };
  } catch (error: any) {
    let errorMessage = 'An error occurred while sending reset email';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void
) => {
  return auth().onAuthStateChanged(callback);
};
