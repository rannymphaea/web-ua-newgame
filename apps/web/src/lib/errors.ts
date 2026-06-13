/**
 * Error Mapping Library â€” NEWGAME v0.1.1
 *
 * Memetakan error backend (HTTP status + domain codes) ke pesan
 * Bahasa Indonesia yang ramah pengguna non-teknis.
 */

// â”€â”€ HTTP Status â†’ Pesan Indonesia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Data yang kamu kirim tidak valid',
  401: 'Sesi kamu sudah berakhir, silakan login kembali',
  403: 'Kamu tidak punya akses ke halaman ini',
  404: 'Data tidak ditemukan',
  408: 'Koneksi ke server terlalu lama, coba lagi',
  409: 'Data sudah ada atau terjadi konflik',
  413: 'File terlalu besar untuk diunggah',
  422: 'Data tidak bisa diproses, periksa kembali',
  429: 'Terlalu banyak permintaan, tunggu sebentar',
  500: 'Ada masalah di server kami, coba lagi dalam beberapa saat',
  502: 'Server sedang tidak tersedia, coba lagi nanti',
  503: 'Server sedang dalam pemeliharaan',
  504: 'Server tidak merespons, coba lagi nanti',
};

// â”€â”€ Domain-Specific Error Codes â†’ Pesan Indonesia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const DOMAIN_ERROR_MESSAGES: Record<string, string> = {
  // QR / Attendance
  QR_EXPIRED:          'QR code sudah kadaluarsa',
  QR_ALREADY_USED:     'QR code ini sudah pernah digunakan',
  TOKEN_NOT_FOUND:     'QR code tidak valid',
  TOKEN_USED:          'QR code sudah pernah digunakan',
  TOKEN_EXPIRED:       'QR code sudah kadaluarsa',
  ALREADY_ATTENDED:    'Kamu sudah absen di event ini',
  DEVICE_MISMATCH:     'Perangkat tidak dikenali',

  // Event
  EVENT_CLOSED:        'Event ini sudah ditutup',
  EVENT_NOT_FOUND:     'Event tidak ditemukan',
  EVENT_NOT_ACTIVE:    'Event sedang tidak aktif',

  // Member / Auth
  NOT_MEMBER:          'Kamu belum terdaftar sebagai anggota aktif',
  USER_NOT_FOUND:      'Akun tidak ditemukan',
  USER_NOT_ACTIVE:     'Akun tidak aktif',
  MEMBER_NOT_FOUND:    'ID anggota tidak ditemukan',
  MEMBER_REGISTERED:   'Member ID sudah terdaftar',
  INVALID_PASSWORD:    'Password salah',
  ACCOUNT_SUSPENDED:   'Akun kamu telah dinonaktifkan. Hubungi admin.',
  ACCOUNT_INACTIVE:    'Akun kamu belum diaktifkan oleh admin',
  EMAIL_NOT_VERIFIED:  'Verifikasi email kamu terlebih dahulu',

  // Rate Limit
  RATE_LIMITED:        'Terlalu banyak percobaan, coba lagi dalam beberapa menit',

  // Permission
  FORBIDDEN:           'Kamu tidak punya akses ke fitur ini',
  NPC_FORBIDDEN:       'Akun kamu belum diverifikasi sebagai anggota aktif',
  INSUFFICIENT_ROLE:   'Kamu tidak memiliki izin untuk melakukan ini',

  // Network
  NETWORK_ERROR:       'Tidak ada koneksi internet. Periksa jaringan kamu.',
  TIMEOUT:             'Koneksi ke server terlalu lama, coba lagi',
};

// â”€â”€ ApiError class â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly friendlyMessage: string;

  constructor(statusCode: number, rawMessage: string, code?: string) {
    const friendly = getErrorMessage(statusCode, rawMessage, code);
    super(friendly);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || '';
    this.friendlyMessage = friendly;
  }
}

// â”€â”€ Resolver function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Resolves a raw error into a user-friendly Indonesian message.
 * Priority: domain code â†’ raw message match â†’ HTTP status â†’ generic
 */
export function getErrorMessage(
  statusCode?: number,
  rawMessage?: string,
  code?: string,
): string {
  // 1. Try domain-specific code
  if (code && DOMAIN_ERROR_MESSAGES[code]) {
    return DOMAIN_ERROR_MESSAGES[code];
  }

  // 2. Try matching raw message to known domain errors
  if (rawMessage) {
    const upperMsg = rawMessage.toUpperCase().replace(/\s+/g, '_');
    if (DOMAIN_ERROR_MESSAGES[upperMsg]) {
      return DOMAIN_ERROR_MESSAGES[upperMsg];
    }

    // Check if raw message is already a good Indonesian message
    if (/^[A-Z]/.test(rawMessage) === false && rawMessage.length > 10) {
      // Likely already a human-friendly message from backend
      return rawMessage;
    }
  }

  // 3. Try HTTP status code
  if (statusCode && HTTP_ERROR_MESSAGES[statusCode]) {
    return HTTP_ERROR_MESSAGES[statusCode];
  }

  // 4. Fallback
  return rawMessage || 'Terjadi kesalahan yang tidak diketahui';
}

// â”€â”€ Helper: parse any error into friendly message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function parseError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.friendlyMessage;
  }

  if (error instanceof Error) {
    const msg = error.message;

    // Firebase Auth error codes
    if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
      return 'Password salah';
    }
    if (msg.includes('auth/user-not-found')) {
      return 'Email tidak ditemukan';
    }
    if (msg.includes('auth/too-many-requests')) {
      return 'Terlalu banyak percobaan, coba lagi dalam beberapa menit';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'Email sudah terdaftar';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password terlalu lemah, gunakan minimal 6 karakter';
    }
    if (msg.includes('auth/network-request-failed')) {
      return 'Tidak ada koneksi internet. Periksa jaringan kamu.';
    }
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return 'Tidak ada koneksi internet. Periksa jaringan kamu.';
    }
    if (msg.includes('timeout') || msg.includes('aborted')) {
      return 'Koneksi ke server terlalu lama, coba lagi';
    }

    return msg;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Terjadi kesalahan yang tidak diketahui';
}
