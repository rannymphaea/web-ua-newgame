'use client';
import { useEffect, useCallback } from 'react';

export interface Shortcut {
  keys: string[];         // e.g. ['ctrl', 'k'] or ['g', 'd']
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
}

function matchKeys(event: KeyboardEvent, keys: string[]): boolean {
  const pressed = new Set<string>();
  if (event.ctrlKey || event.metaKey) pressed.add('ctrl');
  if (event.shiftKey) pressed.add('shift');
  if (event.altKey) pressed.add('alt');
  pressed.add(event.key.toLowerCase());
  return keys.every(k => pressed.has(k.toLowerCase())) && pressed.size === keys.length;
}

/** Register keyboard shortcuts. Mount once at a layout level. */
export function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't fire when typing in inputs/textareas
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    for (const shortcut of shortcuts) {
      if (matchKeys(e, shortcut.keys)) {
        e.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}

/** Hook for shortcuts — use inside a client component. */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    for (const shortcut of shortcuts) {
      if (matchKeys(e, shortcut.keys)) {
        e.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/** Shortcut help overlay */
export function ShortcutHelpOverlay({
  shortcuts,
  open,
  onClose,
}: { shortcuts: Shortcut[]; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) {
      const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', esc);
      return () => document.removeEventListener('keydown', esc);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9500,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card animate-slide-up"
        style={{ width: '100%', maxWidth: 480 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-lg">
          <h2 className="font-display text-xl">
            <i className="ri-keyboard-line mr-xs" /> Keyboard Shortcuts
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shortcuts.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: 'var(--clr-text-secondary)' }}>
                {s.description}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {s.keys.map(k => (
                  <kbd
                    key={k}
                    style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 12,
                      background: 'var(--clr-bg-muted)',
                      border: '1px solid var(--clr-border)',
                      color: 'var(--clr-text-primary)',
                      fontFamily: 'monospace', textTransform: 'capitalize',
                    }}
                  >
                    {k === 'ctrl' ? '⌃' : k === 'shift' ? '⇧' : k === 'alt' ? '⌥' : k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-lg text-xs text-muted text-center">
          Tekan <kbd style={{ padding: '1px 5px', borderRadius: 3, border: '1px solid var(--clr-border)', background: 'var(--clr-bg-muted)' }}>?</kbd> kapan saja untuk membuka panel ini
        </div>
      </div>
    </div>
  );
}
