// ============================================================
// File ini adalah satu-satunya tempat konfigurasi Firebase
// Semua halaman import dari sini agar config selalu konsisten
// Ganti nilai di bawah dengan config Firebase asli kamu
// ============================================================

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
            apiKey: "AIzaSyD6AqPbmW4UM1d1o8caBWSIi61yQsxxsGk",
            authDomain: "qr-absensi-unandnewgame.firebaseapp.com",
            projectId: "qr-absensi-unandnewgame",
            storageBucket: "qr-absensi-unandnewgame.firebasestorage.app",
            messagingSenderId: "377822320778",
            appId: "1:377822320778:web:f7305bb71019f670ccf573"
};

// Pastikan Firebase hanya diinisialisasi sekali
// Ini mencegah session reset saat pindah halaman
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };