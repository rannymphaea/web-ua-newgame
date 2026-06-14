'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category?: string;
  condition?: {
    type?: string;
    check?: string;
    value?: number;
    label?: string;
  };
  awardedAt?: { _seconds: number } | string;
  unlockedXP?: number;
}

interface BadgeDetailModalProps {
  badge: Badge | null;
  userProgress?: number; // current value (e.g. attendance count)
  onClose: () => void;
}

const RARITY_COLORS: Record<string, { border: string; glow: string; label: string }> = {
  common:    { border: 'var(--clr-border)',   glow: 'rgba(255,255,255,0.1)', label: 'Common' },
  uncommon:  { border: '#4ade80',             glow: 'rgba(74,222,128,0.2)', label: 'Uncommon' },
  rare:      { border: 'var(--clr-info)',     glow: 'rgba(96,165,250,0.2)', label: 'Rare' },
  epic:      { border: '#a855f7',             glow: 'rgba(168,85,247,0.2)', label: 'Epic' },
  legendary: { border: 'var(--clr-gold)',     glow: 'rgba(244,196,48,0.2)', label: 'Legendary' },
};

function fmt(ts?: { _seconds: number } | string) {
  if (!ts) return '—';
  const d = typeof ts === 'string' ? new Date(ts) : new Date((ts as any)._seconds * 1000);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BadgeDetailModal({ badge, userProgress, onClose }: BadgeDetailModalProps) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const rarity = RARITY_COLORS[badge?.rarity || 'common'];
  const target = badge?.condition?.value || 0;
  const progress = Math.min(userProgress || 0, target);
  const pct = target > 0 ? (progress / target) * 100 : 100;
  const isUnlocked = !!badge?.awardedAt;

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          key="badge-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9200,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={onClose}
        >
          <motion.div
            key="badge-modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            style={{
              width: '100%', maxWidth: 420,
              background: 'var(--clr-bg-surface)',
              borderRadius: 20,
              border: `1px solid ${rarity.border}`,
              boxShadow: `0 0 40px ${rarity.glow}, 0 24px 64px rgba(0,0,0,0.5)`,
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '24px 24px 16px',
              background: `linear-gradient(135deg, var(--clr-bg-surface) 0%, ${rarity.glow} 100%)`,
              textAlign: 'center',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
                background: rarity.glow, border: `2px solid ${rarity.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>
                {badge.icon || '🏅'}
              </div>
              <div style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                border: `1px solid ${rarity.border}`,
                fontSize: 11, fontWeight: 700, letterSpacing: 1,
                color: rarity.border, marginBottom: 8,
              }}>
                {rarity.label.toUpperCase()}
              </div>
              <h2 className="font-display text-xl">{badge.name}</h2>
              <p className="text-sm text-muted mt-xs">{badge.description}</p>
            </div>

            {/* Body */}
            <div style={{ padding: 24 }}>
              {/* Progress bar (if not unlocked yet) */}
              {!isUnlocked && target > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="text-sm text-muted">{badge.condition?.label || 'Progress'}</span>
                    <span className="text-sm font-bold" style={{ color: rarity.border }}>
                      {progress}/{target}
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--clr-bg-muted)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 4,
                      background: rarity.border, transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Kategori', value: badge.category || '—' },
                  { label: 'Kondisi', value: badge.condition?.label || badge.condition?.type || '—' },
                  { label: 'Diraih pada', value: badge.awardedAt ? fmt(badge.awardedAt) : 'Belum diraih' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              {isUnlocked && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <i className="ri-checkbox-circle-fill" style={{ color: '#4ade80', fontSize: 18 }} />
                  <span className="text-sm" style={{ color: '#4ade80' }}>Badge sudah diraih</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '0 24px 20px', textAlign: 'right' }}>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
