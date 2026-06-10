'use client';
import { useState, createContext, useContext, useCallback } from 'react';
import { parseError } from '@/lib/errors';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: number; message: string; type: ToastType; duration: number; }

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => void;
  showError: (error: unknown) => void;
  showSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  showError: () => {},
  showSuccess: () => {},
});

export function useToast() { return useContext(ToastContext); }

let toastId = 0;

const TOAST_ICONS: Record<ToastType, string> = {
  success: 'ri-checkbox-circle-fill',
  error:   'ri-error-warning-fill',
  warning: 'ri-alert-fill',
  info:    'ri-information-fill',
};

const TOAST_COLORS: Record<ToastType, { text: string; border: string; bg: string }> = {
  success: { text: 'var(--clr-success)',  border: 'var(--clr-success-border)',  bg: 'rgba(74,222,128,0.12)' },
  error:   { text: 'var(--clr-danger)',   border: 'var(--clr-danger-border)',   bg: 'rgba(230,57,70,0.12)'  },
  warning: { text: 'var(--clr-warning)',  border: 'rgba(230,120,74,0.4)',       bg: 'rgba(230,120,74,0.1)'  },
  info:    { text: 'var(--clr-info)',     border: 'var(--clr-info-border)',     bg: 'rgba(96,165,250,0.12)' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info', duration = 4200) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  /** Show error toast with auto-mapped Indonesian message */
  const showError = useCallback((error: unknown) => {
    const message = parseError(error);
    show(message, 'error', 5000);
  }, [show]);

  /** Show success toast */
  const showSuccess = useCallback((message: string) => {
    show(message, 'success');
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, showError, showSuccess }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        style={{ position:'fixed', top:20, right:20, zIndex:10000, display:'flex', flexDirection:'column', gap:8, maxWidth:'calc(100vw - 40px)' }}
      >
        {toasts.map(t => {
          const c = TOAST_COLORS[t.type];
          return (
            <div
              key={t.id}
              role="alert"
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'12px 16px', borderRadius:12,
                background: `var(--clr-bg-surface-elevated)`,
                border: `1px solid ${c.border}`,
                boxShadow: `var(--shadow-lg), 0 0 0 1px ${c.border}`,
                backdropFilter:'blur(16px)',
                animation:'toastIn 0.35s cubic-bezier(0.16,1,0.3,1)',
                minWidth:260, maxWidth:400,
              }}
            >
              <i
                className={TOAST_ICONS[t.type]}
                style={{ fontSize:18, color: c.text, flexShrink:0 }}
                aria-hidden="true"
              />
              <span style={{ fontSize:13, color:'var(--clr-text-primary)', flex:1, fontFamily:'var(--font-inter)', lineHeight:1.4 }}>
                {t.message}
              </span>
              <button
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                aria-label="Tutup notifikasi"
                style={{ background:'none', border:'none', color:'var(--clr-text-secondary)', cursor:'pointer', fontSize:16, padding:0, flexShrink:0, lineHeight:1 }}
              >
                <i className="ri-close-line" style={{fontSize:16}} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toastIn { from { transform:translateX(110%); opacity:0; } to { transform:translateX(0); opacity:1; } }`}</style>
    </ToastContext.Provider>
  );
}
