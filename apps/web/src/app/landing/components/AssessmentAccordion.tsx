'use client';
import { useState, useCallback } from 'react';
import { useKalimba } from './useKalimba';

const TABS = [
  {
    id: 'task',
    label: 'TASK',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
    content: (
      <>
        <p><strong>Pembagian Task</strong> (diberikan berdasarkan task yang dikerjakan):</p>
        <div className="popup-line">1. <strong>Task Keorganisasian</strong> — aktivitas dari quest masing-masing.</div>
        <div className="popup-line">2. <strong>Task yang berkaitan dengan game</strong> — kontribusi nyata terhadap pengembangan game (coding, desain, ide, testing, dll).</div>
        <div className="popup-line">3. <strong>Task Request</strong> — tugas yang ingin dibagikan ke quest yang lain.</div>
      </>
    ),
  },
  {
    id: 'tingkatan',
    label: 'TINGKATAN',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14V8M14 14V8M8 2h8l-1 6H9L8 2z"/>
      </svg>
    ),
    content: (
      <>
        <p><strong>Tingkatan Anggota Terdiri Dari:</strong></p>
        <div className="popup-line"><strong>Anggota Fighter</strong> — Anggota on fire! Aktif dan punya EXP tertinggi.</div>
        <div className="popup-line"><strong>Anggota Biasa</strong> — EXP rata-rata dan kadang-kadang izin.</div>
        <div className="popup-line"><strong>Anggota NPC</strong> — Belum bisa aktif karena sibuk. Pergerakannya seperti NPC!</div>
      </>
    ),
  },
  {
    id: 'jenis',
    label: 'JENIS ANGGOTA',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z"/>
      </svg>
    ),
    content: (
      <>
        <p><strong>Jenis-Jenis Anggota:</strong></p>
        <div className="popup-line"><strong>Trainee</strong> — Anggota weekly training yang belum eligible/berhak menyentuh project apapun.</div>
        <div className="popup-line"><strong>Associate</strong> — Boleh menyentuh project, tapi hanya tugas-tugas kecil yang tidak memberikan influence.</div>
        <div className="popup-line"><strong>Soldat</strong> — Pemain inti yang berhak masuk ke project GOTS/Group Project.</div>
        <p style={{fontStyle:'italic',marginTop:12,fontSize:'0.9rem',color:'var(--color-text-muted)'}}>*PS: Seluruh rank masih boleh mengikuti study weekly.</p>
      </>
    ),
  },
  {
    id: 'syarat',
    label: 'SYARAT ASSOCIATE',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/>
      </svg>
    ),
    content: (
      <>
        <p><strong>Cara Mengetahui Anggota Eligible:</strong></p>
        <div className="popup-line">1. Rajin datang di training (absensi training akan dinilai).</div>
        <div className="popup-line">2. Selalu buat tugas training (Trainer memberikan nilai pada tiap murid, nilai akan dikumpulkan untuk penilaian akhir).</div>
        <div className="popup-line">3. Untuk naik Rank, Trainee harus mengumpulkan nilai (nilainya akan dihitung).</div>
      </>
    ),
  },
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
          >
            <span className="assess-btn-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Popup overlay — below grid */}
      {TABS.map(tab => (
        <div
          key={tab.id}
          id={`popup-${tab.id}`}
          className={`assess-popup${openId === tab.id ? ' active' : ''}`}
          role="region"
          aria-labelledby={`assess-btn-${tab.id}`}
        >
          <button
            className="assess-close"
            aria-label="Tutup"
            onClick={() => setOpenId(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div className="assess-content">
            {tab.content}
          </div>
        </div>
      ))}
    </div>
  );
}
