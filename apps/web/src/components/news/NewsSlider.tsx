'use client';
import { useState, useEffect, useCallback } from 'react';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: 'blog' | 'news' | 'event' | 'tutorial';
  thumbnail?: string;
  publishedAt: unknown;
  authorName: string;
  youtubeEmbedId?: string;
  tutorialCategory?: string;
}

interface NewsSliderProps {
  items: NewsItem[];
  autoPlayInterval?: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  blog: 'Blog', news: 'Berita', event: 'Event', tutorial: 'Tutorial',
};

function formatDate(ts: unknown): string {
  if (!ts) return '';
  const d = (ts as {toDate?:()=>Date}).toDate
    ? (ts as {toDate:()=>Date}).toDate()
    : (ts as {seconds?:number}).seconds
      ? new Date((ts as {seconds:number}).seconds * 1000)
      : new Date(ts as string);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function NewsSlider({ items, autoPlayInterval = 5000 }: NewsSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const next = useCallback(() => { setCurrent(c => (c + 1) % items.length); }, [items.length]);
  const prev = useCallback(() => { setCurrent(c => (c - 1 + items.length) % items.length); }, [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [paused, next, autoPlayInterval, items.length]);

  if (!items.length) return null;

  return (
    <div className="news-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="slider-header">
        <h3 className="slider-title">
          <i className="ri-newspaper-fill" aria-hidden="true" />
          Berita &amp; Highlight
        </h3>
        <div className="slider-controls">
          <button onClick={prev} className="slider-btn" aria-label="Sebelumnya">
            <i className="ri-arrow-left-s-line" style={{fontSize:18}} aria-hidden="true" />
          </button>
          <span className="slider-counter" aria-live="polite" aria-atomic="true">
            {current + 1}/{items.length}
          </span>
          <button onClick={next} className="slider-btn" aria-label="Berikutnya">
            <i className="ri-arrow-right-s-line" style={{fontSize:18}} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="slider-track">
        <div className="slider-slides" style={{ transform: `translateX(-${current * 100}%)` }}>
          {items.map(item => (
            <div key={item.id} className="slide">
              <div className="slide-inner card">
                {item.thumbnail && (
                  <div className="slide-image">
                    <img src={item.thumbnail} alt={item.title} loading="lazy" />
                    <span className={`badge badge-${item.category} slide-badge`}>{CATEGORY_LABELS[item.category]}</span>
                  </div>
                )}
                {!item.thumbnail && (
                  <div className="slide-image slide-image-placeholder">
                    <span className={`badge badge-${item.category} slide-badge`}>{CATEGORY_LABELS[item.category]}</span>
                  </div>
                )}
                <div className="slide-content">
                  <h4 className="slide-title">{item.title}</h4>
                  <p className="slide-excerpt">{item.excerpt}</p>
                  <div className="slide-meta">
                    <span>{item.authorName}</span>
                    <span>·</span>
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="slider-dots" role="tablist" aria-label="Slide navigation">
        {items.map((_, i) => (
          <button
            key={i}
            className={`dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            aria-selected={i === current}
            role="tab"
          />
        ))}
      </div>

      <style>{`
        .news-slider { margin-bottom:var(--space-xl); }
        .slider-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-md); }
        .slider-title { display:flex; align-items:center; gap:8px; font-family:var(--font-lora); font-size:18px; font-weight:600; color:var(--clr-text-primary); }
        .slider-controls { display:flex; align-items:center; gap:8px; }
        .slider-btn { background:var(--clr-bg-muted); border:1px solid var(--clr-border); color:var(--clr-text-secondary); border-radius:var(--radius-md); padding:6px 8px; cursor:pointer; transition:all 0.2s ease !important; display:flex; align-items:center; }
        .slider-btn:hover { background:var(--clr-gold-subtle); border-color:var(--clr-border-gold); color:var(--clr-gold-dim); }
        .slider-counter { font-size:12px; color:var(--clr-text-secondary); font-weight:600; min-width:32px; text-align:center; font-family:var(--font-inter); }
        .slider-track { overflow:hidden; border-radius:var(--radius-lg); }
        .slider-slides { display:flex; transition:transform 0.5s cubic-bezier(0.4,0,0.2,1) !important; }
        .slide { min-width:100%; padding:0 2px; }
        .slide-inner { display:flex; overflow:hidden; min-height:200px; }
        .slide-image { width:300px; flex-shrink:0; position:relative; overflow:hidden; background:var(--clr-bg-secondary); }
        .slide-image img { width:100%; height:100%; object-fit:cover; }
        .slide-image-placeholder { background:var(--gradient-ink); display:flex; align-items:flex-start; padding:16px; }
        .slide-badge { position:absolute; top:12px; left:12px; z-index:2; }
        .slide-content { flex:1; padding:var(--space-lg); display:flex; flex-direction:column; justify-content:center; }
        .slide-title { font-family:var(--font-lora); font-size:22px; font-weight:600; color:var(--clr-text-primary); margin-bottom:8px; line-height:1.3; }
        .slide-excerpt { font-family:var(--font-cormorant); font-size:15px; color:var(--clr-text-secondary); line-height:1.6; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
        .slide-meta { display:flex; gap:8px; font-size:12px; color:var(--clr-text-secondary); font-family:var(--font-inter); }
        .slider-dots { display:flex; justify-content:center; gap:6px; margin-top:var(--space-md); }
        .dot { width:8px; height:8px; border-radius:50%; border:none; background:var(--clr-border); cursor:pointer; transition:all 0.3s ease !important; padding:0; }
        .dot.active { background:var(--clr-gold-dim); width:24px; border-radius:4px; }
        @media (max-width:768px) {
          .slide-inner { flex-direction:column; }
          .slide-image { width:100%; height:160px; }
          .slide-title { font-size:18px; }
        }
      `}</style>
    </div>
  );
}
