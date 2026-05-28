'use client';
import { useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/lib/theme-engine';

const PAGE_TITLES: Record<string, { title: string; icon: string }> = {
  '/dashboard':       { title: 'Dashboard',        icon: 'ri-dashboard-3-line'   },
  '/scan':            { title: 'Scan QR Code',     icon: 'ri-qr-code-line'       },
  '/news':            { title: 'Berita & Tutorial', icon: 'ri-newspaper-line'     },
  '/leaderboard':     { title: 'Leaderboard',      icon: 'ri-trophy-line'        },
  '/badges':          { title: 'Badge Collection', icon: 'ri-medal-line'         },
  '/profile':         { title: 'Edit Profil',      icon: 'ri-user-3-line'        },
  '/admin':           { title: 'Admin Panel',      icon: 'ri-shield-star-line'   },
  '/admin/analytics': { title: 'Analytics',        icon: 'ri-bar-chart-2-line'   },
  '/admin/news':      { title: 'Kelola Berita',    icon: 'ri-edit-2-line'        },
  '/admin/media':     { title: 'Media Gallery',    icon: 'ri-image-2-line'       },
  '/members':         { title: 'Member Directory', icon: 'ri-team-line'          },
  '/logs':            { title: 'System Logs',      icon: 'ri-file-list-3-line'   },
  '/change-password': { title: 'Change Password',  icon: 'ri-lock-password-line' },
  '/calendar':        { title: 'Kalender Event',   icon: 'ri-calendar-event-line'},
  '/landing':         { title: 'NEWGAME',          icon: 'ri-home-3-line'        },
};

/* ── Compact XP Liquid Bar ─────────────────────────────────────────────────
   Renders as a slim pill: ⚡ 0 XP ══[liquid bar]══ Lv.1
   Total width ~180px. Animates continuously.                               */
function XpLiquidBar({ xp, level }: { xp: number; level: number }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<SVGPathElement>(null);
  const rafRef  = useRef<number>(0);
  const tRef    = useRef(0);

  // Color by level tier
  const color =
    level <= 5  ? '#22d3ee' :
    level <= 15 ? '#a78bfa' :
    level <= 30 ? '#f97316' : '#f87171';

  const glow =
    level <= 5  ? '0 0 8px rgba(34,211,238,0.6)'  :
    level <= 15 ? '0 0 8px rgba(167,139,250,0.6)' :
    level <= 30 ? '0 0 8px rgba(249,115,22,0.6)'  : '0 0 8px rgba(248,113,113,0.6)';

  const progress = Math.min(100, (xp % 100));

  useEffect(() => {
    const W = 200; const amp = 1.8;

    const tick = () => {
      tRef.current += 0.04;
      const t = tRef.current;
      let d = `M0,${amp} `;
      for (let x = 0; x <= W; x += 4) {
        d += `L${x},${amp + amp * Math.sin((x / W) * 2 * Math.PI * 2 + t)} `;
      }
      d += `L${W},8 L0,8 Z`;
      waveRef.current?.setAttribute('d', d);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      title={`${xp.toLocaleString()} XP total — ${progress}% menuju Lv.${level + 1}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--clr-bg-muted)',
        border: '1px solid var(--clr-border)',
        borderRadius: 99, padding: '4px 10px 4px 8px',
        height: 30, flexShrink: 0,
      }}
    >
      {/* Lightning icon */}
      <i className="ri-flashlight-fill" style={{ fontSize: 11, color, flexShrink: 0 }} aria-hidden="true" />

      {/* XP number — compact */}
      <span style={{
        fontSize: 12, fontWeight: 700, color: 'var(--clr-text-primary)',
        fontFamily: 'var(--font-display)', letterSpacing: '0.03em',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {xp.toLocaleString()} XP
      </span>

      {/* Liquid track */}
      <div style={{
        width: 64, height: 6, borderRadius: 3,
        background: 'var(--clr-bg-secondary)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden', position: 'relative', flexShrink: 0,
      }}>
        {/* Fill */}
        <div
          ref={fillRef}
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${Math.max(4, progress)}%`,
            background: color,
            boxShadow: glow,
            borderRadius: 3,
            overflow: 'hidden',
            transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* SVG Wave animation inside fill */}
          <svg
            viewBox="0 0 200 8"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45 }}
          >
            <path ref={waveRef} fill="rgba(255,255,255,0.75)" />
          </svg>
        </div>
      </div>

      {/* Level pill */}
      <span style={{
        fontSize: 10, fontWeight: 800,
        background: color, color: '#0a0a0a',
        borderRadius: 99, padding: '1px 7px',
        fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
        boxShadow: glow, flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        Lv.{level}
      </span>
    </div>
  );
}

/* ── TopBar ────────────────────────────────────────────────────────────────── */
export function TopBar() {
  const { userData } = useAuthStore();
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const pageInfo = PAGE_TITLES[pathname || ''] || { title: 'NEWGAME', icon: 'ri-home-3-line' };

  const level   = userData?.level   || 1;
  const xpCache = userData?.xpCache || 0;

  const displayName = userData
    ? (userData.name && !userData.name.includes('@')
        ? userData.name
        : (userData.username || (userData.email ? userData.email.split('@')[0] : 'User')))
    : null;

  return (
    <header className="topbar" role="banner">
      {/* Left: page title */}
      <div className="topbar-left">
        <i className={`${pageInfo.icon} topbar-page-icon`} aria-hidden="true" />
        <h2 className="topbar-title">{pageInfo.title}</h2>
      </div>

      {/* Right: compact XP pill + dark toggle + user chip */}
      <div className="topbar-right">
        {userData && (
          <>
            <XpLiquidBar xp={xpCache} level={level} />

            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              <i className={isDark ? 'ri-sun-line' : 'ri-moon-line'} style={{ fontSize: 16 }} />
            </button>

            <Link href="/profile" className="topbar-user-chip" title="Edit Profil">
              {userData.photoURL
                ? <img src={userData.photoURL} alt="" className="topbar-avatar-img" />
                : <div className="topbar-avatar" aria-hidden="true">
                    {(userData.name || 'U').charAt(0).toUpperCase()}
                  </div>
              }
              <div className="topbar-user-info hide-mobile">
                <span className="topbar-name">{displayName}</span>
                <span className="topbar-division">{userData.division || userData.role || '-'}</span>
              </div>
              <i className="ri-arrow-down-s-line hide-mobile"
                 style={{ fontSize: 14, color: 'var(--clr-text-secondary)', flexShrink: 0 }}
                 aria-hidden="true" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
