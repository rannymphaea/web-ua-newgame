// ============================================================
// BADGE DEFINITIONS -- NEWGAME Badge System
// ============================================================
// File ini berisi semua definisi badge.
// Untuk menambah badge baru, tambahkan object baru ke array BADGES.
// Untuk mengubah syarat, edit field "condition".
// Untuk menambah kategori baru, tambahkan ke array BADGE_CATEGORIES.
// Untuk menambah rarity baru, tambahkan ke array BADGE_RARITIES.
//
// Ditentukan oleh: Presiden Pixel
// ============================================================

// --- RARITY LEVELS ---
// Ubah warna dan label di sini jika ingin ganti tema visual
export const BADGE_RARITIES = [
  { id: 'common',       label: 'Common',       color: '#9ca3af', glow: false },
  { id: 'uncommon',     label: 'Uncommon',     color: '#22c55e', glow: false },
  { id: 'rare',         label: 'Rare',         color: '#3b82f6', glow: true },
  { id: 'epic',         label: 'Epic',         color: '#a855f7', glow: true },
  { id: 'legendary',    label: 'Legendary',    color: '#f59e0b', glow: true },
  { id: 'mythic',       label: 'Mythic',       color: '#ef4444', glow: true },
  { id: 'transcendent', label: 'Transcendent', color: '#ec4899', glow: true },
  { id: 'secret',       label: 'Secret',       color: '#6b7280', glow: false },
  { id: 'limited',      label: 'Limited',      color: '#14b8a6', glow: true },
  { id: 'founder',      label: 'Founder',      color: '#fbbf24', glow: true },
];

// --- BADGE CATEGORIES ---
// Tambah kategori baru di sini
export const BADGE_CATEGORIES = [
  { id: 'attendance',     label: 'Attendance & Consistency' },
  { id: 'xp',             label: 'XP & Progression' },
  { id: 'leaderboard',    label: 'Leaderboard & Competitive' },
  { id: 'event',          label: 'Event Participation' },
  { id: 'community',      label: 'Community & Social' },
  { id: 'organization',   label: 'Organization & Staff' },
  { id: 'gaming',         label: 'Gaming & Esports' },
  { id: 'website',        label: 'Website & System Activity' },
  { id: 'achievement',    label: 'Achievement & Milestone' },
  { id: 'seasonal',       label: 'Seasonal & Limited Event' },
  { id: 'hidden',         label: 'Hidden & Secret' },
  { id: 'collaboration',  label: 'Collaboration & Partnership' },
  { id: 'academic',       label: 'Academic & Educational' },
  { id: 'creative',       label: 'Creative & Media' },
  { id: 'leadership',     label: 'Leadership & Contribution' },
  { id: 'exploration',    label: 'Exploration & Activity' },
  { id: 'legacy',         label: 'Legacy & Historical' },
  { id: 'technical',      label: 'Technical & Development' },
  { id: 'support',        label: 'Support & Volunteer' },
  { id: 'elite',          label: 'Elite & Prestige' },
];

// --- BADGE DEFINITIONS ---
// condition.type: 'auto' = otomatis diberikan saat syarat terpenuhi
// condition.type: 'manual' = diberikan manual oleh Presiden Pixel / admin
// condition.type: 'hidden' = syarat tidak ditampilkan ke user
// condition.type: 'seasonal' = hanya tersedia di periode tertentu
//
// condition.check: nama fungsi pengecekan di BadgesService
// condition.value: nilai threshold
//
// Tambah badge baru: copy salah satu object, ubah id, name, dan condition
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  icon: string; // nama icon atau URL gambar (bisa diisi nanti)
  condition: {
    type: 'auto' | 'manual' | 'hidden' | 'seasonal';
    check?: string;
    value?: number;
    note?: string; // catatan internal
  };
}

export const BADGES: BadgeDefinition[] = [
  // ============================================================
  // ATTENDANCE & CONSISTENCY
  // ============================================================
  { id: 'first_scan', name: 'First Scan', description: 'Scan QR untuk pertama kali', category: 'attendance', rarity: 'common', icon: 'scan', condition: { type: 'auto', check: 'attendanceCount', value: 1 } },
  { id: 'regular_5', name: 'Regular Member', description: 'Hadir 5 kali', category: 'attendance', rarity: 'common', icon: 'calendar', condition: { type: 'auto', check: 'attendanceCount', value: 5 } },
  { id: 'dedicated_10', name: 'Dedicated', description: 'Hadir 10 kali', category: 'attendance', rarity: 'uncommon', icon: 'calendar', condition: { type: 'auto', check: 'attendanceCount', value: 10 } },
  { id: 'committed_25', name: 'Committed', description: 'Hadir 25 kali', category: 'attendance', rarity: 'rare', icon: 'calendar', condition: { type: 'auto', check: 'attendanceCount', value: 25 } },
  { id: 'ironman_50', name: 'Iron Man', description: 'Hadir 50 kali', category: 'attendance', rarity: 'epic', icon: 'shield', condition: { type: 'auto', check: 'attendanceCount', value: 50 } },
  { id: 'streak_5', name: 'Streak Starter', description: 'Streak 5 kehadiran berturut', category: 'attendance', rarity: 'uncommon', icon: 'fire', condition: { type: 'auto', check: 'streak', value: 5 } },
  { id: 'streak_10', name: 'Streak Master', description: 'Streak 10 kehadiran berturut', category: 'attendance', rarity: 'rare', icon: 'fire', condition: { type: 'auto', check: 'streak', value: 10 } },
  { id: 'streak_25', name: 'Unstoppable', description: 'Streak 25 kehadiran berturut', category: 'attendance', rarity: 'legendary', icon: 'fire', condition: { type: 'auto', check: 'streak', value: 25 } },

  // ============================================================
  // XP & PROGRESSION
  // ============================================================
  { id: 'xp_100', name: 'XP Hunter', description: 'Kumpulkan 100 XP', category: 'xp', rarity: 'common', icon: 'zap', condition: { type: 'auto', check: 'xpCache', value: 100 } },
  { id: 'xp_500', name: 'XP Collector', description: 'Kumpulkan 500 XP', category: 'xp', rarity: 'uncommon', icon: 'zap', condition: { type: 'auto', check: 'xpCache', value: 500 } },
  { id: 'xp_1000', name: 'XP Hoarder', description: 'Kumpulkan 1000 XP', category: 'xp', rarity: 'rare', icon: 'zap', condition: { type: 'auto', check: 'xpCache', value: 1000 } },
  { id: 'xp_5000', name: 'XP Legend', description: 'Kumpulkan 5000 XP', category: 'xp', rarity: 'legendary', icon: 'zap', condition: { type: 'auto', check: 'xpCache', value: 5000 } },
  { id: 'level_5', name: 'Level 5', description: 'Mencapai level 5', category: 'xp', rarity: 'uncommon', icon: 'star', condition: { type: 'auto', check: 'level', value: 5 } },
  { id: 'level_10', name: 'Level 10', description: 'Mencapai level 10', category: 'xp', rarity: 'rare', icon: 'star', condition: { type: 'auto', check: 'level', value: 10 } },
  { id: 'level_25', name: 'Level 25', description: 'Mencapai level 25', category: 'xp', rarity: 'epic', icon: 'star', condition: { type: 'auto', check: 'level', value: 25 } },

  // ============================================================
  // LEADERBOARD & COMPETITIVE
  // ============================================================
  { id: 'top_10', name: 'Top 10', description: 'Masuk top 10 leaderboard', category: 'leaderboard', rarity: 'rare', icon: 'trophy', condition: { type: 'auto', check: 'leaderboardRank', value: 10 } },
  { id: 'top_3', name: 'Podium Finish', description: 'Masuk top 3 leaderboard', category: 'leaderboard', rarity: 'epic', icon: 'trophy', condition: { type: 'auto', check: 'leaderboardRank', value: 3 } },
  { id: 'top_1', name: 'Champion', description: 'Peringkat 1 leaderboard', category: 'leaderboard', rarity: 'legendary', icon: 'crown', condition: { type: 'auto', check: 'leaderboardRank', value: 1 } },
  { id: 'player_of_season', name: 'Player of the Season', description: 'Pemain terbaik musim ini', category: 'leaderboard', rarity: 'mythic', icon: 'award', condition: { type: 'manual', note: 'Ditentukan oleh Presiden Pixel setiap akhir semester' } },

  // ============================================================
  // EVENT PARTICIPATION
  // ============================================================
  { id: 'event_5', name: 'Event Goer', description: 'Ikut 5 event berbeda', category: 'event', rarity: 'common', icon: 'calendar', condition: { type: 'auto', check: 'uniqueEvents', value: 5 } },
  { id: 'event_15', name: 'Event Enthusiast', description: 'Ikut 15 event berbeda', category: 'event', rarity: 'uncommon', icon: 'calendar', condition: { type: 'auto', check: 'uniqueEvents', value: 15 } },
  { id: 'event_30', name: 'Event Veteran', description: 'Ikut 30 event berbeda', category: 'event', rarity: 'rare', icon: 'calendar', condition: { type: 'auto', check: 'uniqueEvents', value: 30 } },

  // ============================================================
  // ORGANIZATION & STAFF
  // ============================================================
  { id: 'presiden_pixel', name: 'Presiden Pixel', description: 'Pemimpin NEWGAME', category: 'organization', rarity: 'transcendent', icon: 'crown', condition: { type: 'manual', note: 'Diberikan ke Presiden Pixel aktif' } },
  { id: 'admin_badge', name: 'Admin', description: 'Administrator sistem', category: 'organization', rarity: 'epic', icon: 'shield', condition: { type: 'manual', note: 'Otomatis untuk user dengan role admin' } },
  { id: 'mentor', name: 'Mentor', description: 'Mentor pillar', category: 'organization', rarity: 'rare', icon: 'book', condition: { type: 'manual', note: 'Diberikan oleh Presiden Pixel' } },
  { id: 'panitia', name: 'Panitia', description: 'Panitia event', category: 'organization', rarity: 'uncommon', icon: 'clipboard', condition: { type: 'manual', note: 'Diberikan saat jadi panitia event' } },

  // ============================================================
  // GAMING & ESPORTS
  // ============================================================
  { id: 'mvp', name: 'MVP', description: 'Most Valuable Player', category: 'gaming', rarity: 'legendary', icon: 'star', condition: { type: 'manual', note: 'Ditentukan oleh Presiden Pixel' } },
  { id: 'squad_leader', name: 'Squad Leader', description: 'Pemimpin squad/tim', category: 'gaming', rarity: 'epic', icon: 'flag', condition: { type: 'manual' } },

  // ============================================================
  // LEGACY & HISTORICAL
  // ============================================================
  { id: 'founder', name: 'Founder', description: 'Anggota pendiri NEWGAME', category: 'legacy', rarity: 'founder', icon: 'star', condition: { type: 'manual', note: 'Hanya untuk founder/core team awal' } },
  { id: 'gen_1', name: 'Generasi 1', description: 'Anggota generasi pertama', category: 'legacy', rarity: 'founder', icon: 'flag', condition: { type: 'manual', note: 'Otomatis untuk member generasi 1' } },
  { id: 'gen_2', name: 'Generasi 2', description: 'Anggota generasi kedua', category: 'legacy', rarity: 'rare', icon: 'flag', condition: { type: 'manual' } },

  // ============================================================
  // WEBSITE & SYSTEM ACTIVITY
  // ============================================================
  { id: 'first_login', name: 'Welcome', description: 'Login pertama kali', category: 'website', rarity: 'common', icon: 'log-in', condition: { type: 'auto', check: 'hasLoggedIn', value: 1 } },
  { id: 'profile_complete', name: 'Profile Complete', description: 'Lengkapi profil (username + foto)', category: 'website', rarity: 'common', icon: 'user', condition: { type: 'auto', check: 'profileComplete', value: 1 } },
  { id: 'explorer', name: 'Explorer', description: 'Kunjungi semua halaman', category: 'website', rarity: 'uncommon', icon: 'compass', condition: { type: 'hidden' } },

  // ============================================================
  // HIDDEN & SECRET
  // ============================================================
  { id: 'night_owl', name: 'Night Owl', description: '???', category: 'hidden', rarity: 'secret', icon: 'moon', condition: { type: 'hidden', check: 'nightScan', value: 1, note: 'Scan QR setelah jam 22:00' } },
  { id: 'early_bird', name: 'Early Bird', description: '???', category: 'hidden', rarity: 'secret', icon: 'sun', condition: { type: 'hidden', check: 'earlyScan', value: 1, note: 'Scan QR sebelum jam 07:00' } },
  { id: 'perfect_month', name: 'Perfect Month', description: '???', category: 'hidden', rarity: 'secret', icon: 'award', condition: { type: 'hidden', check: 'perfectMonth', value: 1, note: 'Hadir di semua event dalam 1 bulan' } },

  // ============================================================
  // SEASONAL & LIMITED
  // ============================================================
  { id: 'ramadhan_2026', name: 'Ramadhan 2026', description: 'Aktif selama Ramadhan 2026', category: 'seasonal', rarity: 'limited', icon: 'moon', condition: { type: 'seasonal', note: 'Periode Ramadhan 2026' } },
  { id: 'anniversary_1', name: 'Anniversary', description: 'Merayakan ulang tahun NEWGAME', category: 'seasonal', rarity: 'limited', icon: 'gift', condition: { type: 'seasonal', note: 'Event anniversary tahunan' } },

  // ============================================================
  // ACADEMIC & EDUCATIONAL
  // ============================================================
  { id: 'tutorial_watcher', name: 'Tutorial Watcher', description: 'Tonton 5 tutorial', category: 'academic', rarity: 'common', icon: 'play', condition: { type: 'auto', check: 'tutorialsWatched', value: 5 } },
  { id: 'workshop_attendee', name: 'Workshop Attendee', description: 'Ikut workshop', category: 'academic', rarity: 'uncommon', icon: 'book', condition: { type: 'manual' } },

  // ============================================================
  // CREATIVE & MEDIA
  // ============================================================
  { id: 'media_uploader', name: 'Content Creator', description: 'Upload 10 media', category: 'creative', rarity: 'uncommon', icon: 'image', condition: { type: 'auto', check: 'mediaUploads', value: 10 } },

  // ============================================================
  // LEADERSHIP & CONTRIBUTION
  // ============================================================
  { id: 'loyal_member', name: 'Loyal Member', description: 'Aktif selama 6 bulan berturut', category: 'leadership', rarity: 'epic', icon: 'heart', condition: { type: 'manual', note: 'Dihitung dari tanggal join' } },

  // ============================================================
  // ELITE & PRESTIGE
  // ============================================================
  { id: 'elite_100', name: 'Elite 100', description: 'Hadir 100 kali', category: 'elite', rarity: 'mythic', icon: 'diamond', condition: { type: 'auto', check: 'attendanceCount', value: 100 } },
  { id: 'transcendent', name: 'Transcendent', description: 'Kumpulkan 50 badge', category: 'elite', rarity: 'transcendent', icon: 'infinity', condition: { type: 'auto', check: 'totalBadges', value: 50 } },

  // ============================================================
  // Tambah badge baru di bawah ini
  // Format: { id: 'unique_id', name: 'Nama', description: 'Deskripsi',
  //           category: 'kategori', rarity: 'rarity_level', icon: 'icon_name',
  //           condition: { type: 'auto'|'manual'|'hidden'|'seasonal',
  //                        check: 'nama_field', value: threshold } }
  // ============================================================
];
