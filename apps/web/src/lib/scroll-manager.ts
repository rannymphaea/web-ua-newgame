/**
 * G2: ScrollManager singleton — consolidates all scroll listeners into ONE
 * instead of separate listeners in useParallax, PirateMap, useScrollReveal.
 *
 * Usage:
 *   import { scrollManager } from '@/lib/scroll-manager';
 *   useEffect(() => {
 *     return scrollManager.subscribe((y) => { ... });
 *   }, []);
 */

type ScrollCallback = (scrollY: number) => void;

class ScrollManager {
  private listeners = new Set<ScrollCallback>();
  private ticking   = false;
  private lastY     = 0;

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
  }

  private onScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.lastY = window.scrollY;
        this.listeners.forEach(cb => cb(this.lastY));
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  /** Subscribe to scroll events. Returns unsubscribe function. */
  subscribe(cb: ScrollCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /** Get current scroll position without subscribing */
  get scrollY() { return this.lastY; }
}

// Singleton — SSR safe
export const scrollManager =
  typeof window !== 'undefined' ? new ScrollManager() : null;
