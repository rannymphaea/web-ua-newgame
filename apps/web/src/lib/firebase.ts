// DO NOT EDIT - Inisialisasi Firebase app. Mengubah config di sini dapat memutus koneksi ke database.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD6AqPbmW4UM1d1o8caBWSIi61yQsxxsGk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'qr-absensi-unandnewgame.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'qr-absensi-unandnewgame',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'qr-absensi-unandnewgame.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '377822320778',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:377822320778:web:f7305bb71019f670ccf573',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
