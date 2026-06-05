// Firebase client SDK initialization.
// Config dibaca dari environment variables — JANGAN hardcode nilai asli di sini.
// Isi nilai di apps/web/.env.local untuk development lokal.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const required = (key: string): string => {
  const val = process.env[key];
  if (!val && typeof window !== 'undefined') {
    // Warning di browser — tidak crash app, tapi Firebase akan gagal connect
    console.warn(`[Firebase] Missing env var: ${key}`);
  }
  return val || '';
};

const firebaseConfig = {
  apiKey:            required('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain:        required('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId:         required('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket:     required('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: required('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId:             required('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export { app, auth, db };
