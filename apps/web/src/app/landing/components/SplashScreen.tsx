'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

/* ═══════════════════════════════════════════════════════════════
   NEWGAME Splash Screen — runs once per session
   ═══════════════════════════════════════════════════════════════ */
export default function SplashScreen() {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit' | 'gone'>('enter');

  useEffect(() => {
    // Only show once per session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('ng-splash')) {
      setPhase('gone');
      return;
    }

    // Phase timeline: enter → hold → exit → gone
    const t1 = setTimeout(() => setPhase('hold'),  400);
    const t2 = setTimeout(() => setPhase('exit'),  2600);
    const t3 = setTimeout(() => {
      setPhase('gone');
      try { sessionStorage.setItem('ng-splash', '1'); } catch {}
    }, 3400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'var(--novel-bg)',
        transition: phase === 'exit' ? 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'translateY(-40px)' : 'translateY(0)',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(253,207,65,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'splashOrb 3s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '25%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(185,166,206,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'splashOrb 3s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      {/* Logo + Text */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'scale(0.85) translateY(20px)' : 'scale(1) translateY(0)',
        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Logo with glow ring */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: -12,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #FDCF41 0%, #B9A6CE 33%, #1F293A 66%, #FDCF41 100%)',
            padding: 3,
            animation: 'splashSpin 4s linear infinite',
          }}>
            <div style={{
              width: '100%', height: '100%',
              borderRadius: '50%', background: 'var(--novel-bg)',
            }} />
          </div>
          <Image
            src="/logo.png"
            alt="NEWGAME"
            width={96}
            height={96}
            style={{
              borderRadius: 24,
              filter: 'drop-shadow(0 8px 32px rgba(253,207,65,0.4))',
              position: 'relative', zIndex: 1,
            }}
          />
        </div>

        {/* NEWGAME title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-grotesk)',
            fontSize: 'clamp(42px, 7vw, 70px)',
            fontWeight: 800,
            color: 'var(--novel-ink)',
            lineHeight: 0.92,
            letterSpacing: '-3px',
            textTransform: 'uppercase' as const,
            textShadow: '0 2px 30px rgba(253,207,65,0.15)',
            margin: 0,
          }}>
            NEWGAME
          </h1>
          <p style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '5px',
            textTransform: 'uppercase',
            color: 'var(--novel-cloud)',
            marginTop: 12,
            opacity: phase === 'hold' ? 1 : 0,
            transform: phase === 'hold' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.5s 0.2s ease, transform 0.5s 0.2s ease',
          }}>
            UKM Game Development · Universitas Andalas
          </p>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#FDCF41',
                opacity: phase === 'hold' ? 1 : 0.3,
                transform: phase === 'hold' ? 'scale(1)' : 'scale(0.6)',
                transition: `opacity 0.4s ${0.1 + i * 0.1}s ease, transform 0.4s ${0.1 + i * 0.1}s ease`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes splashSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes splashOrb  { from { opacity: 0.5; transform: scale(0.9); } to { opacity: 1; transform: scale(1.1); } }
      `}</style>
    </div>
  );
}
