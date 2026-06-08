// Firebase client SDK initialization.
// Config dibaca dari environment variables — JANGAN hardcode nilai asli di sini.
// Isi nilai di apps/web/.env.local untuk development lokal.
// Isi nilai di Vercel project settings untuk production.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

console.log("FIREBASE ENV CHECK", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "OK" : "MISSING",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "OK" : "MISSING",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "OK" : "MISSING",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "OK" : "MISSING",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "OK" : "MISSING",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "OK" : "MISSING",
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ── SSR-safe initialization ────────────────────────────────────────────────
// getAuth/getFirestore may throw during Next.js build/SSR if Firebase env vars
// are missing or invalid. Wrapping in try-catch prevents build-time crashes.
// On the client, these will initialize properly when NEXT_PUBLIC_FIREBASE_*
// vars are embedded at build time (Vercel project settings / .env.local).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let auth: Auth = null as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: Firestore = null as any;

try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch {
  // Expected during SSR prerender when NEXT_PUBLIC_FIREBASE_* env vars are not set.
  // Firebase initializes properly in the browser where env vars are embedded.
  if (typeof window === 'undefined') {
    // Server/build: warn silently — not an error, pages are still served correctly
    // eslint-disable-next-line no-console
    console.warn('[Firebase] Skipping initialization during SSR (no API key set).');
  }
}

export { app, auth, db };
