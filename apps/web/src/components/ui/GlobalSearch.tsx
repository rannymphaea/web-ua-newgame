'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  label: string;
  description?: string;
  icon: string;
  href: string;
  category: string;
}

const NAV_ITEMS: SearchResult[] = [
  { label: 'Dashboard', description: 'Halaman utama', icon: 'ri-dashboard-line', href: '/dashboard', category: 'Navigasi' },
  { label: 'Leaderboard', description: 'Peringkat XP', icon: 'ri-trophy-line', href: '/leaderboard', category: 'Navigasi' },
  { label: 'Badges', description: 'Koleksi lencana', icon: 'ri-medal-line', href: '/badges', category: 'Navigasi' },
  { label: 'News', description: 'Berita & tutorial', icon: 'ri-newspaper-line', href: '/news', category: 'Navigasi' },
  { label: 'Calendar', description: 'Jadwal kegiatan', icon: 'ri-calendar-line', href: '/calendar', category: 'Navigasi' },
  { label: 'Scan QR', description: 'Absensi', icon: 'ri-qr-scan-2-line', href: '/scan', category: 'Navigasi' },
  { label: 'Profile', description: 'Profil saya', icon: 'ri-user-line', href: '/profile', category: 'Navigasi' },
  { label: 'Members', description: 'Daftar anggota', icon: 'ri-group-line', href: '/members', category: 'Navigasi' },
  { label: 'Logs', description: 'Riwayat aktivitas', icon: 'ri-file-list-3-line', href: '/logs', category: 'Navigasi' },
  { label: 'Admin Panel', description: 'Manajemen', icon: 'ri-settings-3-line', href: '/admin', category: 'Admin' },
  { label: 'Change Password', description: 'Ganti password', icon: 'ri-lock-password-line', href: '/change-password', category: 'Akun' },
  { label: 'Pirate Map', description: 'Learning roadmap', icon: 'ri-treasure-map-line', href: '/pirate-map', category: 'Navigasi' },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim()
    ? NAV_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : NAV_ITEMS.slice(0, 8);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  // Arrow key navigation
  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].href);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '15vh',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 520,
              background: 'var(--clr-bg-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Search input */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="ri-search-line" style={{ fontSize: 20, color: 'var(--clr-text-secondary)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleInputKeyDown}
                placeholder="Cari halaman, fitur, atau aksi..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontFamily: 'var(--font-inter)', fontSize: 15,
                  color: 'var(--clr-text-primary)',
                }}
              />
              <kbd style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 11,
                background: 'var(--clr-bg-muted)', border: '1px solid var(--clr-border)',
                color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)',
              }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 0' }}>
              {results.length === 0 && (
                <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)', fontSize: 14 }}>
                  Tidak ditemukan
                </div>
              )}
              {results.map((item, i) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', padding: '10px 20px',
                    background: i === selectedIndex ? 'var(--clr-gold-glow)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                >
                  <i className={item.icon} style={{
                    fontSize: 18, width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8,
                    background: i === selectedIndex ? 'var(--clr-gold)' : 'var(--clr-bg-muted)',
                    color: i === selectedIndex ? 'var(--clr-ink)' : 'var(--clr-text-secondary)',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-inter)', fontSize: 14, fontWeight: 600, color: 'var(--clr-text-primary)' }}>
                      {item.label}
                    </div>
                    {item.description && (
                      <div style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-secondary)' }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)', opacity: 0.6 }}>
                    {item.category}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 20px', borderTop: '1px solid var(--clr-border)',
              display: 'flex', gap: 16, justifyContent: 'center',
              fontSize: 11, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)',
            }}>
              <span><kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--clr-bg-muted)', border: '1px solid var(--clr-border)', marginRight: 4 }}>↑↓</kbd> navigasi</span>
              <span><kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--clr-bg-muted)', border: '1px solid var(--clr-border)', marginRight: 4 }}>↵</kbd> buka</span>
              <span><kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--clr-bg-muted)', border: '1px solid var(--clr-border)', marginRight: 4 }}>esc</kbd> tutup</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
