'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────
   H5 FIX: useScrollReveal — AbortController + MutationObserver
   yang disconnect dirinya sendiri setelah semua visible
   ───────────────────────────────────────────────────────────────── */
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // stop observing once visible
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const revealEls = el.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );
    revealEls.forEach((child) => observer.observe(child));

    // MutationObserver — terbatas childList+subtree, disconnect setelah idle
    let muTimeout: ReturnType<typeof setTimeout>;
    const mutationObserver = new MutationObserver(() => {
      clearTimeout(muTimeout);
      const newEls = el.querySelectorAll(
        '.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)'
      );
      newEls.forEach((child) => observer.observe(child));
      // Auto-disconnect MutationObserver after 8s (all animations done)
      muTimeout = setTimeout(() => mutationObserver.disconnect(), 8000);
    });

    mutationObserver.observe(el, { childList: true, subtree: true, attributes: false });

    return () => {
      clearTimeout(muTimeout);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
}

/* ─────────────────────────────────────────────────────────────────
   H5 FIX: useParallax — AbortController for clean listener removal
   ───────────────────────────────────────────────────────────────── */
export function useParallax() {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      document.querySelectorAll<HTMLElement>('.parallax-slow').forEach((el) => {
        el.style.transform = `translateY(${scrollY * 0.12}px)`;
      });
      document.querySelectorAll<HTMLElement>('.parallax-fast').forEach((el) => {
        el.style.transform = `translateY(${scrollY * 0.25}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true, signal });

    return () => controller.abort();
  }, []);
}

/* ─────────────────────────────────────────────────────────────────
   AnimatedCounter — unchanged, functional
   ───────────────────────────────────────────────────────────────── */
export function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount]   = useState(0);
  const ref                 = useRef<HTMLSpanElement>(null);
  const counted             = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const duration = 1800;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────
   StaggerText
   ───────────────────────────────────────────────────────────────── */
export function StaggerText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`stagger-text ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.06 + 0.2}s` }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MultiPhraseTypewriter — cycles through multiple phrases
   with glitch flash on transition. Each phrase gets unique timing.
   ───────────────────────────────────────────────────────────────── */
const HERO_PHRASES = ['NEWGAME', 'LEARN · CREATE', 'PLAY · WIN', 'LEVEL UP'];

export function TypewriterText({ text, className = '' }: { text: string; className?: string }) {
  // Legacy single-text version kept for backward compat
  const [displayed, setDisplayed] = useState('');
  const phaseRef   = useRef<'typing' | 'pause' | 'deleting'>('typing');
  const timerRef   = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    phaseRef.current = 'typing';
    setDisplayed('');
    const tick = () => {
      setDisplayed(prev => {
        const phase = phaseRef.current;
        if (phase === 'typing') {
          const next = text.substring(0, prev.length + 1);
          if (next === text) {
            phaseRef.current = 'pause';
            timerRef.current = setTimeout(() => { phaseRef.current = 'deleting'; tick(); }, 2500);
            return next;
          }
          timerRef.current = setTimeout(tick, 150);
          return next;
        }
        if (phase === 'deleting') {
          const next = prev.substring(0, prev.length - 1);
          if (next === '') { phaseRef.current = 'typing'; timerRef.current = setTimeout(tick, 200); return ''; }
          timerRef.current = setTimeout(tick, 80);
          return next;
        }
        return prev;
      });
    };
    timerRef.current = setTimeout(tick, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text]);

  return (
    <span className={`typewriter-text ${className}`}>
      {displayed}
      <span className="cursor-blink">|</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HeroTypewriter — cycles HERO_PHRASES with:
   · per-char typing/deleting
   · glitch flash on phrase switch
   · gradient color shift per phrase
   ───────────────────────────────────────────────────────────────── */
const PHRASE_COLORS = [
  'linear-gradient(135deg,#FDCF41 0%,#f0c030 50%,#fff8dc 100%)',
  'linear-gradient(135deg,#B9A6CE 0%,#a08cc0 50%,#d0c0e8 100%)',
  'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#bbf7d0 100%)',
  'linear-gradient(135deg,#60a5fa 0%,#3b82f6 50%,#bfdbfe 100%)',
];

export function HeroTypewriter({ className = '' }: { className?: string }) {
  const [displayed,   setDisplayed]   = useState('');
  const [phraseIdx,   setPhraseIdx]   = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const phaseRef   = useRef<'typing' | 'pause' | 'deleting'>('typing');
  const timerRef   = useRef<ReturnType<typeof setTimeout>>();
  const idxRef     = useRef(0);

  useEffect(() => {
    const runPhrase = (idx: number) => {
      const phrase = HERO_PHRASES[idx];
      phaseRef.current = 'typing';

      const tick = () => {
        setDisplayed(prev => {
          const phase = phaseRef.current;

          if (phase === 'typing') {
            const next = phrase.substring(0, prev.length + 1);
            if (next === phrase) {
              phaseRef.current = 'pause';
              // Pause — hold for 2s, then delete
              timerRef.current = setTimeout(() => {
                phaseRef.current = 'deleting';
                tick();
              }, 2000);
              return next;
            }
            timerRef.current = setTimeout(tick, 110);
            return next;
          }

          if (phase === 'deleting') {
            const next = prev.substring(0, prev.length - 1);
            if (next === '') {
              // Glitch flash then switch phrase
              setIsGlitching(true);
              timerRef.current = setTimeout(() => {
                setIsGlitching(false);
                idxRef.current = (idx + 1) % HERO_PHRASES.length;
                setPhraseIdx(idxRef.current);
                runPhrase(idxRef.current);
              }, 280);
              return '';
            }
            timerRef.current = setTimeout(tick, 55);
            return next;
          }

          return prev;
        });
      };

      timerRef.current = setTimeout(tick, 200);
    };

    runPhrase(0);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gradient = PHRASE_COLORS[phraseIdx];

  return (
    <span
      className={`hero-typewriter-v2 ${isGlitching ? 'glitching' : ''} ${className}`}
      style={{
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        backgroundSize: '200% auto',
        animation: 'heroGradientShift 4s ease infinite',
        display: 'inline-block',
        minWidth: '4ch',
        transition: 'background 0.3s ease',
      }}
    >
      {displayed || '\u00A0'}
      <span
        style={{
          display: 'inline-block',
          width: '3px',
          height: '0.85em',
          background: PHRASE_COLORS[phraseIdx].includes('FDCF41') ? '#FDCF41' : '#B9A6CE',
          marginLeft: 4,
          verticalAlign: 'middle',
          borderRadius: 2,
          animation: 'heroCursorBlink 0.9s step-end infinite',
          WebkitTextFillColor: 'initial',
        }}
        aria-hidden="true"
      />
    </span>
  );
}
