'use client';
import { useState, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   NEWGAME Dev Tools — Web-based Mobile Simulator
   Route: /dev-tools  (hanya untuk development, tidak di-link dari nav)
   ═══════════════════════════════════════════════════════════════ */

const DEVICES = [
  { name: 'iPhone SE',       w: 375, h: 667,  notch: false, os: 'ios',     emoji: '📱' },
  { name: 'iPhone 14',       w: 390, h: 844,  notch: true,  os: 'ios',     emoji: '📱' },
  { name: 'iPhone 14 Pro',   w: 393, h: 852,  notch: true,  os: 'ios',     emoji: '📱' },
  { name: 'Pixel 7',         w: 412, h: 915,  notch: false, os: 'android', emoji: '📱' },
  { name: 'Galaxy S23',      w: 360, h: 780,  notch: false, os: 'android', emoji: '📱' },
  { name: 'Redmi Note 12',   w: 393, h: 873,  notch: false, os: 'android', emoji: '📱' },
  { name: 'iPad Mini',       w: 768, h: 1024, notch: false, os: 'ios',     emoji: '📟', tablet: true },
  { name: 'iPad Air',        w: 820, h: 1180, notch: false, os: 'ios',     emoji: '📟', tablet: true },
] as const;

type Device = typeof DEVICES[number];

const QUICK_LINKS = [
  { label: 'Landing',       path: '/landing',              emoji: '🏠' },
  { label: 'Login',         path: '/login',                emoji: '🔐' },
  { label: 'Dashboard',     path: '/dashboard',            emoji: '📊' },
  { label: 'Leaderboard',   path: '/dashboard/leaderboard',emoji: '🏆' },
  { label: 'Berita',        path: '/dashboard/news',       emoji: '📰' },
  { label: 'Profile',       path: '/dashboard/profile',    emoji: '👤' },
  { label: 'Admin',         path: '/dashboard/admin',      emoji: '⚙️' },
];

export default function DevToolsPage() {
  const [device, setDevice] = useState<Device>(DEVICES[1]);
  const [landscape, setLandscape] = useState(false);
  const [scale, setScale] = useState(0.68);
  const [url, setUrl] = useState('/landing');
  const [inputUrl, setInputUrl] = useState('/landing');
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const devW = landscape ? device.h : device.w;
  const devH = landscape ? device.w  : device.h;
  const isTablet = 'tablet' in device && device.tablet;
  const frameRadius = isTablet ? 20 : 44;
  const topBarH = isTablet ? 0 : device.notch ? 40 : 28;
  const botBarH = isTablet ? 0 : 20;

  function navigate(path: string) {
    const href = path.startsWith('http') ? path : `http://localhost:3000${path}`;
    setUrl(href);
    setInputUrl(path);
    setLoading(true);
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(inputUrl);
  }

  const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#060B11',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      color: '#F0EEF4',
    }}>
      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside style={{
        width: 256, flexShrink: 0,
        background: '#08101A',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{
          padding: '18px 18px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #FDCF41, #B9A6CE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>📱</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#FDCF41', letterSpacing: '0.1em' }}>NEWGAME</div>
            <div style={{ fontSize: 10, color: '#8892A4' }}>Mobile Simulator</div>
          </div>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          {/* URL input */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#8892A4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>URL</p>
            <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: 6 }}>
              <input
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="/landing"
                style={{
                  flex: 1, padding: '7px 10px', borderRadius: 7,
                  background: '#0C1420', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F0EEF4', fontSize: 11, outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <button type="submit" style={{
                padding: '7px 10px', borderRadius: 7, border: 'none',
                background: 'rgba(253,207,65,0.12)', color: '#FDCF41',
                fontSize: 13, cursor: 'pointer',
              }}>↵</button>
            </form>
          </div>

          {/* Quick links */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#8892A4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Navigasi</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {QUICK_LINKS.map(l => {
                const active = url.includes(l.path);
                return (
                  <button key={l.path} onClick={() => navigate(l.path)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 7, border: 'none',
                    background: active ? 'rgba(253,207,65,0.1)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'background 0.2s',
                  }}>
                    <span style={{ fontSize: 12 }}>{l.emoji}</span>
                    <span style={{ fontSize: 12, color: active ? '#FDCF41' : '#F0EEF4', fontWeight: active ? 700 : 400 }}>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Devices */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#8892A4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Device</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {DEVICES.map(d => {
                const active = device.name === d.name;
                return (
                  <button key={d.name} onClick={() => setDevice(d)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 7, border: 'none',
                    background: active ? 'rgba(185,166,206,0.12)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}>
                    <span style={{ fontSize: 11 }}>{d.emoji}</span>
                    <span style={{ flex: 1, fontSize: 11, color: active ? '#B9A6CE' : '#F0EEF4', fontWeight: active ? 700 : 400 }}>{d.name}</span>
                    <span style={{ fontSize: 9, color: '#8892A4', fontFamily: 'monospace' }}>{d.w}×{d.h}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#8892A4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
              Skala — <span style={{ color: '#FDCF41' }}>{Math.round(scale * 100)}%</span>
            </p>
            <input type="range" min={30} max={100} value={Math.round(scale * 100)}
              onChange={e => setScale(Number(e.target.value) / 100)}
              style={{ width: '100%', accentColor: '#FDCF41' }}
            />
          </div>

          {/* Orientation */}
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#8892A4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Orientasi</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Portrait',  val: false, icon: '⬜' },
                { label: 'Landscape', val: true,  icon: '⬛' },
              ].map(o => (
                <button key={o.label} onClick={() => setLandscape(o.val)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  border: `1px solid ${landscape === o.val ? 'rgba(253,207,65,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  background: landscape === o.val ? 'rgba(253,207,65,0.1)' : '#0C1420',
                  color: landscape === o.val ? '#FDCF41' : '#8892A4',
                  fontSize: 11, fontWeight: landscape === o.val ? 700 : 400,
                  cursor: 'pointer',
                }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{
          padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#050A10',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: loading ? '#FDCF41' : '#22c55e',
            boxShadow: `0 0 6px ${loading ? '#FDCF41' : '#22c55e'}88`,
          }} />
          <span style={{ fontSize: 10, color: '#8892A4' }}>{loading ? 'Loading...' : 'Ready'}</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: '#8892A4', fontFamily: 'monospace' }}>
            {devW}×{devH}
          </span>
        </div>
      </aside>

      {/* ── CANVAS ───────────────────────────────────────────── */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, gap: 20, position: 'relative', overflowY: 'auto',
      }}>
        {/* Dot grid bg */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          zIndex: 0,
        }} />

        {/* Device info chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 18px', borderRadius: 20,
          background: '#0C1420', border: '1px solid rgba(255,255,255,0.07)',
          zIndex: 1,
        }}>
          <span style={{ fontSize: 14 }}>{device.emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{device.name}</span>
          <span style={{ fontSize: 10, color: '#8892A4', fontFamily: 'monospace' }}>{devW}×{devH}</span>
          <span style={{ fontSize: 10, color: '#8892A4' }}>|</span>
          <span style={{ fontSize: 10, color: '#FDCF41', fontWeight: 700 }}>{Math.round(scale * 100)}%</span>
          {landscape && <span style={{ fontSize: 10, color: '#8892A4' }}>↔ Landscape</span>}
        </div>

        {/* Phone frame */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: devW * scale + (isTablet ? 28 : 22) * 2,
          height: devH * scale + topBarH + botBarH + (isTablet ? 16 : 0) * 2,
          background: '#18202E',
          borderRadius: frameRadius + 8,
          border: '2px solid #2A3650',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(253,207,65,0.03), 0 0 80px rgba(253,207,65,0.02)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Top notch/bar */}
          {!isTablet && (
            <div style={{
              height: topBarH,
              background: '#0F1521',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {device.notch ? (
                <div style={{
                  width: 110, height: 22,
                  background: '#18202E',
                  borderRadius: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0F1521', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <div style={{ width: 38, height: 7, borderRadius: 4, background: '#0F1521' }} />
                </div>
              ) : (
                <div style={{ width: 60, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          )}

          {/* iframe content */}
          <div style={{
            width: devW * scale,
            height: devH * scale,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <iframe
              ref={iframeRef}
              src={fullUrl}
              title="NEWGAME Preview"
              onLoad={() => setLoading(false)}
              onLoadStart={() => setLoading(true)}
              style={{
                width: devW,
                height: devH,
                border: 'none',
                transformOrigin: '0 0',
                transform: `scale(${scale})`,
                display: 'block',
              }}
            />
          </div>

          {/* Bottom bar */}
          {!isTablet && (
            <div style={{
              height: botBarH,
              background: '#0F1521',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 60, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.22)' }} />
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 8, zIndex: 1 }}>
          {[
            { label: '←', title: 'Back',    action: () => iframeRef.current?.contentWindow?.history.back() },
            { label: '→', title: 'Forward', action: () => iframeRef.current?.contentWindow?.history.forward() },
            { label: '↺', title: 'Reload',  action: () => { setLoading(true); if (iframeRef.current) iframeRef.current.src = fullUrl; } },
            { label: '🏠', title: 'Home',   action: () => navigate('/landing') },
          ].map(b => (
            <button key={b.label} onClick={b.action} title={b.title} style={{
              width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
              background: '#0C1420', color: '#8892A4', fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, color 0.2s',
            }}>
              {b.label}
            </button>
          ))}
        </div>

        {/* Tip */}
        <p style={{
          fontSize: 11, color: 'rgba(136,146,164,0.5)', zIndex: 1,
          maxWidth: 400, textAlign: 'center', lineHeight: 1.6,
        }}>
          Dev tool only — tidak ditampilkan di navigasi utama.
          Pastikan <code style={{ color: '#FDCF41', fontFamily: 'monospace' }}>npm run dev</code> sudah berjalan.
        </p>
      </main>
    </div>
  );
}
