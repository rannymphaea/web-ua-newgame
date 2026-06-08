'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Tab = 'all' | 'news' | 'blog' | 'event' | 'tutorials';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  thumbnail?: string;
  publishedAt: unknown;
  authorName: string;
  views?: number;
  tags?: string[];
  content?: string;
  youtubeEmbedId?: string;
  youtubeUrl?: string;
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'all',       label: 'Semua',    icon: 'ri-apps-2-line' },
  { key: 'news',      label: 'Berita',   icon: 'ri-newspaper-line' },
  { key: 'blog',      label: 'Blog',     icon: 'ri-quill-pen-line' },
  { key: 'event',     label: 'Event',    icon: 'ri-calendar-event-line' },
  { key: 'tutorials', label: 'Tutorial', icon: 'ri-video-line' },
];

const TUTORIAL_CATS = [
  { key: 'game-logic',  label: 'Game Logic',  icon: 'ri-cpu-line',     color: 'var(--clr-lavender)' },
  { key: 'game-design', label: 'Game Design', icon: 'ri-palette-line', color: 'var(--clr-info)' },
  { key: 'game-sound',  label: 'Game Sound',  icon: 'ri-music-2-line', color: 'var(--clr-gold-dim)' },
];

function formatDate(ts: unknown): string {
  if (!ts) return '';
  const d = (ts as {toDate?:()=>Date;seconds?:number}).toDate
    ? (ts as {toDate:()=>Date}).toDate()
    : (ts as {seconds?:number}).seconds
      ? new Date((ts as {seconds:number}).seconds * 1000)
      : new Date(ts as string);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NewsPage() {
  const [tab, setTab]                 = useState<Tab>('all');
  const [posts, setPosts]             = useState<Post[]>([]);
  const [tutorials, setTutorials]     = useState<Record<string, Post[]>>({});
  const [loading, setLoading]         = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post|null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'tutorials') setTab('tutorials');
  }, []);

  useEffect(() => { loadContent(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadContent() {
    setLoading(true);
    try {
      if (tab === 'tutorials') {
        const res = await api.get('/news/tutorials');
        setTutorials(res as Record<string, Post[]> || {});
      } else {
        const category = tab === 'all' ? '' : tab;
        const url = `/news/published${category ? `?category=${category}` : ''}`;
        const res = await api.get(url);
        setPosts(Array.isArray(res) ? res as Post[] : []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <div className="news-hero mb-xl">
        <div className="news-hero-text">
          <p className="news-eyebrow">
            <i className="ri-book-open-fill" style={{fontSize:11,marginRight:5,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
            Bacaan &amp; Ilmu
          </p>
          <h1 className="news-title">Berita &amp; Tutorial</h1>
          <p className="news-sub">Update terbaru dan panduan belajar dari NEWGAME Unand</p>
        </div>
        <div className="news-oc-wrap">
          <img src="/oc-read.svg" alt="OC Reading" className="news-oc-img animate-float" />
        </div>
      </div>

      {/* TABS */}
      <div className="news-tabs-wrap mb-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`news-tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
          >
            <i className={t.icon} style={{fontSize:14}} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid-cards">
          {[1,2,3].map(i => (
            <div key={i} className="card">
              <div className="skeleton" style={{height:160,marginBottom:12,borderRadius:8}} />
              <div className="skeleton" style={{height:18,width:'70%',marginBottom:8}} />
              <div className="skeleton" style={{height:13,width:'100%'}} />
            </div>
          ))}
        </div>
      ) : tab === 'tutorials' ? (
        <TutorialsView tutorials={tutorials} />
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="card" style={{padding:48,textAlign:'center'}}>
              <i className="ri-inbox-2-line" style={{fontSize:44,color:'var(--clr-text-secondary)',display:'block',marginBottom:12}} aria-hidden="true" />
              <p style={{fontFamily:'var(--font-cormorant)',fontSize:18,fontStyle:'italic',color:'var(--clr-text-secondary)'}}>
                Belum ada konten. Nantikan update terbaru!
              </p>
            </div>
          ) : (
            <div className="grid-cards">
              {posts.map(post => (
                <article key={post.id} className="news-card card card-hover" onClick={() => setSelectedPost(post)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSelectedPost(post)}>
                  {post.thumbnail ? (
                    <div className="news-thumb">
                      <img src={post.thumbnail} alt={post.title} loading="lazy" />
                      <div className="news-thumb-overlay" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="news-thumb news-thumb-placeholder">
                      <i className="ri-image-2-line" style={{fontSize:32,color:'var(--clr-text-secondary)'}} aria-hidden="true" />
                    </div>
                  )}
                  <div className="news-body">
                    <span className={`badge badge-${post.category} mb-sm`} style={{display:'inline-block'}}>{post.category}</span>
                    <h3 className="news-card-title">{post.title}</h3>
                    <p className="news-card-excerpt">{post.excerpt}</p>
                    <div className="news-meta">
                      <span><i className="ri-user-3-line" style={{fontSize:10,marginRight:3}} aria-hidden="true" />{post.authorName}</span>
                      <span className="news-meta-dot">·</span>
                      <span><i className="ri-time-line" style={{fontSize:10,marginRight:3}} aria-hidden="true" />{formatDate(post.publishedAt)}</span>
                      {(post.views ?? 0) > 0 && (
                        <><span className="news-meta-dot">·</span><span><i className="ri-eye-line" style={{fontSize:10,marginRight:3}} aria-hidden="true" />{post.views}</span></>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

      <style>{`
        .news-hero {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 28px;
          background: var(--clr-bg-surface);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--clr-border);
          border-radius: 18px; overflow: hidden; position: relative;
        }
        .news-hero::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--clr-lavender), var(--clr-gold), var(--clr-lavender));
          pointer-events: none;
        }
        .news-eyebrow {
          font-family: var(--font-inter); font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px;
          color: var(--clr-text-secondary); margin-bottom: 6px;
          display: flex; align-items: center;
        }
        .news-title { font-family: var(--font-lora); font-size: clamp(20px,3vw,28px); font-weight: 700; color: var(--clr-text-primary); margin-bottom: 6px; line-height: 1.1; }
        .news-sub { font-family: var(--font-cormorant); font-size: 15px; color: var(--clr-text-secondary); font-style: italic; }
        .news-oc-wrap { flex-shrink: 0; }
        .news-oc-img { width: 120px; height: 120px; object-fit: contain; filter: drop-shadow(0 6px 20px rgba(185,166,206,0.3)); transition: none !important; }

        .news-tabs-wrap { display: flex; gap: 6px; flex-wrap: wrap; background: var(--clr-bg-muted); border: 1px solid var(--clr-border); border-radius: 12px; padding: 5px; }
        .news-tab-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px;
          font-family: var(--font-inter); font-size: 13px; font-weight: 600;
          border-radius: 8px; border: none; cursor: pointer;
          color: var(--clr-text-secondary); background: transparent;
          transition: all 0.22s ease; white-space: nowrap;
        }
        .news-tab-btn:hover:not(.active) { background: var(--clr-bg-muted-hover); color: var(--clr-text-primary); }
        .news-tab-btn.active { background: var(--clr-gold-subtle); color: var(--clr-gold-dim); border: 1px solid var(--clr-border-gold); }

        .news-card { cursor: pointer; padding: 0; overflow: hidden; }
        .news-thumb { height: 175px; overflow: hidden; position: relative; background: var(--clr-bg-secondary); display: flex; align-items: center; justify-content: center; }
        .news-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease !important; }
        .news-card:hover .news-thumb img { transform: scale(1.06); }
        .news-thumb-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, var(--clr-bg-muted)); }
        .news-thumb-placeholder { background: var(--gradient-ink); }
        .news-body { padding: 16px 18px; }
        .news-card-title { font-family: var(--font-lora); font-size: 16.5px; font-weight: 600; color: var(--clr-text-primary); margin: 6px 0 8px; line-height: 1.35; }
        .news-card-excerpt { font-family: var(--font-cormorant); font-size: 14.5px; color: var(--clr-text-secondary); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px; }
        .news-meta { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; font-family: var(--font-inter); font-size: 11px; color: var(--clr-text-secondary); }
        .news-meta-dot { opacity: 0.5; }

        .tut-thumb { position: relative; height: 168px; overflow: hidden; background: var(--clr-bg-secondary); }
        .tut-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease !important; }
        .tutorial-card:hover .tut-thumb img { transform: scale(1.06); }
        .tut-thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--gradient-ink); }
        .tut-play-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(13,17,23,0.3); opacity: 0; transition: opacity 0.25s ease !important; }
        .tutorial-card:hover .tut-play-overlay { opacity: 1; }
        .tut-play-btn { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }
        .tut-accent-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }

        .modal-backdrop { position: fixed; inset: 0; background: rgba(13,17,23,0.55); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: var(--space-lg); }
        .modal-box { max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 0; position: relative; background: var(--clr-bg-surface-elevated); border: 1px solid var(--clr-border); border-radius: var(--radius-lg); }
        .modal-close-btn { position: absolute; top: 12px; right: 12px; z-index: 10; width: 34px; height: 34px; border-radius: 50%; background: var(--clr-bg-surface-elevated); border: 1px solid var(--clr-border); color: var(--clr-text-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); transition: transform 0.2s ease, background 0.2s ease !important; }
        .modal-close-btn:hover { transform: scale(1.08); background: var(--clr-bg-hover); }
        .modal-hero-img { height: 260px; overflow: hidden; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
        .modal-hero-img img { width: 100%; height: 100%; object-fit: cover; }
        .modal-body { padding: 22px 24px; }
        .post-content { font-family: var(--font-cormorant); font-size: 17px; line-height: 1.8; color: var(--clr-text-secondary); }
        .post-content p { margin-bottom: 12px; }
        .post-content h2,.post-content h3,.post-content h4 { font-family: var(--font-lora); color: var(--clr-text-primary); margin: 16px 0 8px; }

        @media (max-width: 768px) {
          .news-hero { padding: 16px 18px; }
          .news-title { font-size: 20px; }
          .news-oc-img { width: 80px; height: 80px; }
          .news-tabs-wrap { gap: 3px; padding: 3px; }
          .news-tab-btn { padding: 7px 11px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}

function TutorialsView({ tutorials }: { tutorials: Record<string, Post[]> }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:32}}>
      {TUTORIAL_CATS.map(cat => (
        <div key={cat.key}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,paddingBottom:10,borderBottom:'1px solid var(--clr-border)'}}>
            <div style={{width:36,height:36,borderRadius:10,background:'var(--clr-bg-muted)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className={cat.icon} style={{fontSize:18,color:cat.color}} aria-hidden="true" />
            </div>
            <h3 style={{fontFamily:'var(--font-lora)',fontSize:18,fontWeight:600,color:'var(--clr-text-primary)'}}>{cat.label}</h3>
          </div>
          {(!tutorials[cat.key] || tutorials[cat.key].length === 0) ? (
            <div className="card" style={{padding:28,textAlign:'center'}}>
              <i className="ri-video-off-line" style={{fontSize:28,color:'var(--clr-text-secondary)',display:'block',marginBottom:8}} aria-hidden="true" />
              <p style={{fontFamily:'var(--font-inter)',fontSize:13,color:'var(--clr-text-secondary)'}}>Belum ada tutorial</p>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(280px,100%),1fr))',gap:14}}>
              {tutorials[cat.key].map(t => (
                <TutorialCard key={t.id} tutorial={t} accentColor={cat.color} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TutorialCard({ tutorial, accentColor }: { tutorial: Post; accentColor: string }) {
  const thumbUrl = tutorial.youtubeEmbedId
    ? `https://img.youtube.com/vi/${tutorial.youtubeEmbedId}/mqdefault.jpg`
    : tutorial.thumbnail;
  return (
    <a href={tutorial.youtubeUrl || '#'} target="_blank" rel="noopener noreferrer"
      className="tutorial-card card card-hover"
      style={{textDecoration:'none',color:'inherit',padding:0,overflow:'hidden',display:'block'}}>
      <div className="tut-thumb">
        {thumbUrl && <img src={thumbUrl} alt={tutorial.title} loading="lazy" />}
        {!thumbUrl && <div className="tut-thumb-placeholder"><i className="ri-video-line" style={{fontSize:32,color:'var(--clr-text-secondary)'}} aria-hidden="true" /></div>}
        {tutorial.youtubeEmbedId && (
          <div className="tut-play-overlay">
            <div className="tut-play-btn"><i className="ri-play-fill" style={{fontSize:22,color:'white',marginLeft:2}} aria-hidden="true" /></div>
          </div>
        )}
        <div className="tut-accent-bar" style={{background:accentColor}} />
      </div>
      <div style={{padding:'12px 16px'}}>
        <h4 style={{fontFamily:'var(--font-lora)',fontSize:14.5,fontWeight:600,color:'var(--clr-text-primary)',marginBottom:5,lineHeight:1.35}}>{tutorial.title}</h4>
        <p style={{fontFamily:'var(--font-inter)',fontSize:11,color:'var(--clr-text-secondary)',display:'flex',alignItems:'center',gap:4}}>
          <i className="ri-user-3-line" style={{fontSize:10}} aria-hidden="true" />{tutorial.authorName}
          <span style={{opacity:0.5}}>·</span>
          <i className="ri-time-line" style={{fontSize:10}} aria-hidden="true" />{formatDate(tutorial.publishedAt)}
        </p>
      </div>
    </a>
  );
}

function PostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  // Escape key + scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      // Nuke iframe src on unmount — stops YouTube audio/video playback
      document.querySelectorAll<HTMLIFrameElement>('.youtube-embed iframe')
        .forEach(f => { f.src = ''; f.remove(); });
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      <div className="modal-box animate-spring-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
          <i className="ri-close-line" style={{fontSize:18}} aria-hidden="true" />
        </button>
        {post.thumbnail && (
          <div className="modal-hero-img">
            <img src={post.thumbnail} alt={post.title} />
          </div>
        )}
        <div className="modal-body">
          <span className={`badge badge-${post.category}`} style={{marginBottom:12,display:'inline-block'}}>{post.category}</span>
          <h2 style={{fontFamily:'var(--font-lora)',fontSize:22,fontWeight:700,color:'var(--clr-text-primary)',marginBottom:8,lineHeight:1.3}}>{post.title}</h2>
          <p style={{fontFamily:'var(--font-inter)',fontSize:11,color:'var(--clr-text-secondary)',marginBottom:20,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
            <i className="ri-user-3-line" style={{fontSize:11}} aria-hidden="true" />{post.authorName}
            <span>·</span>
            <i className="ri-time-line" style={{fontSize:11}} aria-hidden="true" />{formatDate(post.publishedAt)}
            <span>·</span>
            <i className="ri-eye-line" style={{fontSize:11}} aria-hidden="true" />{post.views || 0} views
          </p>
          {post.youtubeEmbedId && (
            <div className="youtube-embed mb-lg">
              {/* lazy src — prevents autoplay before modal visible */}
              <iframe
                src={`https://www.youtube.com/embed/${post.youtubeEmbedId}?enablejsapi=1`}
                title={post.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
          {post.tags && post.tags.length > 0 && (
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:20}}>
              {post.tags.map(tag => (
                <span key={tag} className="badge badge-gray">
                  <i className="ri-hashtag" style={{fontSize:9}} aria-hidden="true" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
