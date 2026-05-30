'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NovelCursor() {
  const cursorRef   = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const trailRef    = useRef<HTMLCanvasElement>(null);
  const [isHover, setIsHover] = useState(false);
  const [isClick, setIsClick] = useState(false);

  const posRef      = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const rafRef      = useRef<number>(0);
  const lastFrame   = useRef(0);
  const dotsRef     = useRef<Array<{
    x: number; y: number; opacity: number; scale: number; gold: boolean;
  }>>([]);

  const pathname = usePathname();
  const isDashboard = pathname
    ? pathname !== '/' &&
      !pathname.startsWith('/landing') &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/register')
    : false;

  useEffect(() => {
    // Skip custom cursor on touch-only devices (no mouse)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.documentElement.style.cursor = 'none';

    // ── Resize canvas ───────────────────────────────────────────
    const canvas = trailRef.current;
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    if (!isDashboard) {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }

    // ── Mouse move ──────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      posRef.current = { x, y };

      if (cursorRef.current) {
        const off = isDashboard ? 2 : 12;
        cursorRef.current.style.transform = `translate(${x - off}px, ${y - off}px)`;
      }

      if (!isDashboard) {
        const dots = dotsRef.current;
        dots.push({ x, y, opacity: 0.55, scale: 1, gold: dots.length % 2 === 0 });
        if (dots.length > 12) dots.shift();
      }
    };

    // ── RAF loop — 60fps throttled ──────────────────────────────
    let angle = 0;
    const loop = (ts: number) => {
      if (ts - lastFrame.current < 16.67) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      lastFrame.current = ts;
      angle += 1;

      // Follower lerp
      followerPos.current.x += (posRef.current.x - followerPos.current.x) * 0.12;
      followerPos.current.y += (posRef.current.y - followerPos.current.y) * 0.12;

      if (followerRef.current) {
        const off = isDashboard ? 16 : 20;
        followerRef.current.style.transform =
          `translate(${followerPos.current.x - off}px, ${followerPos.current.y - off}px)${
            !isDashboard ? ` rotate(${angle}deg)` : ''
          }`;
      }

      // Canvas trail — zero React state updates
      if (!isDashboard && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const dots = dotsRef.current;
          for (let i = dots.length - 1; i >= 0; i--) {
            const d = dots[i];
            d.opacity -= 0.04;
            d.scale   -= 0.03;
            if (d.opacity <= 0) { dots.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.arc(d.x, d.y, Math.max(0.5, 2 * d.scale), 0, Math.PI * 2);
            ctx.shadowBlur  = 8;
            ctx.shadowColor = d.gold ? '#FDCF41' : '#B9A6CE';
            ctx.fillStyle   = d.gold
              ? `rgba(253,207,65,${d.opacity})`
              : `rgba(185,166,206,${d.opacity})`;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // ── Hover / click ───────────────────────────────────────────
    const onEnter = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (
        el.tagName === 'A' || el.tagName === 'BUTTON' ||
        el.closest('a') || el.closest('button') ||
        el.dataset.hover === 'true'
      ) setIsHover(true);
    };
    const onLeave = () => setIsHover(false);
    const onDown  = () => setIsClick(true);
    const onUp    = () => setIsClick(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout',  onLeave);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout',  onLeave);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      if (!isDashboard) window.removeEventListener('resize', resizeCanvas);
      document.documentElement.style.cursor = '';
      cancelAnimationFrame(rafRef.current);
    };
  }, [isDashboard]);

  return (
    <>
      {/* Canvas trail — zero React re-renders */}
      <canvas
        ref={trailRef}
        style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none',
          zIndex: 99997,
          display: isDashboard ? 'none' : 'block',
        }}
      />

      {/* Main cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed', left: 0, top: 0,
          pointerEvents: 'none', zIndex: 99999,
          transform: 'translate(-100px, -100px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isDashboard ? (
          <i
            className="ri-quill-pen-fill"
            style={{
              fontSize: 22, lineHeight: 1,
              color: isClick ? 'var(--clr-gold)' : 'var(--clr-ink)',
              transform: isHover
                ? 'rotate(-15deg) scale(1.15) translate(-6px,-6px)'
                : 'rotate(0deg) translate(-6px,-6px)',
              transition: 'transform 0.2s ease, color 0.15s ease',
              filter: isHover
                ? 'drop-shadow(0 0 6px var(--clr-gold-glow))'
                : 'drop-shadow(0 3px 6px rgba(31,41,58,0.3))',
            }}
          />
        ) : (
          <i
            className="ri-sparkling-fill"
            style={{
              fontSize: 24, lineHeight: 1,
              color: isClick ? 'var(--clr-lavender)' : 'var(--clr-gold)',
              transform: isClick
                ? 'scale(0.8) rotate(45deg)'
                : isHover ? 'scale(1.2) rotate(15deg)' : 'scale(1) rotate(0deg)',
              transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), color 0.15s ease',
              filter: `drop-shadow(0 0 8px ${isClick ? 'var(--clr-lavender)' : 'var(--clr-gold)'})`,
            }}
          />
        )}
      </div>

      {/* Follower */}
      <div
        ref={followerRef}
        style={{
          position: 'fixed', left: 0, top: 0,
          width:  isDashboard ? (isHover ? 38 : 32) : (isHover ? 52 : 40),
          height: isDashboard ? (isHover ? 38 : 32) : (isHover ? 52 : 40),
          borderRadius: isDashboard ? '0' : '50%',
          background: 'transparent', border: 'none',
          pointerEvents: 'none', zIndex: 99998,
          transform: 'translate(-100px, -100px)',
          transition: 'width 0.2s ease, height 0.2s ease',
          marginLeft: isDashboard ? (isHover ? -3 : 0) : (isHover ? -6 : 0),
          marginTop:  isDashboard ? (isHover ? -3 : 0) : (isHover ? -6 : 0),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isDashboard && (
          <i
            className="ri-book-open-fill"
            style={{
              fontSize: isHover ? 32 : 28,
              color: isHover ? 'var(--clr-gold)' : 'var(--clr-lavender-subtle)',
              transition: 'all 0.25s ease',
              filter: isHover
                ? 'drop-shadow(0 2px 6px var(--clr-gold-glow))'
                : 'drop-shadow(0 1px 3px rgba(31,41,58,0.1))',
              transform: 'translate(4px,4px)',
            }}
          />
        )}
      </div>
    </>
  );
}
