'use client';
import { useState, useEffect } from 'react';

// ============================================================
// ANNOUNCEMENT BANNER
// ============================================================
// Untuk mengubah pengumuman:
// 1. Buat dokumen di Firestore collection "announcements"
//    dengan field: title, message, type (info/warning/urgent), active (boolean)
// 2. Atau ubah fallback text di bawah ini
// ============================================================

type AnnouncementType = 'info' | 'warning' | 'urgent';

interface Announcement {
  title: string;
  message: string;
  type: AnnouncementType;
}

const FALLBACK_ANNOUNCEMENT: Announcement = {
  title:   'Selamat datang di NEWGAME Portal',
  message: 'Platform digital organisasi game development Universitas Andalas.',
  type:    'info',
};

const BANNER_COLORS: Record<AnnouncementType, { bg: string; border: string; text: string; icon: string }> = {
  info:    { bg: 'var(--clr-info-bg)',    border: 'var(--clr-info)',    text: 'var(--clr-info)',    icon: 'ri-information-fill' },
  warning: { bg: 'var(--clr-warning-bg)', border: 'var(--clr-warning)', text: 'var(--clr-warning)', icon: 'ri-alert-fill' },
  urgent:  { bg: 'var(--clr-danger-bg)',  border: 'var(--clr-danger)',  text: 'var(--clr-danger)',  icon: 'ri-error-warning-fill' },
};

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed]       = useState(false);

  useEffect(() => {
    // TODO: Replace with API call to /api/announcements once collection is set up
    setAnnouncement(FALLBACK_ANNOUNCEMENT);
  }, []);

  if (!announcement || dismissed) return null;

  const c = BANNER_COLORS[announcement.type] || BANNER_COLORS.info;

  return (
    <div
      role="banner"
      aria-label="Pengumuman"
      style={{
        padding:'12px 20px', marginBottom:20, borderRadius:10,
        background: c.bg, borderLeft:`3px solid ${c.border}`,
        display:'flex', alignItems:'center', gap:12,
      }}
    >
      <i className={c.icon} style={{ fontSize:18, color: c.border, flexShrink:0 }} aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize:13, fontWeight:600, color: c.text, fontFamily:'var(--font-inter)', marginBottom:2 }}>
          {announcement.title}
        </p>
        <p style={{ fontSize:12, color:'var(--clr-text-secondary)', fontFamily:'var(--font-inter)' }}>
          {announcement.message}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Tutup pengumuman"
        style={{ background:'none', border:'none', color:'var(--clr-text-secondary)', cursor:'pointer', padding:0, lineHeight:1 }}
      >
        <i className="ri-close-line" style={{fontSize:16}} aria-hidden="true" />
      </button>
    </div>
  );
}
