'use client';
import { useEffect, useRef } from 'react';

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function PaperCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use fixed seed PRNG for reproducibility
    const rng  = mulberry32(42);
    const rng2 = mulberry32(42);

    function draw() {
      if (!canvas || !ctx) return;

      // ── FIX C3: Draw to VIEWPORT ONLY, not document.scrollHeight ──
      const W = window.innerWidth;
      const H = window.innerHeight;      // was: document.documentElement.scrollHeight
      canvas.width  = W;
      canvas.height = H;

      // Base parchment
      ctx.fillStyle = 'rgba(237,232,223,0.55)';
      ctx.fillRect(0, 0, W, H);

      // Grain noise — pixel loop limited to viewport
      const id = ctx.getImageData(0, 0, W, H);
      const d  = id.data;
      const r2 = mulberry32(42);
      for (let i = 0; i < d.length; i += 4) {
        const g = (r2() - 0.5) * 28;
        d[i]   = Math.min(255, Math.max(180, d[i]   + g));
        d[i+1] = Math.min(255, Math.max(170, d[i+1] + g * 0.85));
        d[i+2] = Math.min(255, Math.max(155, d[i+2] + g * 0.65));
      }
      ctx.putImageData(id, 0, 0);

      // Fold lines
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const folds: [number,number,number,number,number,number,number,number,number,number,boolean][] = [
        [W*0.1, 0, W*0.25, H*0.3, W*0.15, H*0.6, W*0.2,  H,    0.10, 1.8, true ],
        [W*0.5, 0, W*0.6,  H*0.25,W*0.45, H*0.55,W*0.55, H,    0.08, 1.4, true ],
        [W*0.8, 0, W*0.7,  H*0.4, W*0.85, H*0.65,W*0.75, H,    0.07, 1.2, false],
        [0,   H*0.2, W*0.3,H*0.18,W*0.6,  H*0.22,W,    H*0.2,  0.06, 1.0, false],
        [0,   H*0.6, W*0.4,H*0.58,W*0.65, H*0.63,W,    H*0.6,  0.08, 1.2, true ],
      ];
      folds.forEach(([x1,y1,cp1x,cp1y,cp2x,cp2y,x2,y2,alpha,lw,hasShadow]) => {
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x2,y2);
        ctx.strokeStyle = `rgba(100,80,60,${alpha})`;
        ctx.lineWidth = lw;
        ctx.stroke();
        if (hasShadow) {
          ctx.beginPath();
          ctx.moveTo(x1+3,y1);
          ctx.bezierCurveTo(cp1x+3,cp1y,cp2x+3,cp2y,x2+3,y2);
          ctx.strokeStyle = `rgba(255,255,255,${alpha*0.5})`;
          ctx.lineWidth = lw*0.7;
          ctx.stroke();
        }
      });
      ctx.restore();

      // Fiber lines
      ctx.save();
      for (let i = 0; i < 30; i++) {   // reduced from 40 to 30
        const x1    = rng() * W;
        const y1    = rng() * H;
        const angle = (rng() - 0.5) * Math.PI * 0.7;
        const len   = 25 + rng() * 80;  // reduced max from 120 to 80
        const cxp   = x1 + Math.cos(angle + 0.3) * len * 0.5;
        const cyp   = y1 + Math.sin(angle + 0.3) * len * 0.5;
        const x2    = x1 + Math.cos(angle) * len;
        const y2    = y1 + Math.sin(angle) * len;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cxp, cyp, x2, y2);
        ctx.strokeStyle = `rgba(${rng()>0.5?'120,80,40':'160,120,70'},${0.05 + rng()*0.07})`;
        ctx.lineWidth = 0.4 + rng() * 0.6;
        ctx.stroke();
      }
      ctx.restore();
    }

    draw();

    // Debounce resize — skip if dimensions unchanged
    let resizeTimer: ReturnType<typeof setTimeout>;
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Skip redraw if dimensions didn't actually change
        if (window.innerWidth === lastW && window.innerHeight === lastH) return;
        lastW = window.innerWidth;
        lastH = window.innerHeight;
        draw();
      }, 300);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="paper-canvas"
      aria-hidden="true"
    />
  );
}
