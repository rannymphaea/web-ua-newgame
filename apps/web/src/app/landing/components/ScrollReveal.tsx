'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

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
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    // Observer untuk elemen reveal saat ini
    const revealElements = el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach((child) => observer.observe(child));

    // MutationObserver untuk menangkap elemen baru yang ditambahkan
    const mutationObserver = new MutationObserver(() => {
      const newElements = el.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)');
      newElements.forEach((child) => {
        if (!observer) return;
        observer.observe(child);
      });
    });

    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
  return ref;
}

export function useParallax() {
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    document.querySelectorAll('.parallax-slow').forEach((el) => {
      (el as HTMLElement).style.transform = `translateY(${scrollY * 0.15}px)`;
    });
    document.querySelectorAll('.parallax-fast').forEach((el) => {
      (el as HTMLElement).style.transform = `translateY(${scrollY * 0.3}px)`;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}

export function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

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
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

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

export function TypewriterText({ text, className = '' }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleTyping = () => {
      const fullText = text;
      
      setDisplayedText(
        isDeleting 
          ? fullText.substring(0, displayedText.length - 1)
          : fullText.substring(0, displayedText.length + 1)
      );

      setTypingSpeed(isDeleting ? 80 : 150);

      if (!isDeleting && displayedText === fullText) {
        // Jeda bentar pas teks utuh sblm hapus
        timer = setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && displayedText === '') {
        // Teks udah kehapus semua, mulai ngetik lagi
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(200); // jeda sebelum ngetik ulang
      } else {
        // Lanjutkan ngetik/hapus
        timer = setTimeout(handleTyping, typingSpeed);
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, loopNum, text, typingSpeed]);

  return (
    <span className={`typewriter-text ${className}`}>
      {displayedText}
      <span className="cursor-blink">|</span>
    </span>
  );
}

