'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [users, events] = await Promise.all([
          api.get('/users?role=').catch(() => []),
          api.get('/events').catch(() => []),
        ]);
        const activeUsers = (users || []).filter((u: any) => u.status === 'active');
        const totalXP = (users || []).reduce((sum: number, u: any) => sum + (u.xpCache || 0), 0);
        const avgXP = users?.length ? Math.round(totalXP / users.length) : 0;
        setStats({
          totalUsers: users?.length || 0,
          activeUsers: activeUsers.length,
          totalEvents: events?.length || 0,
          totalXP, avgXP,
          topUsers: (users || []).sort((a: any, b: any) => (b.xpCache || 0) - (a.xpCache || 0)).slice(0, 5),
          xpDistribution: getXPDistribution(users || []),
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="animate-fade-in"><div className="skeleton" style={{height:400,borderRadius:12}}/></div>;
  if (!stats) return <div className="card" style={{padding:40,textAlign:'center'}}><p className="text-muted">Gagal memuat data</p></div>;

  return (
    <div className="animate-fade-in">
      <div className="welcome-section mb-lg">
        <h1 style={{fontFamily:'var(--font-display)',fontSize:'28px'}}>Analytics Dashboard</h1>
        <p className="text-muted text-sm">Statistik dan visualisasi data NEWGAME</p>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:32}}>
        {[
          { label: 'Total Anggota', value: stats.totalUsers, color: '#3b82f6' },
          { label: 'Anggota Aktif', value: stats.activeUsers, color: '#22c55e' },
          { label: 'Total Event', value: stats.totalEvents, color: '#a855f7' },
          { label: 'Total XP', value: stats.totalXP.toLocaleString(), color: '#f59e0b' },
          { label: 'Rata-rata XP', value: stats.avgXP, color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="card" style={{padding:'20px',borderLeft:`3px solid ${s.color}`}}>
            <p className="text-muted text-sm">{s.label}</p>
            <p style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* XP Distribution Chart (CSS bars) */}
      <div className="card mb-lg" style={{padding:24}}>
        <h3 style={{fontSize:16,fontWeight:600,marginBottom:20}}>Distribusi XP Anggota</h3>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {stats.xpDistribution.map((d: any, i: number) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{width:80,fontSize:12,color:'var(--color-text-muted)',textAlign:'right'}}>{d.label}</span>
              <div style={{flex:1,height:24,background:'rgba(255,255,255,0.05)',borderRadius:4,overflow:'hidden'}}>
                <div style={{width:`${d.pct}%`,height:'100%',background:`linear-gradient(90deg,${d.color}80,${d.color})`,borderRadius:4,transition:'width 0.8s ease',minWidth: d.count > 0 ? '2px' : '0'}}/>
              </div>
              <span style={{width:30,fontSize:12,color:'var(--color-text-muted)'}}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 */}
      <div className="card" style={{padding:24}}>
        <h3 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Top 5 Anggota</h3>
        {stats.topUsers.map((u: any, i: number) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none'}}>
            <span style={{width:24,height:24,borderRadius:'50%',background:['#f59e0b','#9ca3af','#cd7f32','#3b82f6','#a855f7'][i],display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'white'}}>{i+1}</span>
            <span style={{flex:1,fontSize:14}}>{u.displayName || u.email}</span>
            <span style={{fontSize:14,fontWeight:600,color:'var(--color-green)'}}>{(u.xpCache || 0).toLocaleString()} XP</span>
          </div>
        ))}
      </div>

      {/* Weekly Activity Heatmap */}
      <div className="card" style={{padding:24,marginTop:24}}>
        <h3 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Aktivitas Mingguan</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
          {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
            <div key={d} style={{textAlign:'center',fontSize:10,color:'var(--color-text-muted)',marginBottom:4}}>{d}</div>
          ))}
          {Array.from({length: 28}, (_, i) => {
            // Placeholder: intensity 0-4 (will be populated from real data)
            const intensity = Math.floor(Math.random() * 5);
            const colors = ['rgba(255,255,255,0.03)','rgba(34,197,94,0.2)','rgba(34,197,94,0.4)','rgba(34,197,94,0.6)','rgba(34,197,94,0.9)'];
            return <div key={i} style={{height:20,borderRadius:3,background:colors[intensity]}} title={`${intensity} aktivitas`}/>;
          })}
        </div>
        <p className="text-muted" style={{fontSize:11,marginTop:8}}>Data aktivitas 4 minggu terakhir (placeholder - akan terisi dari data real)</p>
      </div>

      {/* Export buttons */}
      <div style={{marginTop:24,display:'flex',gap:12,flexWrap:'wrap'}}>
        <a href="/api/export/attendance" className="btn btn-primary" style={{padding:'10px 20px',fontSize:13,textDecoration:'none'}}>Export Attendance CSV</a>
        <a href="/api/export/members" className="btn btn-primary" style={{padding:'10px 20px',fontSize:13,textDecoration:'none'}}>Export Members CSV</a>
        <a href="/api/export/users" className="btn btn-primary" style={{padding:'10px 20px',fontSize:13,textDecoration:'none'}}>Export Users CSV</a>
      </div>
    </div>
  );
}

function getXPDistribution(users: any[]) {
  const ranges = [
    { label: '0-99', min: 0, max: 99, color: '#9ca3af' },
    { label: '100-499', min: 100, max: 499, color: '#22c55e' },
    { label: '500-999', min: 500, max: 999, color: '#3b82f6' },
    { label: '1000-2499', min: 1000, max: 2499, color: '#a855f7' },
    { label: '2500-4999', min: 2500, max: 4999, color: '#f59e0b' },
    { label: '5000+', min: 5000, max: Infinity, color: '#ef4444' },
  ];
  const total = users.length || 1;
  return ranges.map(r => {
    const count = users.filter(u => (u.xpCache || 0) >= r.min && (u.xpCache || 0) <= r.max).length;
    return { ...r, count, pct: Math.round((count / total) * 100) };
  });
}
