'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface Dot {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

export function NovelCursor() {
  const cursorRef    = useRef<HTMLDivElement>(null);
  const followerRef  = useRef<HTMLDivElement>(null);
  const [dots, setDots]       = useState<Dot[]>([]);
  const [isHover, setIsHover] = useState(false);
  const [isClick, setIsClick] = useState(false);
  const dotIdRef    = useRef(0);
  const posRef      = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const rafRef      = useRef<number>(0);

  const pathname = usePathname();
  const isDashboard = pathname ? pathname !== '/' && !pathname.startsWith('/login') && !pathname.startsWith('/register') : false;

  useEffect(() => {
    document.documentElement.style.cursor = 'none';

    const onMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      posRef.current = { x, y };

      if (cursorRef.current) {
        const offsetX = isDashboard ? 2 : 12;
        const offsetY = isDashboard ? 2 : 12;
        cursorRef.current.style.transform = `translate(${x - offsetX}px, ${y - offsetY}px)`;
      }

      if (!isDashboard) {
        const id = ++dotIdRef.current;
        setDots(prev => [
          ...prev.slice(-14),
          { id, x, y, opacity: 0.55, scale: 1 },
        ]);
      }
    };

    let angle = 0;
    const animFollower = () => {
      followerPos.current.x += (posRef.current.x - followerPos.current.x) * 0.1;
      followerPos.current.y += (posRef.current.y - followerPos.current.y) * 0.1;
      angle += 1;
      if (followerRef.current) {
        const offset = isDashboard ? 16 : 20;
        followerRef.current.style.transform =
          `translate(${followerPos.current.x - offset}px, ${followerPos.current.y - offset}px) ${!isDashboard ? `rotate(${angle}deg)` : ''}`;
      }
      rafRef.current = requestAnimationFrame(animFollower);
    };
    rafRef.current = requestAnimationFrame(animFollower);

    const onEnter = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (
        el.tagName === 'A' ||
        el.tagName === 'BUTTON' ||
        el.closest('a') ||
        el.closest('button') ||
        el.dataset.hover === 'true'
      ) {
        setIsHover(true);
      }
    };
    const onLeave = () => setIsHover(false);

    const onDown  = () => setIsClick(true);
    const onUp    = () => setIsClick(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout',  onLeave);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);

    const fadeInterval = setInterval(() => {
      setDots(prev =>
        prev
          .map(d => ({ ...d, opacity: d.opacity - 0.06, scale: d.scale - 0.04 }))
          .filter(d => d.opacity > 0),
      );
    }, 40);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout',  onLeave);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      document.documentElement.style.cursor = '';
      clearInterval(fadeInterval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDashboard]);

  return (
    <>
      {!isDashboard && dots.map((dot, i) => (
        <div
          key={dot.id}
          style={{
            position:       'fixed',
            left:           0,
            top:            0,
            transform:      `translate(${dot.x - 2}px, ${dot.y - 2}px) scale(${Math.max(0, dot.scale)})`,
            width:          4,
            height:         4,
            borderRadius:   '50%',
            background:     i % 2 === 0 ? 'var(--clr-gold)' : 'var(--clr-lavender)',
            boxShadow:      `0 0 10px ${i % 2 === 0 ? 'var(--clr-gold)' : 'var(--clr-lavender)'}`,
            opacity:        dot.opacity,
            pointerEvents:  'none',
            zIndex:         99997,
            transition:     'none',
          }}
        />
      ))}

      <div
        ref={cursorRef}
        style={{
          position:      'fixed',
          left:          0,
          top:           0,
          pointerEvents: 'none',
          zIndex:        99999,
          transition:    'transform 0.05s linear',
          transform:     'translate(-100px, -100px)',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
        }}
      >
        {isDashboard ? (
          <i 
            className="ri-quill-pen-fill" 
            style={{ 
              fontSize: 22, 
              lineHeight: 1,
              color: isClick ? 'var(--clr-gold)' : 'var(--clr-ink)',
              transform: isHover ? 'rotate(-15deg) scale(1.15) translate(-6px, -6px)' : 'rotate(0deg) translate(-6px, -6px)',
              transition: 'transform 0.2s ease, color 0.15s ease',
              filter: isHover ? 'drop-shadow(0 0 6px var(--clr-gold-glow))' : 'drop-shadow(0 3px 6px rgba(31,41,58,0.3))'
            }} 
          />
        ) : (
          <i 
            className="ri-sparkling-fill" 
            style={{ 
              fontSize: 24, 
              lineHeight: 1,
              color: isClick ? 'var(--clr-lavender)' : 'var(--clr-gold)',
              transform: isClick ? 'scale(0.8) rotate(45deg)' : (isHover ? 'scale(1.2) rotate(15deg)' : 'scale(1) rotate(0deg)'),
              transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), color 0.15s ease',
              filter: `drop-shadow(0 0 8px ${isClick ? 'var(--clr-lavender)' : 'var(--clr-gold)'})`
            }} 
          />
        )}
      </div>

      <div
        ref={followerRef}
        style={{
          position:      'fixed',
          left:          0,
          top:           0,
          width:         isDashboard ? (isHover ? 38 : 32) : (isHover ? 52 : 40),
          height:        isDashboard ? (isHover ? 38 : 32) : (isHover ? 52 : 40),
          borderRadius:  isDashboard ? '0' : '50%',
          border:        'none',
          background:    'transparent',
          boxShadow:     'none',
          pointerEvents: 'none',
          zIndex:        99998,
          transform:     'translate(-100px, -100px)',
          transition:    'border-color 0.25s ease, background 0.25s ease, width 0.2s ease, height 0.2s ease, margin 0.2s ease',
          marginLeft:    isDashboard ? (isHover ? -3 : 0) : (isHover ? -6 : 0),
          marginTop:     isDashboard ? (isHover ? -3 : 0) : (isHover ? -6 : 0),
          backdropFilter: isDashboard ? 'none' : 'blur(1px)',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
        }}
      >
        {isDashboard && (
          <i 
            className="ri-book-open-fill"
            style={{
              fontSize: isHover ? 32 : 28,
              color: isHover ? 'var(--clr-gold)' : 'var(--clr-lavender-subtle)',
              transition: 'all 0.25s ease',
              filter: isHover ? 'drop-shadow(0 2px 6px var(--clr-gold-glow))' : 'drop-shadow(0 1px 3px rgba(31,41,58,0.1))',
              transform: 'translate(4px, 4px)'
            }}
          />
        )}
      </div>
    </>
  );
}
