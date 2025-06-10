// Firebase設定とFirestore初期化

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDlZ7D_e0Lk2av9CKXKYnj2iHrO_ezSIMw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mustle-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mustle-app",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mustle-app.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "524642855338",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:524642855338:web:87d000be2793f7877d23d3",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-FQP8M37FD9"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firestore初期化
export const db = getFirestore(app);

// Auth初期化
export const auth = getAuth(app);

// Analytics初期化（本番環境のみ）
export const analytics = typeof window !== 'undefined' && process.env.NODE_ENV === 'production' 
  ? getAnalytics(app) 
  : null;

// 開発環境でのエミュレーター接続（オプション）
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.log('エミュレーターはすでに接続されています');
  }
}

export default app;