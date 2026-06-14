'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  body: string;
  adminId: string;
  createdAt: { _seconds: number };
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/notifications/broadcasts') as Announcement[];
        setAnnouncements(Array.isArray(res) ? res : []);
      } catch { /* ignore */ }
    };
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);

  async function dismiss(id: string) {
    setDismissed(prev => new Set([...prev, id]));
    try { await api.post(`/notifications/broadcasts/${id}/dismiss`, {}); } catch { /* ignore */ }
  }

  const visible = announcements.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 8000, width: '100%', maxWidth: 600, padding: '0 16px', pointerEvents: 'none' }}>
      <AnimatePresence>
        {visible.slice(0, 2).map(ann => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              marginBottom: 8, pointerEvents: 'auto',
              background: 'rgba(15,10,40,0.95)',
              border: '1px solid var(--clr-danger)',
              borderRadius: 12, padding: '12px 16px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}
          >
            <i className="ri-megaphone-fill" style={{ fontSize: 20, color: 'var(--clr-danger)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 700, color: 'var(--clr-text-primary)', marginBottom: 2 }}>
                {ann.title}
              </div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-secondary)' }}>
                {ann.body}
              </div>
            </div>
            <button
              onClick={() => dismiss(ann.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-secondary)', padding: 4 }}
            >
              <i className="ri-close-line" style={{ fontSize: 16 }} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
