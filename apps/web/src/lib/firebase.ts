// Firebase client SDK initialization.
// Config dibaca dari environment variables — JANGAN hardcode nilai asli di sini.
// Isi nilai di apps/web/.env.local untuk development lokal.
// Isi nilai di Vercel project settings untuk production.
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ── SSR-safe initialization ────────────────────────────────────────────────
// Do NOT initialize Firebase when API key is missing (SSR / build time).
// On the client, NEXT_PUBLIC_* vars are embedded at build time from Vercel
// project settings or .env.local — initialization happens there.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let app: FirebaseApp = null as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let auth: Auth = null as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: Firestore = null as any;

if (firebaseConfig.apiKey) {
  try {
    app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db   = getFirestore(app);
  } catch {
    // Expected during SSR prerender — Firebase initializes in the browser.
    if (typeof window === 'undefined') {
      // Server/build: warn silently — not an error
      // eslint-disable-next-line no-console
      console.warn('[Firebase] SSR init skipped (no API key at build time).');
    }
  }
}

export { app, auth, db };
