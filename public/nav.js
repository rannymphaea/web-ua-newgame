// ============================================================
// Navigasi terpusat — semua path ada di sini
// Jika ada perubahan path, cukup ubah di file ini saja
// ============================================================

export const PATHS = {
    login:          '/public/pages/login.html',
    dashboard:      '/public/pages/dashboard.html',
    admin:          '/public/pages/admin.html',
    members:        '/public/pages/members.html',
    leaderboard:    '/public/pages/leaderboard.html',
    logs:           '/public/pages/logs.html',
    changePassword: '/public/pages/change-password.html',
    scanQR:         '/index.html',
};

// Redirect helper
export function goTo(page) {
    window.location.href = PATHS[page] || PATHS.dashboard;
}

// Cek role apakah boleh akses halaman admin
export function canAccessAdmin(role) {
    return ['admin', 'inventori', 'superadmin', 'presiden'].includes(role);
}

// Cek role apakah boleh akses import CSV
export function canImportCSV(role) {
    return ['superadmin', 'presiden'].includes(role);
}

// Cek role apakah boleh edit XP
export function canEditXP(role) {
    return ['inventori', 'admin', 'superadmin', 'presiden'].includes(role);
}

// Cek role apakah boleh generate QR dan manage event
export function canManageEvents(role) {
    return ['admin', 'superadmin', 'presiden'].includes(role);
}