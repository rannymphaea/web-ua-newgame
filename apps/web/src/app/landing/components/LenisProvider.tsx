'use client';
import { useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   LenisProvider — integrates @studio-freight/lenis smooth scroll
   Wrap in landing layout so dashboard scrolling is unaffected
   ═══════════════════════════════════════════════════════════════ */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: any;

    async function initLenis() {
      try {
        const LenisModule = await import('lenis');
        const LenisCtor: any = (LenisModule as any).default ?? (LenisModule as any);

        lenis = new LenisCtor({
          duration:    1.4,
          easing:      (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction:   'vertical',
          gestureDirection: 'vertical',
          smooth:      true,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch {
        // Lenis not yet installed — graceful fallback
      }
    }

    initLenis();

    return () => {
      lenis?.destroy?.();
    };
  }, []);

  return <>{children}</>;
}
