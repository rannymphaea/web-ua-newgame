'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function MemberDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [member, setMember] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [pillarLevels, setPillarLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, b, p] = await Promise.all([
          api.get(`/users/${userId}`).catch(() => null),
          api.get(`/badges/user/${userId}`).catch(() => []),
          api.get(`/pillar-levels/user/${userId}`).catch(() => []),
        ]);
        setMember(u);
        setBadges(Array.isArray(b) ? b : []);
        setPillarLevels(Array.isArray(p) ? p : []);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    if (userId) load();
  }, [userId]);

  if (loading) return <div className="animate-fade-in"><div className="skeleton" style={{height:300,borderRadius:12}}/></div>;
  if (!member) return (
    <div className="card" style={{padding:40,textAlign:'center'}}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" style={{margin:'0 auto 16px'}}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <p className="text-muted">Member tidak ditemukan</p>
    </div>
  );

  const PILLAR_COLORS: Record<string, string> = { game_logic: '#3b82f6', game_design: '#a855f7', game_sound: '#22c55e' };
  const LEVEL_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b'];

  return (
    <div className="animate-fade-in">
      <div className="card" style={{padding:28,display:'flex',alignItems:'center',gap:20,marginBottom:24}}>
        {member.photoURL ? (
          <img src={member.photoURL} alt="" style={{width:72,height:72,borderRadius:'50%',objectFit:'cover',border:'3px solid rgba(230,57,70,0.3)'}} />
        ) : (
          <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,var(--color-red),var(--color-blue))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:'white'}}>
            {(member.displayName || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 style={{fontSize:22,fontWeight:700}}>{member.displayName || member.email}</h2>
          {member.username && <p className="text-muted" style={{fontSize:13}}>@{member.username}</p>}
          <p style={{fontSize:13,marginTop:4}}>
            <span style={{padding:'3px 10px',borderRadius:12,background:'rgba(230,57,70,0.15)',color:'var(--color-red)',fontSize:11,fontWeight:600,textTransform:'uppercase'}}>{member.role}</span>
          </p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:24}}>
        {[
          { label: 'XP', value: member.xpCache || 0, color: '#E63946' },
          { label: 'Level', value: Math.floor((member.xpCache || 0) / 100) + 1, color: '#a78bfa' },
          { label: 'Streak', value: member.streak || 0, color: '#fbbf24' },
          { label: 'Attended', value: member.attendanceCount || 0, color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} className="card" style={{padding:16,textAlign:'center'}}>
            <p style={{fontSize:24,fontWeight:700,color:s.color}}>{s.value}</p>
            <p className="text-muted" style={{fontSize:12}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pillar Levels */}
      {pillarLevels.length > 0 && (
        <div className="card" style={{padding:20,marginBottom:24}}>
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>Pillar Levels</h3>
          {pillarLevels.map((pl: any, i: number) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0'}}>
              <span style={{fontSize:13,flex:1,textTransform:'capitalize'}}>{(pl.pillarId || '').replace('_', ' ')}</span>
              <span style={{padding:'4px 12px',borderRadius:12,fontSize:12,fontWeight:600,background:`${LEVEL_COLORS[pl.level - 1]}20`,color:LEVEL_COLORS[pl.level - 1]}}>Level {pl.level}</span>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card" style={{padding:20}}>
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:12}}>Badges ({badges.length})</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {badges.map((b: any, i: number) => (
              <span key={i} style={{padding:'4px 12px',borderRadius:12,fontSize:12,background:'rgba(230,57,70,0.1)',color:'var(--color-red)'}}>{b.badgeId}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
