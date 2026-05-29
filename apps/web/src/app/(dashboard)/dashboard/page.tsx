'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { AnnouncementBanner } from '@/components/ui/AnnouncementBanner';

/* Lazy-load berat — tidak block first paint */
const NewsSlider = dynamic(
  () => import('@/components/news/NewsSlider').then(m => ({ default: m.NewsSlider })),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: 220, borderRadius: 16 }} /> }
);

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface DashStats { attendanceCount?: number; streak?: number; badgesCount?: number; }
interface EventDoc  { id: string; title: string; date?: { seconds?: number } | string; status: string; type?: string; }
interface NewsItem  {
  id: string; title: string; excerpt?: string;
  category: 'blog' | 'news' | 'event' | 'tutorial';
  thumbnail?: string; authorName?: string; publishedAt?: unknown;
  createdAt?: { seconds?: number } | string;
  youtubeEmbedId?: string; tutorialCategory?: string;
}

/* ─── Scroll reveal ───────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<Element>('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* SFX cooldown — 600 ms, sama dengan profile page */
const SFX_COOLDOWN_MS = 600;

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { userData, user } = useAuthStore();
  useReveal();

  /* ── Yua click: SFX + bounce ─────────────────────────────────────────────── */
  const sfxCooldownRef  = useRef<boolean>(false);
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const [yuaBouncing, setYuaBouncing] = useState(false);

  const handleYuaClick = useCallback(() => {
    /* Animasi selalu jalan, tapi SFX hanya jika tidak cooldown */
    setYuaBouncing(true);
    setTimeout(() => setYuaBouncing(false), 400);

    if (sfxCooldownRef.current) return;
    sfxCooldownRef.current = true;
    setTimeout(() => { sfxCooldownRef.current = false; }, SFX_COOLDOWN_MS);

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio('/assets/sfx/yua-select.mp3');
      audioRef.current = audio;
      audio.play().catch(() => { /* ignore autoplay policy */ });
    } catch { /* ignore */ }
  }, []);

  /* ── Phase 1: instantly from store ──────────────────────────────────────── */
  const level   = userData?.level    || 1;
  const xpCache = userData?.xpCache  || 0;
  const xpInLv  = xpCache % 100;

  const displayName = userData
    ? (userData.name && !userData.name.includes('@') ? userData.name : (userData.username || 'Kamu'))
    : 'Kamu';

  /* ── Phase 2: fast — dashboard stats only ───────────────────────────────── */
  const [stats,        setStats]        = useState<DashStats>({});
  const [statsLoading, setStatsLoading] = useState(true);

  /* ── Phase 3: deferred — news / rank / events ───────────────────────────── */
  const [events,       setEvents]       = useState<EventDoc[]>([]);
  const [news,         setNews]         = useState<NewsItem[]>([]);
  const [rank,         setRank]         = useState(0);
  const [secondLoaded, setSecondLoaded] = useState(false);

  /* Phase 2: load only stats first — fast */
  useEffect(() => {
    api.get('/users/dashboard')
      .then(r => setStats(r as DashStats))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Phase 3: defer heavy calls until after first paint (100ms) */
  const loadSecondary = useCallback(async () => {
    const [newsRes, lbRes, evRes] = await Promise.all([
      api.get('/news/slider').catch(() => []),
      api.get('/users/leaderboard?limit=50').catch(() => []),
      api.get('/events').catch(() => []),
    ]);
    if (Array.isArray(newsRes)) setNews((newsRes as NewsItem[]).slice(0, 6));
    if (Array.isArray(lbRes) && user?.uid) {
      const idx = (lbRes as { uid?: string }[]).findIndex(u => u.uid === user.uid);
      setRank(idx >= 0 ? idx + 1 : 0);
    }
    const allEv = Array.isArray(evRes) ? evRes as EventDoc[] : [];
    setEvents(allEv.filter(e => e.status === 'open').slice(0, 4));
    setSecondLoaded(true);
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    /* Wait 1 frame after paint, then load secondary data */
    const id = setTimeout(() => { loadSecondary(); }, 100);
    return () => clearTimeout(id);
  }, [loadSecondary]);

  /* Derived */
  const attendance  = stats.attendanceCount ?? userData?.attendanceCount ?? 0;
  const streak      = stats.streak          ?? userData?.streak          ?? 0;
  const badgesCount = stats.badgesCount     ?? 0;

  const STAT_CARDS = [
    { value: attendance,               label: 'Total Hadir',  icon: 'ri-calendar-check-line', color: 'var(--clr-gold)' },
    { value: streak,                   label: 'Streak Hari',  icon: 'ri-fire-line',            color: '#f97316'         },
    { value: rank > 0 ? `#${rank}` : '-', label: 'Peringkat', icon: 'ri-trophy-line',          color: '#a78bfa'         },
    { value: badgesCount,              label: 'Badge',        icon: 'ri-medal-line',            color: '#22d3ee'         },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

      <AnnouncementBanner />

      {/* ── Welcome Hero — rendered IMMEDIATELY from store ─────────────── */}
      <div className="card reveal" style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--clr-bg-secondary) 0%, var(--clr-bg-muted) 100%)',
        minHeight: 190,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--clr-text-secondary)', marginBottom: 6, fontFamily: 'var(--font-display)',
            }}>
              Selamat Datang Kembali
            </p>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700,
              color: 'var(--clr-text-primary)', lineHeight: 1.1, marginBottom: 8,
            }}>
              {displayName}<span style={{ color: 'var(--clr-gold)' }}>!</span>
            </h1>
            <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.93rem', marginBottom: 20 }}>
              Kamu berada di level{' '}
              <strong style={{ color: 'var(--clr-text-primary)' }}>Lv.{level}</strong>{' '}
              dengan total{' '}
              <strong style={{ color: 'var(--clr-gold)' }}>{xpCache.toLocaleString()} XP</strong>.{' '}
              Terus semangat!
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/scan" className="btn btn-primary" style={{ gap: 8 }}>
                <i className="ri-qr-code-line" aria-hidden="true" /> Absen Sekarang
              </Link>
              <Link href="/leaderboard" className="btn btn-ghost" style={{ gap: 8 }}>
                <i className="ri-trophy-line" aria-hidden="true" /> Leaderboard
              </Link>
            </div>
          </div>
          {/* Yua character — clickable, plays SFX + bounce */}
          <div style={{ flexShrink: 0, lineHeight: 0 }}>
            <button
              type="button"
              onClick={handleYuaClick}
              aria-label="Klik Yua!"
              title="Klik aku!"
              className={`yua-btn${yuaBouncing ? ' yua-bounce' : ''}`}
            >
              <img
                src="/yua.png"
                alt="Yua"
                width={180}
                height={200}
                loading="eager"
                decoding="async"
                className="animate-float"
                style={{ height: 'clamp(110px, 16vw, 190px)', width: 'auto', objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
              />
            </button>
          </div>

          <style>{`
            @keyframes yua-bounce {
              0%   { transform: scale(1)    rotate(0deg); }
              25%  { transform: scale(1.12) rotate(-4deg); }
              55%  { transform: scale(0.94) rotate(3deg); }
              80%  { transform: scale(1.05) rotate(-1deg); }
              100% { transform: scale(1)    rotate(0deg); }
            }
            .yua-btn {
              background: none;
              border: none;
              padding: 0;
              cursor: pointer;
              display: block;
              transform-origin: center bottom;
              transition: filter 0.15s ease;
            }
            .yua-btn:hover img {
              filter: drop-shadow(0 0 14px rgba(185, 166, 206, 0.7)) brightness(1.08);
            }
            .yua-btn:active {
              filter: brightness(1.15);
            }
            .yua-btn.yua-bounce {
              animation: yua-bounce 400ms cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
            }
          `}</style>
        </div>

        {/* XP bar inside hero — no extra API needed, from store */}
        <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--clr-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem', color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
            <span>Level {level} → {level + 1}</span>
            <span>{xpInLv} / 100 XP</span>
          </div>
          <div className="glow-progress-track">
            <div
              className="glow-progress-fill"
              style={{ width: `${Math.max(2, xpInLv)}%` }}
              role="progressbar"
              aria-valuenow={xpInLv}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* ── Stat Cards — skeleton while phase-2 loads ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-md)' }}
           className="reveal">
        {STAT_CARDS.map((s, i) =>
          statsLoading
            ? <div key={i} className="skeleton" style={{ height: 88, borderRadius: 16 }} />
            : (
              <div key={i} className="card stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <i className={s.icon} style={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                  fontSize: '2.2rem', color: s.color, opacity: 0.15, pointerEvents: 'none',
                }} aria-hidden="true" />
                <div style={{ fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 700, color: 'var(--clr-text-primary)', lineHeight: 1, marginBottom: 4, fontFamily: 'var(--font-display)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-display)' }}>
                  {s.label}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.5, borderRadius: '0 0 16px 16px' }} />
              </div>
            )
        )}
      </div>

      {/* ── Guidebook Banner ─────────────────────────────────────────── */}
      <a
        href="https://2b-eternity.github.io/test/"
        target="_blank"
        rel="noopener noreferrer"
        className="reveal"
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(253,207,65,0.12) 0%, rgba(167,139,250,0.08) 100%)',
          border: '1px solid rgba(253,207,65,0.3)',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg,rgba(253,207,65,0.18) 0%,rgba(167,139,250,0.12) 100%)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(253,207,65,0.55)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg,rgba(253,207,65,0.12) 0%,rgba(167,139,250,0.08) 100%)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(253,207,65,0.3)';
          }}
        >
          {/* Icon */}
          <div style={{
            flexShrink: 0, width: 52, height: 52,
            borderRadius: 14,
            background: 'rgba(253,207,65,0.15)',
            border: '1px solid rgba(253,207,65,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ri-book-2-line" style={{ fontSize: 24, color: 'var(--clr-gold)' }} aria-hidden="true" />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--clr-gold-dim)', fontFamily: 'var(--font-display)', marginBottom: 3,
            }}>
              Panduan Organisasi
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--clr-text-primary)', marginBottom: 4 }}>
              Guidebook NEWGAME
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-secondary)' }}>
              Struktur organisasi, sistem EXP, pillar, quest, dan aturan kegiatan lengkap.
            </div>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {['Struktur', 'EXP', 'Quest', 'Pillar'].map(tag => (
              <span key={tag} style={{
                padding: '3px 10px', borderRadius: 99,
                background: 'var(--clr-bg-muted)',
                border: '1px solid var(--clr-border)',
                fontSize: '0.72rem', color: 'var(--clr-text-secondary)',
                fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
              }}>{tag}</span>
            ))}
          </div>

          {/* Arrow */}
          <i className="ri-external-link-line" style={{ fontSize: 18, color: 'var(--clr-gold-dim)', flexShrink: 0 }} aria-hidden="true" />
        </div>
      </a>

      {/* ── News Slider — deferred, lazy-loaded ───────────────────────── */}
      <div className="reveal">
        <NewsSlider
          items={news.map(p => ({
            id:               p.id,
            title:            p.title,
            excerpt:          p.excerpt || '',
            category:         p.category || 'news',
            thumbnail:        p.thumbnail,
            authorName:       p.authorName || 'NEWGAME',
            publishedAt:      p.publishedAt ?? p.createdAt ?? null,
            youtubeEmbedId:   p.youtubeEmbedId,
            tutorialCategory: p.tutorialCategory,
          }))}
        />
      </div>

      {/* ── Quick Actions + Events — deferred ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}
           className="reveal">

        {/* Quick actions — static, no API needed */}
        <div className="card">
          <h3 style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-display)' }}>
            Aksi Cepat
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            {[
              { href: '/scan',        icon: 'ri-qr-scan-2-line',    label: 'Scan QR',     color: 'var(--clr-gold)' },
              { href: '/leaderboard', icon: 'ri-bar-chart-box-line', label: 'Leaderboard', color: '#a78bfa' },
              { href: '/news',        icon: 'ri-newspaper-line',     label: 'Berita',      color: '#22d3ee' },
              { href: '/badges',      icon: 'ri-medal-line',         label: 'Badges',      color: '#f97316' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: 'var(--clr-bg-muted)', border: '1px solid var(--clr-border)',
                borderRadius: 'var(--radius-md)', textDecoration: 'none',
                color: 'var(--clr-text-primary)', fontSize: '0.85rem', fontWeight: 500,
                transition: 'all 0.2s ease',
              }}>
                <i className={a.icon} style={{ fontSize: '1.2rem', color: a.color }} aria-hidden="true" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Events — deferred */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <h3 style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-display)' }}>
              Event Mendatang
            </h3>
            <Link href="/calendar" style={{ fontSize: '0.72rem', color: 'var(--clr-gold-dim)', textDecoration: 'none' }}>
              Lihat semua
            </Link>
          </div>
          {!secondLoaded
            ? [1,2,3].map(i => <div key={i} className="skeleton mb-sm" style={{ height: 44, borderRadius: 8 }} />)
            : events.length === 0
              ? <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.85rem' }}>Tidak ada event aktif.</p>
              : events.map(ev => {
                  const d = ev.date;
                  const dt = d
                    ? (typeof d === 'object' && (d as { seconds?: number }).seconds
                        ? new Date((d as { seconds: number }).seconds * 1000)
                        : new Date(d as string))
                    : null;
                  const ok  = dt && !isNaN(dt.getTime());
                  const day = ok ? dt!.getDate().toString().padStart(2,'0') : '--';
                  const mon = ok ? dt!.toLocaleString('id-ID',{month:'short'}).toUpperCase() : '---';
                  return (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--clr-border)' }}>
                      <div style={{ flexShrink: 0, width: 38, height: 38, background: 'var(--clr-bg-muted)', border: '1px solid var(--clr-border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1, color: 'var(--clr-text-primary)', fontFamily: 'var(--font-display)' }}>{day}</span>
                        <span style={{ fontSize: '0.52rem', textTransform: 'uppercase', color: 'var(--clr-text-secondary)', letterSpacing: '0.06em' }}>{mon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ev.type || ev.status}</div>
                      </div>
                    </div>
                  );
                })
          }
        </div>
      </div>

    </div>
  );
}
