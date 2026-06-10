'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorBannerProps {
  /** Error message to display */
  message: string;
  /** Optional title (default: "Terjadi Kesalahan") */
  title?: string;
  /** Optional action button */
  action?: { label: string; onClick: () => void };
  /** Called when banner is dismissed */
  onDismiss?: () => void;
  /** Variant — controls icon and colors */
  variant?: 'error' | 'warning' | 'info';
}

const VARIANT_CONFIG = {
  error: {
    icon: 'ri-error-warning-fill',
    bg: 'var(--clr-danger-bg)',
    border: 'var(--clr-danger-border)',
    text: 'var(--clr-danger)',
    glow: 'rgba(230, 57, 70, 0.08)',
  },
  warning: {
    icon: 'ri-alert-fill',
    bg: 'var(--clr-warning-bg)',
    border: 'rgba(230,120,74,0.4)',
    text: 'var(--clr-warning)',
    glow: 'rgba(230, 120, 74, 0.06)',
  },
  info: {
    icon: 'ri-information-fill',
    bg: 'var(--clr-info-bg)',
    border: 'var(--clr-info-border)',
    text: 'var(--clr-info)',
    glow: 'rgba(59, 130, 246, 0.06)',
  },
};

/**
 * ErrorBanner — persistent, dismissible error banner.
 * Use for non-transient errors that need user attention (e.g., auth expired, NPC access denied).
 * Dark gaming aesthetic, consistent with NEWGAME design system.
 */
export function ErrorBanner({ message, title, action, onDismiss, variant = 'error' }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const cfg = VARIANT_CONFIG[variant];

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        role="alert"
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 4px 20px ${cfg.glow}, var(--shadow-sm)`,
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: 3, background: cfg.text, borderRadius: '3px 0 0 3px',
          }}
          aria-hidden="true"
        />

        {/* Icon */}
        <i
          className={cfg.icon}
          style={{ fontSize: 20, color: cfg.text, flexShrink: 0, marginTop: 1 }}
          aria-hidden="true"
        />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 13,
              color: cfg.text, marginBottom: 4, lineHeight: 1.3,
            }}>
              {title}
            </p>
          )}
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: 13,
            color: 'var(--clr-text-primary)', lineHeight: 1.5, opacity: 0.9,
          }}>
            {message}
          </p>

          {action && (
            <button
              onClick={action.onClick}
              style={{
                marginTop: 10,
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                background: cfg.text,
                color: '#fff',
                border: 'none',
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={() => { setDismissed(true); onDismiss(); }}
            aria-label="Tutup pesan"
            style={{
              background: 'none', border: 'none',
              color: 'var(--clr-text-secondary)', cursor: 'pointer',
              fontSize: 16, padding: 2, flexShrink: 0, lineHeight: 1,
            }}
          >
            <i className="ri-close-line" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
