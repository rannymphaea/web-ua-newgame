'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface LBUser {
  id: string;
  name: string;
  photoURL?: string;
  xpCache: number;
  streak?: number;
  division?: string;
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [users, setUsers]   = useState<LBUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard?limit=50')
      .then(res => setUsers(Array.isArray(res) ? res as LBUser[] : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const podiumOrder  = [1, 0, 2];
  const podiumColors = [
    { bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', shadow:'rgba(251,191,36,0.3)', iconColor:'#fbbf24', label:'1st' },
    { bg: 'linear-gradient(135deg,#94a3b8,#64748b)', shadow:'rgba(148,163,184,0.3)', iconColor:'#94a3b8', label:'2nd' },
    { bg: 'linear-gradient(135deg,#cd7c3c,#b45309)', shadow:'rgba(205,124,60,0.3)',  iconColor:'#cd7c3c', label:'3rd' },
  ];
  const rankColors = ['#fbbf24','#94a3b8','#cd7c3c'];

  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <div className="lb-hero mb-xl">
        <div className="lb-hero-text">
          <p className="lb-eyebrow">
            <i className="ri-trophy-fill" style={{fontSize:11,marginRight:5,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
            Hall of Fame
          </p>
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-sub">Para pejuang XP terbaik di NEWGAME Unand</p>
        </div>
        <div className="lb-oc-wrap">
          <img src="/oc-hero.png" alt="Champion OC" className="lb-oc-img animate-float" />
        </div>
      </div>

      {loading ? (
        <div className="card">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-md p-md" style={{borderBottom:'1px solid var(--clr-border)'}}>
              <div className="skeleton" style={{width:36,height:36,borderRadius:'50%'}} />
              <div className="flex-1">
                <div className="skeleton mb-sm" style={{width:'60%',height:16}} />
                <div className="skeleton" style={{width:'30%',height:12}} />
              </div>
              <div className="skeleton" style={{width:60,height:20}} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* PODIUM */}
          {users.length >= 3 && (
            <div className="podium-wrap card mb-xl">
              <div className="podium-inner">
                {podiumOrder.map(idx => {
                  const u = users[idx];
                  if (!u) return null;
                  const isFirst = idx === 0;
                  const pc = podiumColors[idx];
                  return (
                    <div key={idx} className={`podium-col${isFirst ? ' podium-first' : ''}`}>
                      <div className="podium-avatar-wrap" style={{background:pc.bg, boxShadow:`0 8px 24px ${pc.shadow}`}}>
                        {u.photoURL
                          ? <img src={u.photoURL} alt="" className="podium-avatar-img" />
                          : <span className="podium-initial">{(u.name||'U').charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <div className="podium-rank-icon" style={{color:pc.iconColor}}>
                        <i className="ri-medal-fill" style={{fontSize:isFirst?28:22}} aria-hidden="true" />
                        <span className="podium-rank-label">{pc.label}</span>
                      </div>
                      <p className="podium-name">{u.name||'Unknown'}</p>
                      <p className="podium-xp">
                        <i className="ri-flashlight-fill" style={{fontSize:11,marginRight:3,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
                        {(u.xpCache||0).toLocaleString()} XP
                      </p>
                      <span className="podium-level-badge">Lv.{Math.floor((u.xpCache||0)/100)+1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FULL TABLE */}
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div className="table-header-bar">
              <h3 style={{fontFamily:'var(--font-lora)',fontSize:15,fontWeight:600,color:'var(--clr-text-primary)'}}>Semua Peringkat</h3>
              <span className="badge badge-blue">{users.length} member</span>
            </div>
            <div className="table-container" style={{border:'none'}}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{width:60}}>Rank</th>
                    <th>Nama</th>
                    <th className="hide-mobile">Divisi</th>
                    <th style={{textAlign:'right'}}>XP</th>
                    <th style={{textAlign:'right'}}>Level</th>
                    <th style={{textAlign:'right'}} className="hide-mobile">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const isMe   = u.id === user?.uid;
                    const isTop3 = i < 3;
                    return (
                      <tr key={u.id} className={`lb-row${isMe?' lb-row-me':''}${isTop3?' lb-row-top':''}`}>
                        <td>
                          <div className="rank-cell">
                            {isTop3
                              ? <span className="rank-icon-top"><i className="ri-medal-fill" style={{fontSize:16,color:rankColors[i]}} aria-hidden="true" /></span>
                              : <span className="rank-num">{i+1}</span>
                            }
                          </div>
                        </td>
                        <td>
                          <div className="lb-user-cell">
                            <div className="lb-avatar" style={isTop3 ? {background:`linear-gradient(135deg,${rankColors[i]},rgba(255,255,255,0.4))`} : {}}>
                              {u.photoURL
                                ? <img src={u.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                                : <span>{(u.name||'U').charAt(0).toUpperCase()}</span>
                              }
                            </div>
                            <div>
                              <span className="lb-user-name">{u.name||'Unknown'}</span>
                              {isMe && <span className="lb-you-badge">Kamu</span>}
                            </div>
                          </div>
                        </td>
                        <td className="hide-mobile">
                          <span style={{fontFamily:'var(--font-inter)',fontSize:12,color:'var(--clr-text-secondary)'}}>{u.division||'-'}</span>
                        </td>
                        <td style={{textAlign:'right'}}><span className="lb-xp-val">{(u.xpCache||0).toLocaleString()}</span></td>
                        <td style={{textAlign:'right'}}><span className="badge badge-purple">Lv.{Math.floor((u.xpCache||0)/100)+1}</span></td>
                        <td style={{textAlign:'right'}} className="hide-mobile">
                          <span className="lb-streak">
                            <i className="ri-fire-fill" style={{fontSize:11,color:'var(--clr-warning)'}} aria-hidden="true" />
                            {u.streak||0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <style>{`
        .lb-hero { display:flex; align-items:center; justify-content:space-between; padding:24px 28px; background:var(--clr-bg-surface); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid var(--clr-border); border-radius:18px; position:relative; overflow:hidden; }
        .lb-hero::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#fbbf24,#94a3b8,#cd7c3c); pointer-events:none; }
        .lb-eyebrow { font-family:var(--font-inter); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--clr-text-secondary); margin-bottom:6px; display:flex; align-items:center; }
        .lb-title { font-family:var(--font-lora); font-size:clamp(22px,3vw,32px); font-weight:700; color:var(--clr-text-primary); margin-bottom:6px; line-height:1; }
        .lb-sub { font-family:var(--font-cormorant); font-size:16px; color:var(--clr-text-secondary); font-style:italic; }
        .lb-oc-wrap { flex-shrink:0; }
        .lb-oc-img { width:130px; height:130px; object-fit:contain; filter:drop-shadow(0 6px 20px rgba(185,166,206,0.3)); transition:none !important; }
        .podium-wrap { padding:32px 24px 24px; background:linear-gradient(180deg,var(--clr-gold-subtle) 0%,var(--clr-bg-surface) 100%); }
        .podium-inner { display:flex; align-items:flex-end; justify-content:center; gap:24px; }
        .podium-col { text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px; }
        .podium-first { margin-bottom:20px; order:0; }
        .podium-col:first-child { order:-1; }
        .podium-col:last-child { order:1; }
        .podium-avatar-wrap { border-radius:50%; width:64px; height:64px; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; transition:transform 0.3s ease !important; }
        .podium-first .podium-avatar-wrap { width:80px; height:80px; }
        .podium-col:hover .podium-avatar-wrap { transform:translateY(-4px) scale(1.04); }
        .podium-avatar-img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
        .podium-initial { font-family:var(--font-inter); font-size:22px; font-weight:700; color:white; }
        .podium-first .podium-initial { font-size:28px; }
        .podium-rank-icon { display:flex; flex-direction:column; align-items:center; gap:2px; }
        .podium-rank-label { font-family:var(--font-inter); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--clr-text-secondary); }
        .podium-name { font-family:var(--font-inter); font-size:13px; font-weight:600; color:var(--clr-text-primary); max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .podium-xp { font-family:var(--font-inter); font-size:12px; color:var(--clr-text-secondary); display:flex; align-items:center; }
        .podium-level-badge { font-family:var(--font-inter); font-size:10px; font-weight:700; background:var(--clr-lavender-subtle); color:var(--clr-lavender); padding:2px 8px; border-radius:20px; letter-spacing:0.3px; }
        .table-header-bar { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--clr-border); }
        .lb-row:hover td { background:var(--clr-bg-muted); }
        .lb-row-me td { background:var(--clr-gold-subtle) !important; }
        .rank-cell { display:flex; align-items:center; justify-content:center; }
        .rank-icon-top { display:flex; align-items:center; }
        .rank-num { font-family:var(--font-lora); font-weight:700; font-size:15px; color:var(--clr-text-secondary); }
        .lb-user-cell { display:flex; align-items:center; gap:10px; }
        .lb-avatar { width:32px; height:32px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,var(--clr-gold),var(--clr-lavender)); display:flex; align-items:center; justify-content:center; font-family:var(--font-inter); font-size:12px; font-weight:700; color:var(--clr-ink); overflow:hidden; }
        .lb-user-name { font-family:var(--font-inter); font-size:13px; font-weight:600; color:var(--clr-text-primary); }
        .lb-you-badge { display:inline-block; margin-left:6px; font-family:var(--font-inter); font-size:9px; font-weight:700; text-transform:uppercase; background:var(--clr-gold-subtle); color:var(--clr-gold-dim); padding:1px 6px; border-radius:10px; letter-spacing:0.5px; }
        .lb-xp-val { font-family:var(--font-lora); font-size:14px; font-weight:700; color:var(--clr-success); }
        .lb-streak { display:inline-flex; align-items:center; gap:4px; font-family:var(--font-inter); font-size:12px; color:var(--clr-text-secondary); }
        @media (max-width:768px) {
          .lb-hero { padding:16px 18px; }
          .lb-oc-img { width:80px; height:80px; }
          .podium-inner { gap:12px; }
        }
      `}</style>
    </div>
  );
}
