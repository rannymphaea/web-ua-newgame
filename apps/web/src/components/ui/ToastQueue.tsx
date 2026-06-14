'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const ICON_MAP: Record<ToastType, string> = {
  success: 'ri-checkbox-circle-fill',
  error: 'ri-error-warning-fill',
  warning: 'ri-alert-fill',
  info: 'ri-information-fill',
};

const COLOR_MAP: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: 'var(--clr-success-bg)', border: 'var(--clr-success-border)', text: 'var(--clr-success)' },
  error: { bg: 'var(--clr-danger-bg)', border: 'var(--clr-danger-border)', text: 'var(--clr-danger)' },
  warning: { bg: 'var(--clr-warning-bg, rgba(245,158,11,0.1))', border: 'var(--clr-warning-border, rgba(245,158,11,0.3))', text: 'var(--clr-warning)' },
  info: { bg: 'var(--clr-info-bg)', border: 'var(--clr-info-border)', text: 'var(--clr-info)' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) { clearTimeout(timer); timersRef.current.delete(id); }
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => {
      const next = [...prev, { id, message, type, duration }];
      // Max 5 stacked toasts
      return next.slice(-5);
    });
    const timer = setTimeout(() => removeToast(id), duration);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  const showError = useCallback((message: string) => showToast(message, 'error', 7000), [showToast]);
  const showSuccess = useCallback((message: string) => showToast(message, 'success', 4000), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
      {children}
      {/* Toast stack */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
          display: 'flex', flexDirection: 'column-reverse', gap: 8,
          pointerEvents: 'none', maxWidth: 400,
        }}
      >
        <AnimatePresence>
          {toasts.map((toast, index) => {
            const colors = COLOR_MAP[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  backdropFilter: 'blur(12px)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  pointerEvents: 'auto', cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
                onClick={() => removeToast(toast.id)}
              >
                <i className={ICON_MAP[toast.type]} style={{ fontSize: 18, color: colors.text, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: colors.text, flex: 1, lineHeight: 1.4 }}>
                  {toast.message}
                </span>
                <i className="ri-close-line" style={{ fontSize: 16, color: colors.text, opacity: 0.6, flexShrink: 0 }} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
