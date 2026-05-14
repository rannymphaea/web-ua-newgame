// ============================================================
// Konfigurasi Firebase — dipakai di semua halaman
// Ganti nilai di bawah dengan config Firebase kamu
// ============================================================
const FIREBASE_CONFIG = {
            apiKey: "AIzaSyD6AqPbmW4UM1d1o8caBWSIi61yQsxxsGk",
            authDomain: "qr-absensi-unandnewgame.firebaseapp.com",
            projectId: "qr-absensi-unandnewgame",
            storageBucket: "qr-absensi-unandnewgame.firebasestorage.app",
            messagingSenderId: "377822320778",
            appId: "1:377822320778:web:f7305bb71019f670ccf573"
};

// ============================================================
// Role hierarchy — urutan dari tertinggi ke terendah
// ============================================================
const ROLES = {
    PRESIDEN: 'presiden',
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    INVENTORI: 'inventori',
    MEMBER: 'member',
    NPC: 'npc'
};

// ============================================================
// Team list — semua team yang ada di organisasi
// ============================================================
const TEAMS = [
    'Core',
    'Project',
    'Training',
    'FamilyGame',
    'Alliance',
    'Inventory',
    'DesignCraft',
    'NewMember'
];

// ============================================================
// Status anggota
// ============================================================
const MEMBER_STATUS = {
    ACTIVE: 'ACTIVE',
    AFK: 'AFK',
    RESIGN: 'RESIGN',
    GLORY: 'GLORY',
    NPC: 'NPC'
};

// ============================================================
// Password validation — standar yang harus dipenuhi
// Dipakai di semua form yang ada input password
// ============================================================
function validatePassword(password) {
    const checks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*]/.test(password)
    };
    const isValid = Object.values(checks).every(Boolean);
    return { isValid, checks };
}

// ============================================================
// Device fingerprint — kombinasi sinyal device
// Dipakai untuk binding QR ke device saat absen
// ============================================================
async function generateFingerprint() {
    const components = [
        navigator.userAgent,
        screen.width + 'x' + screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
        navigator.hardwareConcurrency || 0
    ];

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('NEWGAME-fp-2026', 2, 2);
        components.push(canvas.toDataURL());
    } catch (e) {}

    const str = components.join('|');
    const buffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(str)
    );
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ============================================================
// Auto logout setelah 30 menit tidak aktif
// Dipanggil di setiap halaman yang butuh auth
// ============================================================
function setupAutoLogout(auth, signOut) {
    let timeout;
    const TIMEOUT_MS = 30 * 60 * 1000; // 30 menit

    function resetTimer() {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            await signOut(auth);
            window.location.href = '/public/pages/login.html';
        }, TIMEOUT_MS);
    }

    // Reset timer setiap ada aktivitas user
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
        .forEach(event => document.addEventListener(event, resetTimer, true));

    resetTimer();
}

// ============================================================
// Format tanggal ke bahasa Inggris
// ============================================================
function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================================
// Hitung level dari XP
// Setiap 100 XP = 1 level
// ============================================================
function calculateLevel(xp) {
    const level = Math.floor(xp / 100) + 1;
    const progress = xp % 100;
    const nextLevelXP = level * 100;
    return { level, progress, nextLevelXP };
}

// ============================================================
// Generate password sementara
// Format memenuhi standar: huruf besar, angka, karakter unik
// ============================================================
function generateTempPassword() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%';
    const rand = (str) => str[Math.floor(Math.random() * str.length)];
    return rand(upper) + rand(lower) + rand(lower) + rand(lower) +
           rand(numbers) + rand(numbers) + rand(special) + rand(lower);
}