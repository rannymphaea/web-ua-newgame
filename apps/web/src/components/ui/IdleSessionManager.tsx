'use client';
/**
 * IdleSessionManager
 * ──────────────────
 * Auto-logout user setelah IDLE_MINUTES menit tidak aktif.
 * Menampilkan countdown dialog 2 menit sebelum logout.
 *
 * Events yang di-track: mousemove, mousedown, keydown,
 *   touchstart, scroll, pointerdown, visibilitychange
 *
 * Cara pakai: render <IdleSessionManager /> di dalam dashboard layout.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';

/* ── Konfigurasi ─────────────────────────────────────────────── */
const IDLE_MINUTES   = 30;   // Auto-logout setelah 30 menit idle
const WARN_MINUTES   = 2;    // Tampilkan warning 2 menit sebelum logout

const IDLE_MS = IDLE_MINUTES * 60 * 1000;
const WARN_MS = WARN_MINUTES * 60 * 1000;

/* ── Activity events ─────────────────────────────────────────── */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'pointerdown',
];

/* ═══════════════════════════════════════════════════════════════
   COUNTDOWN DIALOG
   ═══════════════════════════════════════════════════════════════ */
function IdleWarningDialog({
  secondsLeft,
  onStay,
  onLogout,
}: {
  secondsLeft: number;
  onStay: () => void;
  onLogout: () => void;
}) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = secondsLeft / (WARN_MINUTES * 60);
  const circumference = 2 * Math.PI * 36;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: 24,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.9,  opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        style={{
          background: 'var(--clr-bg-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 24,
          padding: '36px 40px',
          maxWidth: 400, width: '100%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(253,207,65,0.08)',
          position: 'relative', overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Gold top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent, #FDCF41, #B9A6CE, transparent)',
        }} />

        {/* SVG Countdown ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <svg width={88} height={88} viewBox="0 0 88 88">
            {/* Track */}
            <circle cx={44} cy={44} r={36}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
            {/* Progress arc */}
            <motion.circle
              cx={44} cy={44} r={36}
              fill="none"
              stroke={progress > 0.4 ? '#FDCF41' : '#f87171'}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              transform="rotate(-90 44 44)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
            {/* Time label */}
            <text x={44} y={40} textAnchor="middle"
              fill="var(--clr-text-primary)"
              fontSize={18} fontWeight={800}
              fontFamily="var(--font-inter, Inter, sans-serif)">
              {mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : secs}
            </text>
            <text x={44} y={56} textAnchor="middle"
              fill="var(--clr-text-secondary)"
              fontSize={9} fontWeight={600}
              fontFamily="var(--font-inter, Inter, sans-serif)"
              letterSpacing="0.12em">
              {mins > 0 ? 'MENIT' : 'DETIK'}
            </text>
          </svg>
        </div>

        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(248,113,113,0.12)',
          border: '1px solid rgba(248,113,113,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <i className="ri-time-line" style={{ fontSize: 22, color: '#f87171' }} />
        </div>

        <h2 style={{
          fontFamily: 'var(--font-grotesk, var(--font-inter))',
          fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
          color: 'var(--clr-text-primary)',
          marginBottom: 8,
        }}>Sesi Akan Berakhir</h2>

        <p style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 13.5, lineHeight: 1.6,
          color: 'var(--clr-text-secondary)',
          marginBottom: 28,
        }}>
          Kamu tidak aktif selama beberapa waktu. Sesi akan otomatis berakhir
          dalam{' '}
          <strong style={{ color: progress > 0.4 ? '#FDCF41' : '#f87171' }}>
            {mins > 0
              ? `${mins} menit ${secs} detik`
              : `${secs} detik`}
          </strong>.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          {/* Logout now */}
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '11px 16px',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 10, cursor: 'pointer',
              fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600,
              color: '#f87171',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <i className="ri-logout-box-r-line" style={{ fontSize: 15 }} />
            Logout Sekarang
          </motion.button>

          {/* Stay logged in */}
          <motion.button
            onClick={onStay}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '11px 16px',
              background: 'linear-gradient(135deg, #FDCF41, #f0c030)',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 700,
              color: '#1F293A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(253,207,65,0.3)',
            }}
          >
            <i className="ri-refresh-line" style={{ fontSize: 15 }} />
            Tetap Login
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HOOK — useIdleSession
   ═══════════════════════════════════════════════════════════════ */
export function useIdleSession() {
  const { logout } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft]  = useState(WARN_MINUTES * 60);

  const idleTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActive    = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (idleTimer.current)    clearTimeout(idleTimer.current);
    if (warnTimer.current)    clearTimeout(warnTimer.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    idleTimer.current    = null;
    warnTimer.current    = null;
    countdownRef.current = null;
  }, []);

  const startCountdown = useCallback(() => {
    setSecondsLeft(WARN_MINUTES * 60);
    countdownRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await logout();
    window.location.replace('/login');
  }, [clearTimers, logout]);

  const handleStay = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setSecondsLeft(WARN_MINUTES * 60);
    lastActive.current = Date.now();
    scheduleTimers();      // eslint-disable-line react-hooks/exhaustive-deps
  }, [clearTimers]);       // scheduleTimers defined below — safe because it's stable

  const scheduleTimers = useCallback(() => {
    clearTimers();

    // Show warning at IDLE_MS - WARN_MS
    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();

      // Force logout at IDLE_MS
      idleTimer.current = setTimeout(() => {
        handleLogout();
      }, WARN_MS);
    }, IDLE_MS - WARN_MS);
  }, [clearTimers, startCountdown, handleLogout]);

  // Reset timer on any activity
  const resetTimer = useCallback(() => {
    if (showWarning) return; // Don't reset if dialog is open — let user decide
    lastActive.current = Date.now();
    scheduleTimers();
  }, [showWarning, scheduleTimers]);

  useEffect(() => {
    scheduleTimers();

    const controller = new AbortController();
    ACTIVITY_EVENTS.forEach(event =>
      window.addEventListener(event, resetTimer, { passive: true, signal: controller.signal })
    );

    // Handle visibility change — pause/resume counting
    const handleVisibility = () => {
      if (document.hidden) return;
      // If tab becomes visible again and idle time exceeded → logout immediately
      const elapsed = Date.now() - lastActive.current;
      if (elapsed >= IDLE_MS) {
        handleLogout();
      } else {
        scheduleTimers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility, { signal: controller.signal });

    return () => {
      clearTimers();
      controller.abort();
    };
  }, [scheduleTimers, resetTimer, clearTimers, handleLogout]);

  return { showWarning, secondsLeft, handleStay, handleLogout };
}

/* ═══════════════════════════════════════════════════════════════
   EXPORTED COMPONENT — render in dashboard layout
   ═══════════════════════════════════════════════════════════════ */
export default function IdleSessionManager() {
  const { showWarning, secondsLeft, handleStay, handleLogout } = useIdleSession();

  return (
    <AnimatePresence>
      {showWarning && (
        <IdleWarningDialog
          secondsLeft={secondsLeft}
          onStay={handleStay}
          onLogout={handleLogout}
        />
      )}
    </AnimatePresence>
  );
}
