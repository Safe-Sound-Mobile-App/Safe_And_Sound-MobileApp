// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7W-UHAyNBwQ-JLAS26HSq6JCcIrSWwng",
  authDomain: "safe-and-sound-ske19.firebaseapp.com",
  projectId: "safe-and-sound-ske19",
  storageBucket: "safe-and-sound-ske19.firebasestorage.app",
  messagingSenderId: "218489558221",
  appId: "1:218489558221:web:979be6fc492487722d4584",
  measurementId: "G-0YF6STHR0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };