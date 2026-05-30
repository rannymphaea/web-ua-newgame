'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useKalimba } from './useKalimba';

const QUESTS_STACK = [
  { idx: 0, name: 'FamilyGame Quest',  desc: 'Biro kekeluargaan yang mengatur healing anggota dan mengawasi quest-quest lainnya.',                                                          color: '#335C67' },
  { idx: 1, name: 'Designcraft Quest', desc: 'Divisi medinkraf — mengatur postingan social media NewGame, membuat sertifikat dan design yang dibutuhkan.',                                  color: '#9E2A2B' },
  { idx: 2, name: 'Alliance Quest',    desc: 'Divisi yang bertugas mencari, membuat, dan menjaga hubungan dengan pihak sponsor dan partner.',                                               color: '#E09F3E' },
  { idx: 3, name: 'Inventory Quest',   desc: 'Divisi inventaris — mengatur dan menjaga barang serta aset NewGame, serta kebersihan ruangan yang dipakai.',                                  color: '#335C67' },
  { idx: 4, name: 'Newmember Quest',   desc: 'Divisi open recruitment yang bertugas mengatur dan menyelenggarakan pencarian anggota baru setiap tahunnya.',                                 color: '#9E2A2B' },
  { idx: 5, name: 'Training Quest',    desc: 'Divisi pelatihan skill — menyelenggarakan pelatihan membuat game dan mengawasi perkembangan skill seluruh anggota sesuai pillarnya.',         color: '#335C67' },
  { idx: 6, name: 'Project Quest',     desc: 'Divisi program kerja — mengatur dan mengelola proyek NewGame ke depannya, seperti membuat game ataupun menyelenggarakan GameJam.',            color: '#E09F3E' },
];

const FRET_COLORS = ['#335C67','#9E2A2B','#E09F3E','#335C67','#9E2A2B','#335C67','#E09F3E'];
const MAX_OFFSET = 3;

interface CardStyle {
  transform: string;
  opacity: number;
  zIndex: number;
  pointerEvents: 'auto' | 'none';
}

function computeStyles(active: number, len: number, isMobile: boolean): CardStyle[] {
  const cardSpacing = isMobile ? 40 : 75;
  const spreadDeg = 48;
  const stepDeg = MAX_OFFSET > 0 ? spreadDeg / MAX_OFFSET : 0;

  return QUESTS_STACK.map((_, i) => {
    const raw = i - active;
    const alt = raw > 0 ? raw - len : raw + len;
    const off = len > 1 && Math.abs(alt) < Math.abs(raw) ? alt : raw;
    const abs = Math.abs(off);

    if (abs > MAX_OFFSET) {
      return { transform: 'translate3d(0,0,-600px)', opacity: 0, zIndex: 0, pointerEvents: 'none' };
    }

    const rotateZ = off * stepDeg;
    const x = off * cardSpacing;
    const y = abs * 10;
    const z = -abs * 140;
    const isActive = off === 0;
    const scale  = isActive ? 1.03 : 0.94;
    const lift   = isActive ? -22 : 0;
    const rotX   = isActive ? 0 : 12;

    return {
      transform: `translate3d(${x}px,${y + lift}px,${z}px) rotateX(${rotX}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
      opacity: 1,
      zIndex: 100 - abs,
      pointerEvents: 'auto',
    };
  });
}

export default function QuestStack3D({ soundEnabled }: { soundEnabled: boolean }) {
  const [active, setActive]   = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { playNote }          = useKalimba(soundEnabled);
  const startXRef             = useRef(0);
  const startYRef             = useRef(0);       // FIX C5: track Y too
  const stageRef              = useRef<HTMLDivElement>(null);
  const len                   = QUESTS_STACK.length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const go = useCallback((idx: number) => {
    setActive(idx);
    playNote(idx);
  }, [playNote]);

  // ── FIX C5: Touch swipe with proper direction detection ──────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onStart = (e: TouchEvent) => {
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - startXRef.current);
      const dy = Math.abs(e.touches[0].clientY - startYRef.current);
      // Only prevent default if clearly horizontal gesture
      if (dx > dy && dx > 8) {
        e.preventDefault();
      }
    };

    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startXRef.current;
      const dy = Math.abs(e.changedTouches[0].clientY - startYRef.current);
      // Ignore if mostly vertical
      if (dy > Math.abs(dx)) return;
      if (dx > 50)  setActive(a => { const n = (a - 1 + len) % len; playNote(n); return n; });
      else if (dx < -50) setActive(a => { const n = (a + 1) % len; playNote(n); return n; });
    };

    stage.addEventListener('touchstart', onStart, { passive: true });
    stage.addEventListener('touchmove',  onMove,  { passive: false }); // non-passive for preventDefault
    stage.addEventListener('touchend',   onEnd,   { passive: true });

    return () => {
      stage.removeEventListener('touchstart', onStart);
      stage.removeEventListener('touchmove',  onMove);
      stage.removeEventListener('touchend',   onEnd);
    };
  }, [len, playNote]);

  const styles = computeStyles(active, len, isMobile);

  return (
    <div className="quest-stack-wrapper">
      <p className="quest-stack-hint">Geser (Swipe) atau Klik kartu untuk melihat divisi lainnya</p>

      <div
        className="quest-stack-stage"
        id="quest-stage"
        ref={stageRef}
        style={{ touchAction: 'pan-y' }} /* allow vertical scroll, JS handles horizontal */
      >
        {QUESTS_STACK.map((q, i) => (
          <div
            key={q.idx}
            className={`q-card${i === active ? ' is-active' : ''}`}
            style={{
              transform:     styles[i].transform,
              opacity:       styles[i].opacity,
              zIndex:        styles[i].zIndex,
              pointerEvents: styles[i].pointerEvents,
            }}
            onClick={() => { if (i !== active) go(i); }}
          >
            <div className="q-fret" style={{ background: FRET_COLORS[q.idx] }} />
            <div className="q-content">
              <div className="q-name" style={{ color: FRET_COLORS[q.idx] }}>{q.name}</div>
              <div className="q-desc">{q.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="q-dots-row" id="q-dots" role="tablist">
        {QUESTS_STACK.map((_, i) => (
          <button
            key={i}
            className={`q-dot${i === active ? ' active' : ''}`}
            aria-label={`Quest ${i + 1}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
