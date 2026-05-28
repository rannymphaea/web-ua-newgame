// ============================================================
// PILLAR LEVEL SYSTEM -- NEWGAME
// ============================================================
// Setiap pillar memiliki 4 level dengan warna berbeda.
// Syarat naik level ditentukan oleh Presiden Pixel.
// Logo masing-masing divisi bisa ditambahkan di field "logo".
//
// Untuk mengubah level, warna, atau syarat:
// Edit array PILLAR_LEVELS di bawah ini.
// ============================================================

export const PILLARS = [
  { id: 'game_logic', name: 'Game Logic', logo: '' },
  { id: 'game_design', name: 'Game Design', logo: '' },
  { id: 'game_sound', name: 'Game Sound', logo: '' },
];

// Level 1-4, warna berbeda per level
// requirements: diisi oleh Presiden Pixel
export const PILLAR_LEVELS = [
  { level: 1, label: 'Beginner',     color: '#22c55e', requirements: 'Ditentukan oleh Presiden Pixel' },
  { level: 2, label: 'Intermediate', color: '#3b82f6', requirements: 'Ditentukan oleh Presiden Pixel' },
  { level: 3, label: 'Advanced',     color: '#a855f7', requirements: 'Ditentukan oleh Presiden Pixel' },
  { level: 4, label: 'Expert',       color: '#f59e0b', requirements: 'Ditentukan oleh Presiden Pixel' },
];
