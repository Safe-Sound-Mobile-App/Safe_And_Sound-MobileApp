// firebaseConfig.js
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // เอาออกก่อนถ้ายังไม่ใช้ หรือไว้บรรทัดล่างสุด

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD7W-UHAyNBwQ-JLAS26HSq6JCcIrSWwng",
  authDomain: "safe-and-sound-ske19.firebaseapp.com",
  projectId: "safe-and-sound-ske19",
  storageBucket: "safe-and-sound-ske19.firebasestorage.app", // แก้จาก .firebasestorage.app เป็น .appspot.com ถ้ามีปัญหา Storage (แต่ปกติค่านี้ใช้ได้)
  messagingSenderId: "218489558221",
  appId: "1:218489558221:web:979be6fc492487722d4584",
  measurementId: "G-0YF6STHR0L"
};

// 1. สร้าง app ก่อน (ย้ายขึ้นมาบนสุด)
const app = initializeApp(firebaseConfig);

// 2. แล้วค่อยสร้าง auth โดยอิงจาก app
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// const analytics = getAnalytics(app);

// 3. ส่งออกทั้งคู่
export { app, auth };