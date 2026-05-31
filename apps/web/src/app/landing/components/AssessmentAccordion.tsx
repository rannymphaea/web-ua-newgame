'use client';
import { useState, useCallback, useMemo } from 'react';
import { useKalimba } from './useKalimba';

interface TabItem {
  title: string;
  desc: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
}

interface Tab {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  footnote?: string;
  items: TabItem[];
}

const TABS: Tab[] = [
  {
    id: 'task',
    label: 'PEMBAGIAN TASK',
    subtitle: 'Distribusi tugas berdasarkan jenis kontribusi anggota',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    ),
    items: [
      {
        title: 'Task Keorganisasian',
        desc: 'Aktivitas rutin dari quest masing-masing untuk menjaga jalannya organisasi.',
        badge: 'Organisasi 🏛️',
        badgeBg: 'rgba(59, 130, 246, 0.12)',
        badgeColor: '#3b82f6',
      },
      {
        title: 'Task Game Dev',
        desc: 'Kontribusi nyata terhadap pengembangan game (coding, desain, ide, testing, dll).',
        badge: 'Game Dev 🎮',
        badgeBg: 'rgba(34, 197, 94, 0.12)',
        badgeColor: '#22c55e',
      },
      {
        title: 'Task Request',
        desc: 'Tugas khusus dari luar yang ingin dibagikan ke quest lain untuk kolaborasi.',
        badge: 'Request 📬',
        badgeBg: 'rgba(168, 85, 247, 0.12)',
        badgeColor: '#a855f7',
      }
    ]
  },
  {
    id: 'tingkatan',
    label: 'TINGKATAN ANGGOTA',
    subtitle: 'Level keaktifan berdasarkan performa & total EXP',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    items: [
      {
        title: 'Anggota Fighter',
        desc: 'Anggota on fire! Sangat aktif berkontribusi dan memiliki perolehan EXP tertinggi.',
        badge: 'FIGHTER 🔥',
        badgeBg: 'rgba(239, 68, 68, 0.12)',
        badgeColor: '#ef4444',
      },
      {
        title: 'Anggota Biasa',
        desc: 'Memiliki EXP rata-rata, konsisten berpartisipasi, namun kadang-kadang izin.',
        badge: 'BIASA 🛡️',
        badgeBg: 'rgba(245, 158, 11, 0.12)',
        badgeColor: '#f59e0b',
      },
      {
        title: 'Anggota NPC',
        desc: 'Belum bisa aktif karena kesibukan lain. Pergerakannya pasif layaknya NPC!',
        badge: 'NPC 👤',
        badgeBg: 'rgba(107, 114, 128, 0.12)',
        badgeColor: '#9ca3af',
      }
    ]
  },
  {
    id: 'jenis',
    label: 'JENIS ANGGOTA',
    subtitle: 'Kategori keanggotaan dan hak akses project',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    footnote: '*PS: Seluruh rank masih diperbolehkan mengikuti study weekly.',
    items: [
      {
        title: 'Trainee',
        desc: 'Anggota weekly training yang belum eligible/berhak menyentuh project apapun.',
        badge: 'TRAINEE 📖',
        badgeBg: 'rgba(156, 163, 175, 0.12)',
        badgeColor: '#9ca3af',
      },
      {
        title: 'Associate',
        desc: 'Boleh menyentuh project, tapi hanya tugas-tugas kecil yang tidak memberikan pengaruh besar.',
        badge: 'ASSOCIATE 🛠️',
        badgeBg: 'rgba(59, 130, 246, 0.12)',
        badgeColor: '#3b82f6',
      },
      {
        title: 'Soldat',
        desc: 'Pemain inti yang berhak masuk ke project GOTS / Group Project utama.',
        badge: 'SOLDAT ⚔️',
        badgeBg: 'rgba(168, 85, 247, 0.12)',
        badgeColor: '#a855f7',
      }
    ]
  },
  {
    id: 'syarat',
    label: 'SYARAT ELIGIBLE',
    subtitle: 'Kriteria kelayakan kenaikan rank & partisipasi project',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    items: [
      {
        title: 'Kehadiran Training',
        desc: 'Rajin datang di training (absensi training akan dinilai secara rutin).',
        badge: 'ABSENSI ✅',
        badgeBg: 'rgba(16, 185, 129, 0.12)',
        badgeColor: '#10b981',
      },
      {
        title: 'Pengerjaan Tugas',
        desc: 'Selalu membuat tugas training yang diberikan oleh Trainer pada setiap sesi.',
        badge: 'TUGAS 📝',
        badgeBg: 'rgba(14, 165, 233, 0.12)',
        badgeColor: '#0ea5e9',
      },
      {
        title: 'Kenaikan Rank',
        desc: 'Mengumpulkan nilai akhir tugas training yang dihitung untuk kelulusan.',
        badge: 'NILAI 📊',
        badgeBg: 'rgba(245, 158, 11, 0.12)',
        badgeColor: '#f59e0b',
      }
    ]
  }
];

export default function AssessmentAccordion({ soundEnabled }: { soundEnabled: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { playNote } = useKalimba(soundEnabled);

  const toggle = useCallback((id: string) => {
    setOpenId(prev => {
      if (prev === id) return null;
      playNote(2);
      return id;
    });
  }, [playNote]);

  const activeTab = useMemo(() => {
    return TABS.find(tab => tab.id === openId) || null;
  }, [openId]);

  return (
    <div className="assessment-wrapper">
      <div className="assessment-grid">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            id={`assess-btn-${tab.id}`}
            className={`assess-btn${openId === tab.id ? ' active-tab' : ''}`}
            onClick={() => toggle(tab.id)}
            onMouseEnter={() => playNote(i)}
            aria-expanded={openId === tab.id}
          >
            <span className="assess-btn-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Unified Expandable Detail Panel */}
      <div className={`assess-details-panel${activeTab ? ' panel-active' : ''}`}>
        {activeTab && (
          <div className="assess-panel-inner">
            <div className="assess-panel-header">
              <div className="assess-panel-title-area">
                <span className="assess-panel-icon">{activeTab.icon}</span>
                <div>
                  <h3>{activeTab.label}</h3>
                  <p>{activeTab.subtitle}</p>
                </div>
              </div>
              <button
                className="assess-panel-close"
                aria-label="Tutup"
                onClick={() => setOpenId(null)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="assess-panel-body">
              <div className="assess-items-grid">
                {activeTab.items.map((item, idx) => (
                  <div key={idx} className="assess-item-card">
                    <div className="assess-item-meta">
                      <span
                        className="assess-item-badge"
                        style={{
                          backgroundColor: item.badgeBg,
                          color: item.badgeColor,
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
              {activeTab.footnote && (
                <div className="assess-footnote-wrapper">
                  <span className="assess-footnote-icon">ℹ️</span>
                  <p className="assess-footnote">{activeTab.footnote}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
