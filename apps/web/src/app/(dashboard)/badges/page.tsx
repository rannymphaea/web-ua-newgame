'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const RARITY_CONFIG: Record<string, { color: string; bg: string; border: string; glow: boolean }> = {
  common:       { color: 'var(--clr-rarity-common)',       bg: 'var(--clr-rarity-common-bg)',       border: 'var(--clr-rarity-common-border)',       glow: false },
  uncommon:     { color: 'var(--clr-rarity-uncommon)',     bg: 'var(--clr-rarity-uncommon-bg)',     border: 'var(--clr-rarity-uncommon-border)',     glow: false },
  rare:         { color: 'var(--clr-rarity-rare)',         bg: 'var(--clr-rarity-rare-bg)',         border: 'var(--clr-rarity-rare-border)',         glow: true  },
  epic:         { color: 'var(--clr-rarity-epic)',         bg: 'var(--clr-rarity-epic-bg)',         border: 'var(--clr-rarity-epic-border)',         glow: true  },
  legendary:    { color: 'var(--clr-rarity-legendary)',    bg: 'var(--clr-rarity-legendary-bg)',    border: 'var(--clr-rarity-legendary-border)',    glow: true  },
  mythic:       { color: 'var(--clr-rarity-mythic)',       bg: 'var(--clr-rarity-mythic-bg)',       border: 'var(--clr-rarity-mythic-border)',       glow: true  },
  transcendent: { color: 'var(--clr-rarity-transcendent)', bg: 'var(--clr-rarity-transcendent-bg)', border: 'var(--clr-rarity-transcendent-border)', glow: true  },
  secret:       { color: 'var(--clr-rarity-secret)',       bg: 'var(--clr-rarity-secret-bg)',       border: 'var(--clr-rarity-secret-border)',       glow: false },
  limited:      { color: 'var(--clr-rarity-limited)',      bg: 'var(--clr-rarity-limited-bg)',      border: 'var(--clr-rarity-limited-border)',      glow: true  },
  founder:      { color: 'var(--clr-rarity-founder)',      bg: 'var(--clr-rarity-founder-bg)',      border: 'var(--clr-rarity-founder-border)',      glow: true  },
};

const RARITY_ICON: Record<string, string> = {
  common: 'ri-star-line', uncommon: 'ri-star-fill', rare: 'ri-gem-line',
  epic: 'ri-vip-crown-line', legendary: 'ri-flashlight-fill', mythic: 'ri-fire-fill',
  transcendent: 'ri-sparkling-fill', secret: 'ri-eye-off-fill', limited: 'ri-time-fill',
  founder: 'ri-medal-fill',
};

interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: string;
  category?: string;
  condition?: { type?: string };
}

interface BadgeDefinitions {
  badges?: Badge[];
  categories?: Array<{ id: string; label: string }>;
}

interface MyBadge {
  badgeId: string;
}

export default function BadgesPage() {
  const [definitions, setDefinitions] = useState<BadgeDefinitions | null>(null);
  const [myBadges, setMyBadges]       = useState<MyBadge[]>([]);
  const [filter, setFilter]           = useState('all');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [defs, mine] = await Promise.all([
          api.get('/badges/definitions'),
          api.get('/badges/my'),
        ]);
        setDefinitions(defs as BadgeDefinitions);
        setMyBadges(mine as MyBadge[] || []);
        api.get('/badges/check').catch(() => {});
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton" style={{height:120,borderRadius:16,marginBottom:20}} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
        {[1,2,3,4,6].map(i => <div key={i} className="skeleton" style={{height:160,borderRadius:14}} />)}
      </div>
    </div>
  );

  const badges      = definitions?.badges || [];
  const categories  = definitions?.categories || [];
  const unlockedIds = myBadges.map(b => b.badgeId);
  const filtered    = filter === 'all' ? badges : badges.filter(b => b.category === filter);
  const unlocked    = unlockedIds.length;
  const total       = badges.length;
  const pct         = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <div className="badges-hero mb-xl">
        <div className="badges-hero-text">
          <p className="badges-eyebrow">
            <i className="ri-treasure-map-fill" style={{fontSize:11,marginRight:5,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
            Koleksi Pencapaian
          </p>
          <h1 className="badges-title">Badge Collection</h1>
          <p className="badges-sub">
            Kamu telah membuka <strong style={{color:'var(--clr-gold-dim)'}}>{unlocked}</strong> dari <strong>{total}</strong> badge ({pct}%)
          </p>
        </div>
        <div className="badges-oc-wrap">
          <img src="/oc-gold.svg" alt="Gold Guardian OC" className="badges-oc-img animate-float" />
        </div>
      </div>

      {/* PROGRESS */}
      <div className="card mb-xl" style={{padding:'18px 22px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <span style={{fontFamily:'var(--font-lora)',fontWeight:600,fontSize:14,color:'var(--clr-text-primary)'}}>Progress Koleksi</span>
          <span style={{fontFamily:'var(--font-inter)',fontWeight:700,fontSize:15,color:'var(--clr-gold-dim)'}}>{pct}%</span>
        </div>
        <div className="glow-progress-track">
          <div className="glow-progress-fill" style={{width:`${pct}%`}} />
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
          <span style={{fontFamily:'var(--font-inter)',fontSize:11,color:'var(--clr-text-secondary)'}}>{unlocked} terbuka</span>
          <span style={{fontFamily:'var(--font-inter)',fontSize:11,color:'var(--clr-text-secondary)'}}>{total - unlocked} tersisa</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filter-scroll mb-xl">
        <button onClick={() => setFilter('all')} className={`filter-pill${filter === 'all' ? ' active' : ''}`} aria-pressed={filter === 'all'}>
          <i className="ri-apps-2-line" style={{fontSize:13}} aria-hidden="true" /> Semua
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`filter-pill${filter === c.id ? ' active' : ''}`} aria-pressed={filter === c.id}>
            {c.label}
          </button>
        ))}
      </div>

      {/* BADGE GRID */}
      <div className="badges-grid">
        {filtered.map(badge => {
          const isUnlocked = unlockedIds.includes(badge.id);
          const cfg        = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
          const iconClass  = RARITY_ICON[badge.rarity] || 'ri-star-line';
          const isHidden   = badge.condition?.type === 'hidden' && !isUnlocked;
          return (
            <div
              key={badge.id}
              className={`badge-card${isUnlocked ? ' unlocked' : ' locked'}${cfg.glow && isUnlocked ? ' has-glow' : ''}`}
              style={{ '--bc': cfg.color, '--bb': cfg.bg, '--be': cfg.border } as React.CSSProperties}
            >
              <div className="badge-rarity-strip" aria-hidden="true" />
              <div className="badge-rarity-label">{badge.rarity}</div>
              <div className="badge-icon-wrap">
                {isUnlocked
                  ? <i className={iconClass} style={{fontSize:26,color:cfg.color}} aria-hidden="true" />
                  : <i className="ri-lock-2-line" style={{fontSize:24,color:'var(--clr-text-secondary)'}} aria-hidden="true" />
                }
              </div>
              <h3 className="badge-name">{isHidden ? '???' : badge.name}</h3>
              <p className="badge-desc">{isHidden ? 'Syarat tersembunyi' : badge.description}</p>
              {isUnlocked && (
                <div className="badge-unlocked-chip">
                  <i className="ri-checkbox-circle-fill" style={{fontSize:10,marginRight:3}} aria-hidden="true" />
                  Diraih
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{padding:40,textAlign:'center'}}>
          <i className="ri-inbox-line" style={{fontSize:40,color:'var(--clr-text-secondary)',marginBottom:12,display:'block'}} aria-hidden="true" />
          <p style={{fontFamily:'var(--font-inter)',color:'var(--clr-text-secondary)'}}>Tidak ada badge di kategori ini</p>
        </div>
      )}

      <style>{`
        .badges-hero { display:flex; align-items:center; justify-content:space-between; padding:24px 28px; background:var(--clr-bg-surface); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid var(--clr-border-gold); border-radius:18px; overflow:hidden; position:relative; }
        .badges-hero::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--clr-gold),var(--clr-lavender),var(--clr-gold)); pointer-events:none; }
        .badges-eyebrow { font-family:var(--font-inter); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--clr-text-secondary); margin-bottom:6px; display:flex; align-items:center; }
        .badges-title { font-family:var(--font-lora); font-size:clamp(22px,3vw,30px); font-weight:700; color:var(--clr-text-primary); margin-bottom:6px; line-height:1.1; }
        .badges-sub { font-family:var(--font-cormorant); font-size:16px; color:var(--clr-text-secondary); font-style:italic; }
        .badges-oc-wrap { flex-shrink:0; }
        .badges-oc-img { width:120px; height:120px; object-fit:contain; filter:drop-shadow(0 6px 20px var(--clr-gold-glow)); transition:none !important; }
        .filter-scroll { display:flex; gap:8px; flex-wrap:wrap; }
        .filter-pill { display:inline-flex; align-items:center; gap:5px; padding:7px 16px; font-family:var(--font-inter); font-size:12.5px; font-weight:600; border-radius:var(--radius-full); border:1px solid var(--clr-border); background:var(--clr-bg-surface-elevated); color:var(--clr-text-secondary); cursor:pointer; transition:all 0.22s ease !important; }
        .filter-pill:hover { background:var(--clr-gold-subtle); border-color:var(--clr-border-gold); color:var(--clr-text-primary); }
        .filter-pill.active { background:var(--clr-gold-subtle); border-color:var(--clr-border-gold); color:var(--clr-gold-dim); box-shadow:0 0 16px var(--clr-gold-glow); }
        .badges-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr)); gap:14px; }
        .badge-card { background:var(--clr-bg-surface-elevated); backdrop-filter:blur(12px); border:1px solid var(--be); border-radius:14px; padding:20px 16px 16px; text-align:center; position:relative; overflow:hidden; transition:all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .badge-card.locked { opacity:0.48; filter:grayscale(0.3); }
        .badge-card.unlocked:hover { transform:translateY(-5px); box-shadow:var(--shadow-lg); }
        .badge-card.has-glow { box-shadow:0 0 24px var(--bb); }
        .badge-rarity-strip { position:absolute; top:0; left:0; right:0; height:3px; background:var(--bc); opacity:0.8; }
        .badge-rarity-label { position:absolute; top:10px; right:10px; font-family:var(--font-inter); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:var(--bc); background:var(--bb); padding:2px 8px; border-radius:20px; border:1px solid var(--be); }
        .badge-icon-wrap { width:54px; height:54px; border-radius:50%; background:var(--bb); border:2px solid var(--be); display:flex; align-items:center; justify-content:center; margin:12px auto; transition:transform 0.3s ease !important; }
        .badge-card.unlocked:hover .badge-icon-wrap { transform:scale(1.12) rotate(-5deg); }
        .badge-name { font-family:var(--font-lora); font-size:13.5px; font-weight:600; color:var(--clr-text-primary); margin-bottom:6px; line-height:1.3; }
        .badge-desc { font-family:var(--font-inter); font-size:11px; color:var(--clr-text-secondary); line-height:1.5; margin-bottom:10px; }
        .badge-unlocked-chip { display:inline-flex; align-items:center; font-family:var(--font-inter); font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--clr-success); background:var(--clr-success-bg); border:1px solid var(--clr-success-border); padding:3px 10px; border-radius:20px; }
        @media (max-width:768px) {
          .badges-hero { padding:16px 18px; }
          .badges-oc-img { width:80px; height:80px; }
          .badges-grid { grid-template-columns:repeat(auto-fill,minmax(min(150px,100%),1fr)); }
        }
      `}</style>
    </div>
  );
}
