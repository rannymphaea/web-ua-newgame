// ALLOWED - Data constants for NEWGAME Landing Page (from guidebook)
// Bagian ini aman untuk diedit. Konten teks, links, warna rank, dsb. bisa diubah di sini.
// All icons use SVG paths — no emojis. Replaceable via /public/icons/ images.

export const MISI_LIST = [
  'Menyediakan ruang belajar dan pengembangan bagi mahasiswa yang tertarik di bidang game development.',
  'Menciptakan game yang edukatif, inovatif, dan membanggakan Universitas Andalas.',
  'Menyelenggarakan pelatihan, workshop, dan mentoring secara rutin.',
  'Mengadakan kompetisi internal maupun eksternal guna menumbuhkan semangat kompetitif.',
  'Menjalin kemitraan strategis dengan industri dan komunitas game.',
  'Berpartisipasi aktif dalam kompetisi seperti Game Jam dan Gemastik.',
  'Mendorong lahirnya peluang kerja baru melalui pengembangan game.',
  'Mengedukasi mahasiswa untuk mengubah pola konsumtif menjadi produktif.',
];

// SVG icon paths (d attribute for <path>)
export const ICONS = {
  // Main Core roles
  president: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', // star/crown
  commander: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6-7.6 7.6-1.6-1.6a1 1 0 00-1.4 1.4l1.6 1.6-2.6 2.6a1 1 0 001.4 1.4l2.6-2.6 1.6 1.6a1 1 0 001.4-1.4l-1.6-1.6 7.6-7.6 1.6 1.6a1 1 0 001.4-1.4l-4.6-4.6z', // sword
  questKeeper: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8', // document
  goldGuardian: 'M12 1v4M12 19v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M1 12h4M19 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83', // sun/gold
  // Section icons
  visi: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', // eye/vision
  misi: 'M13 10V3L4 14h7v7l9-11h-7z', // lightning/mission
  // Pillars
  logic: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', // code
  design: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', // layers
  sound: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z', // music
  // Quests
  humas: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', // users
  riset: 'M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m14 0h2M3 15h2m14 0h2M7 11h10v2H7z', // microscope/grid
  event: 'M6 9l6 6 6-6', // trophy simplified
  media: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z', // camera
  // EXP system
  exp: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', // bolt
  rank: 'M12 15l-2 5-3-3-4 1 2-4-3-3h4L12 2l2 9h4l-3 3 2 4-4-1-3 3z', // medal
  eligible: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3', // check-circle
  // Projects
  alpha: 'M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', // lightbulb
  beta: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5', // rocket/cursor
  gots: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', // star
  // Generic
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z',
  book: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  arrowUpRight: 'M7 17l9.2-9.2M17 17V7.8H7.8',
  trophy: 'M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 22V8M14 22V8M8 2h8l-1 6H9L8 2z',
};

export const MAIN_CORE = [
  { role: 'Code Commander', desc: 'Wakil Presiden', icon: ICONS.commander, color: '#3b82f6' },
  { role: 'Quest Keeper', desc: 'Sekretaris', icon: ICONS.questKeeper, color: '#a855f7' },
  { role: 'Gold Guardian', desc: 'Bendahara', icon: ICONS.goldGuardian, color: '#fbbf24' },
];

export const PILLARS = [
  {
    name: 'Game Logic', color: '#3b82f6', cls: 'logic',
    desc: 'Dasar pembuatan game yang pertama adalah program! Di Pillar Game Logic kamu belajar lebih lanjut tentang pemrograman, fisika dalam game, dan bagaimana kode bisa mempengaruhi game.',
    icon: ICONS.logic,
  },
  {
    name: 'Game Design', color: '#a855f7', cls: 'design',
    desc: 'Design sangat menentukan! Di Pillar Game Design kamu belajar cara mendesain UI dalam game, serta bagaimana karakter bergerak secara 2D maupun 3D.',
    icon: ICONS.design,
  },
  {
    name: 'Game Sound', color: '#22c55e', cls: 'sound',
    desc: 'Pernah main game tanpa suara? Di sini kamu belajar sound effect, music background, dan cara mengisi suara karakter agar game benar-benar terasa hidup.',
    icon: ICONS.sound,
  },
];

export const QUESTS = [
  { name: 'Hubungan Masyarakat', icon: ICONS.humas, color: '#60a5fa' },
  { name: 'Riset & Pengembangan', icon: ICONS.riset, color: '#a78bfa' },
  { name: 'Event & Kompetisi', icon: ICONS.trophy, color: '#fbbf24' },
  { name: 'Media & Dokumentasi', icon: ICONS.media, color: '#f472b6' },
];

export const RANKS = [
  { name: 'Rookie', color: '#6b7280', border: 'rgba(107,114,128,0.3)', bg: 'rgba(107,114,128,0.1)' },
  { name: 'Warrior', color: '#3b82f6', border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.1)' },
  { name: 'Elite', color: '#a855f7', border: 'rgba(168,85,247,0.3)', bg: 'rgba(168,85,247,0.1)' },
  { name: 'Legend', color: '#fbbf24', border: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.1)' },
  { name: 'Mythic', color: '#f87171', border: 'rgba(248,113,113,0.3)', bg: 'rgba(248,113,113,0.1)' },
];

export const PROJECTS = [
  { name: 'Alpha Project', desc: 'Project awal untuk melatih skill dasar game dev. Belajar sambil praktek!', color: '#3b82f6', level: 'I', icon: ICONS.alpha },
  { name: 'Beta Project', desc: 'Project menengah dengan tim kecil. Mulai membangun game yang lebih kompleks.', color: '#a855f7', level: 'II', icon: ICONS.beta },
  { name: 'GOTS', desc: 'Game of The Semester — project besar showcase, puncak karya terbaik NewGame!', color: '#fbbf24', level: 'III', icon: ICONS.gots },
];

export const STATS = [
  { label: 'Anggota', value: 125, suffix: '+' },
  { label: 'Event', value: 50, suffix: '+' },
  { label: 'Generasi', value: 2, suffix: '' },
  { label: 'Pillar', value: 3, suffix: '' },
];

export const FAQS = [
  { q: 'Bagaimana cara bergabung?', a: 'Ikuti open recruitment yang diadakan setiap semester ganjil. Informasi akan diumumkan melalui Instagram resmi @unandnewgame.' },
  { q: 'Apakah harus mahasiswa FTI?', a: 'Tidak. NEWGAME terbuka untuk seluruh mahasiswa aktif Universitas Andalas dari semua jurusan.' },
  { q: 'Apakah perlu pengalaman sebelumnya?', a: 'Tidak perlu! Kami menyediakan pelatihan dari dasar (study weekly) untuk setiap pillar.' },
  { q: 'Apa itu sistem EXP?', a: 'Sistem poin berbasis game. Setiap task yang diselesaikan mendapat EXP yang menentukan rank, penghargaan, dan kesempatan lomba.' },
];

export const CONTACTS = [
  { label: 'Instagram', url: 'https://www.instagram.com/unandnewgame?igsh=dnNzYXlzdW4ybjF5', icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm8.2 2H8A4 4 0 004 8v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 3.5A4.5 4.5 0 1116.5 12 4.49 4.49 0 0112 7.5zM12 9a3 3 0 100 6 3 3 0 000-6z' },
  { label: 'YouTube', url: 'https://youtube.com/@unandnewgame?si=jhjKWiDW2cPwOcHB', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
  { label: 'Email', url: 'mailto:unandnewgame@gmail.com', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5v2l8 5 8-5V6z' },
];
