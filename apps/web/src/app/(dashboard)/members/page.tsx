'use client';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface Member {
  uid?: string;
  id?: string;
  memberId?: string;
  name?: string;
  email?: string;
  username?: string;
  photoURL?: string;
  division?: string;
  team?: string;
  role?: string;
  xpCache?: number;
  status?: string;
  level?: number;
  streak?: number;
}

type ViewMode = 'table' | 'peta' | 'divisi';

const DIVISION_COLORS: Record<string, string> = {
  'IT':           '#60a5fa',
  'Design':       '#f472b6',
  'Marketing':    '#fb923c',
  'Content':      '#a78bfa',
  'Research':     '#34d399',
  'HRD':          '#fbbf24',
  'Finance':      '#22d3ee',
  'Event':        '#f87171',
};

function getDivColor(div?: string) {
  if (!div) return 'var(--clr-lavender)';
  const key = Object.keys(DIVISION_COLORS).find(k => div.toLowerCase().includes(k.toLowerCase()));
  return key ? DIVISION_COLORS[key] : 'var(--clr-lavender)';
}

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function MembersPage() {
  const { userData } = useAuthStore();
  const isAdmin = (userData as any)?.role === 'superadmin' || (userData as any)?.role === 'admin';

  const [members,     setMembers]     = useState<Member[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [divFilter,   setDivFilter]   = useState('');
  const [viewMode,    setViewMode]    = useState<ViewMode>('table');
  const [showImport,  setShowImport]  = useState(false);
  const [importData,  setImportData]  = useState('');
  const [importFormat,setImportFormat]= useState<'csv' | 'json'>('csv');
  const [importing,   setImporting]   = useState(false);
  const [importResult,setImportResult]= useState<{created?: number; failed?: number; errors?: string[]} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin) {
      api.get('/members')
        .then(res => setMembers(Array.isArray(res?.data) ? res.data as Member[] : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const allDivisions = [...new Set(members.map(m => m.division).filter(Boolean))] as string[];

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || (
      m.name?.toLowerCase().includes(q) ||
      m.memberId?.toLowerCase().includes(q) ||
      m.division?.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q)
    );
    const matchDiv = !divFilter || m.division === divFilter;
    return matchSearch && matchDiv;
  });

  async function handleImport() {
    if (!importData.trim()) return;
    setImporting(true); setImportResult(null);
    try {
      const res = await api.post('/members/import', { format: importFormat, data: importData });
      setImportResult(res);
      if (res.created > 0) {
        const updated = await api.get('/members');
        setMembers(Array.isArray(updated?.data) ? updated.data as Member[] : []);
      }
      setImportData('');
    } catch (err: unknown) {
      setImportResult({ created: 0, failed: 1, errors: [err instanceof Error ? err.message : 'Import failed'] });
    } finally { setImporting(false); }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImportData(ev.target?.result as string);
      setImportFormat(file.name.endsWith('.json') ? 'json' : 'csv');
    };
    reader.readAsText(file);
  }

  if (!isAdmin) {
    return (
      <div className="card" style={{textAlign:'center', padding: 60}}>
        <div style={{fontSize:64, marginBottom:16}}>🔒</div>
        <h2 style={{fontFamily:'var(--font-lora)', fontSize:22, color:'var(--clr-text-primary)', marginBottom:8}}>Akses Terbatas</h2>
        <p style={{fontFamily:'var(--font-inter)', fontSize:14, color:'var(--clr-text-secondary)'}}>Hanya Admin dan Superadmin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  // ── Grouped by division (for peta mode) ──────────────────────
  const byDivision: Record<string, Member[]> = {};
  filtered.forEach(m => {
    const d = m.division || 'Tanpa Divisi';
    if (!byDivision[d]) byDivision[d] = [];
    byDivision[d].push(m);
  });

  return (
    <div className="animate-fade-in" style={{display:'flex', flexDirection:'column', gap:'var(--space-lg)'}}>

      {/* ── PAGE HEADER ────────────────────────────────────────── */}
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16}}>
        <div>
          <p style={{fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.5px',
            color:'var(--clr-text-secondary)', marginBottom:6, display:'flex', alignItems:'center', gap:6}}>
            <i className="ri-team-fill" style={{fontSize:11, color:'var(--clr-gold-dim)'}} />
            Pemetaan Anggota
          </p>
          <h1 style={{fontFamily:'var(--font-lora)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700,
            color:'var(--clr-text-primary)', marginBottom:6, lineHeight:1.1}}>
            Member Management
          </h1>
          <p style={{fontFamily:'var(--font-cormorant)', fontSize:15, color:'var(--clr-text-secondary)', fontStyle:'italic'}}>
            Kelola dan petakan anggota NEWGAME Unand
          </p>
        </div>

        {/* Stats chips */}
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {[
            { label: 'Total', value: members.length, color: 'var(--clr-gold)', icon: 'ri-team-line' },
            { label: 'Divisi', value: allDivisions.length, color: 'var(--clr-lavender)', icon: 'ri-organization-chart' },
            { label: 'Aktif', value: members.filter(m => m.status === 'active').length, color: '#22c55e', icon: 'ri-user-follow-line' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--clr-bg-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 14, padding: '10px 18px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <i className={s.icon} style={{fontSize:16, color: s.color, marginBottom:2}} />
              <span style={{fontFamily:'var(--font-lora)', fontSize:22, fontWeight:700, color: s.color, lineHeight:1}}>{s.value}</span>
              <span style={{fontFamily:'var(--font-inter)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.5px', color:'var(--clr-text-secondary)', marginTop:3}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────────── */}
      <div className="card" style={{padding:'12px 16px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
        {/* Search */}
        <div style={{display:'flex', alignItems:'center', gap:8, flex:1, minWidth:200,
          background:'var(--clr-bg-muted)', borderRadius:8, padding:'8px 12px'}}>
          <i className="ri-search-line" style={{fontSize:16, color:'var(--clr-text-secondary)'}} />
          <input
            id="members-search"
            placeholder="Cari nama, ID, divisi..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{flex:1, background:'transparent', border:'none', outline:'none',
              fontFamily:'var(--font-inter)', fontSize:13, color:'var(--clr-text-primary)'}}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{background:'none', border:'none', cursor:'pointer',
              color:'var(--clr-text-secondary)', padding:0}}>
              <i className="ri-close-circle-fill" style={{fontSize:15}} />
            </button>
          )}
        </div>

        {/* Division filter */}
        <select
          value={divFilter} onChange={e => setDivFilter(e.target.value)}
          style={{fontFamily:'var(--font-inter)', fontSize:13, background:'var(--clr-bg-surface)',
            border:'1px solid var(--clr-border)', borderRadius:8, padding:'8px 12px',
            color:'var(--clr-text-primary)', cursor:'pointer'}}>
          <option value="">Semua Divisi</option>
          {allDivisions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* View mode */}
        <div style={{display:'flex', background:'var(--clr-bg-muted)', borderRadius:8, padding:3, gap:2}}>
          {(['table', 'peta', 'divisi'] as ViewMode[]).map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer',
              fontFamily:'var(--font-inter)', fontSize:12, fontWeight:600,
              background: viewMode === m ? 'var(--clr-gold)' : 'transparent',
              color: viewMode === m ? 'var(--clr-ink)' : 'var(--clr-text-secondary)',
              transition:'all 0.2s ease',
            }}>
              {m === 'table' ? '≡ Tabel' : m === 'peta' ? '⊞ Kartu' : '◉ Divisi'}
            </button>
          ))}
        </div>

        {/* Import */}
        <button onClick={() => setShowImport(!showImport)} className="btn btn-primary"
          style={{padding:'8px 14px', fontSize:13}}>
          <i className="ri-upload-cloud-2-line" style={{fontSize:13}} />
          Import
        </button>
        <button onClick={() => fileInputRef.current?.click()}
          style={{padding:'8px 12px', borderRadius:8, border:'1px solid var(--clr-border)',
            background:'var(--clr-bg-surface)', cursor:'pointer', fontFamily:'var(--font-inter)',
            fontSize:13, color:'var(--clr-text-secondary)'}}>
          <i className="ri-file-upload-line" style={{fontSize:13}} />
        </button>
        <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleFileUpload} style={{display:'none'}} />
      </div>

      {/* ── IMPORT PANEL ────────────────────────────────────────── */}
      {showImport && (
        <div className="card" style={{padding:20, borderColor:'rgba(253,207,65,0.2)'}}>
          <h3 style={{fontFamily:'var(--font-lora)', fontSize:16, fontWeight:600,
            color:'var(--clr-text-primary)', marginBottom:16}}>Import Data Member</h3>
          <div style={{display:'flex', gap:16, marginBottom:12}}>
            {(['csv', 'json'] as const).map(f => (
              <label key={f} style={{display:'flex', alignItems:'center', gap:6, cursor:'pointer',
                fontFamily:'var(--font-inter)', fontSize:13, color:'var(--clr-text-secondary)'}}>
                <input type="radio" name="fmt" value={f}
                  checked={importFormat === f} onChange={() => setImportFormat(f)} />
                {f.toUpperCase()}
              </label>
            ))}
          </div>
          <textarea value={importData} onChange={e => setImportData(e.target.value)}
            placeholder={importFormat === 'csv'
              ? 'name,email,username,division,role,memberId,status\nJohn Doe,john@email.com,johndoe,IT,member,M001,active'
              : '[{"name":"John Doe","email":"john@email.com","division":"IT","memberId":"M001"}]'}
            style={{width:'100%', height:110, fontFamily:'monospace', fontSize:12, padding:12,
              border:'1px solid var(--clr-border)', borderRadius:8,
              background:'var(--clr-bg-surface-elevated)', color:'var(--clr-text-primary)',
              resize:'vertical', marginBottom:12}} />
          <div style={{display:'flex', gap:8}}>
            <button onClick={handleImport} disabled={importing || !importData.trim()}
              className="btn btn-primary" style={{padding:'8px 16px', fontSize:13}}>
              {importing ? 'Importing...' : 'Import'}
            </button>
            <button onClick={() => { setShowImport(false); setImportData(''); setImportResult(null); }}
              style={{padding:'8px 14px', borderRadius:8, border:'1px solid var(--clr-border)',
                background:'transparent', cursor:'pointer', fontFamily:'var(--font-inter)',
                fontSize:13, color:'var(--clr-text-secondary)'}}>
              Batal
            </button>
          </div>
          {importResult && (
            <div style={{marginTop:12, padding:12,
              background:(importResult.created || 0) > 0 ? 'var(--clr-success-bg)' : 'var(--clr-danger-bg)',
              borderRadius:8}}>
              <p style={{fontFamily:'var(--font-inter)', fontSize:13, fontWeight:600,
                color:(importResult.created || 0) > 0 ? 'var(--clr-success)' : 'var(--clr-danger)'}}>
                ✓ {importResult.created || 0} berhasil &nbsp;·&nbsp; ✗ {importResult.failed || 0} gagal
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="card">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton mb-md" style={{height:54, borderRadius:10}} />)}
        </div>
      ) : viewMode === 'table' ? (
        // ── TABLE VIEW ──────────────────────────────────────────
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div className="table-container" style={{border:'none'}}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:48}}>#</th>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Divisi</th>
                  <th>Role</th>
                  <th style={{textAlign:'right'}}>XP</th>
                  <th style={{textAlign:'right'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.uid || m.id || i}>
                    <td><span style={{fontFamily:'var(--font-inter)', fontSize:12, color:'var(--clr-text-secondary)'}}>{i + 1}</span></td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div style={{
                          width:34, height:34, borderRadius:'50%', flexShrink:0, overflow:'hidden',
                          background:`linear-gradient(135deg, ${getDivColor(m.division)}, var(--clr-lavender))`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:13, fontWeight:700, color:'#fff',
                        }}>
                          {m.photoURL ? <img src={m.photoURL} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : getInitials(m.name)}
                        </div>
                        <div>
                          <div style={{fontFamily:'var(--font-inter)', fontSize:13.5, fontWeight:600, color:'var(--clr-text-primary)'}}>{m.name || '-'}</div>
                          {m.username && <div style={{fontFamily:'var(--font-inter)', fontSize:11, color:'var(--clr-text-secondary)'}}>@{m.username}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span style={{fontFamily:'monospace', fontSize:11, color:'var(--clr-text-secondary)'}}>{m.email || '-'}</span></td>
                    <td>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        padding:'3px 10px', borderRadius:99,
                        background:`${getDivColor(m.division)}18`,
                        border:`1px solid ${getDivColor(m.division)}40`,
                        fontFamily:'var(--font-inter)', fontSize:12, fontWeight:600,
                        color: getDivColor(m.division),
                      }}>
                        <span style={{width:5, height:5, borderRadius:'50%', background: getDivColor(m.division), flexShrink:0}} />
                        {m.division || '-'}
                      </span>
                    </td>
                    <td><span style={{fontFamily:'var(--font-inter)', fontSize:11, textTransform:'capitalize', color:'var(--clr-lavender)', background:'var(--clr-lavender-subtle)', padding:'2px 8px', borderRadius:10}}>{m.role || 'member'}</span></td>
                    <td style={{textAlign:'right'}}><span style={{fontFamily:'var(--font-inter)', fontSize:13, fontWeight:600, color:'var(--clr-success)'}}>{(m.xpCache || 0).toLocaleString()}</span></td>
                    <td style={{textAlign:'right'}}>
                      <span className={`badge ${m.status === 'active' ? 'badge-green' : m.status === 'suspended' ? 'badge-red' : 'badge-gray'}`}>
                        {m.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7}>
                    <div style={{textAlign:'center', padding:'40px 0', color:'var(--clr-text-secondary)', fontFamily:'var(--font-inter)', fontSize:13}}>
                      <i className="ri-ghost-line" style={{fontSize:32, display:'block', marginBottom:8}} />
                      {search || divFilter ? 'Tidak ada member yang cocok' : 'Belum ada data member'}
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      ) : viewMode === 'peta' ? (
        // ── KARTU / PETA VIEW ───────────────────────────────────
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14}}>
          {filtered.map((m, i) => {
            const divColor = getDivColor(m.division);
            const lvl = m.level || Math.floor((m.xpCache || 0) / 100) + 1;
            return (
              <div key={m.uid || m.id || i} className="card card-hover" style={{padding:18, textAlign:'center', cursor:'pointer'}}>
                {/* Avatar */}
                <div style={{
                  width:60, height:60, borderRadius:'50%', margin:'0 auto 12px', overflow:'hidden',
                  background:`linear-gradient(135deg, ${divColor}, var(--clr-lavender))`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:22, fontWeight:700, color:'#fff',
                  border:`3px solid ${divColor}40`,
                }}>
                  {m.photoURL ? <img src={m.photoURL} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : getInitials(m.name)}
                </div>
                {/* Name */}
                <div style={{fontFamily:'var(--font-inter)', fontSize:14, fontWeight:700, color:'var(--clr-text-primary)', marginBottom:2}}>{m.name || '-'}</div>
                {m.username && <div style={{fontFamily:'var(--font-inter)', fontSize:11, color:'var(--clr-text-secondary)', marginBottom:8}}>@{m.username}</div>}
                {/* Division badge */}
                <span style={{
                  display:'inline-block', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                  background:`${divColor}20`, border:`1px solid ${divColor}50`,
                  color: divColor, marginBottom:10,
                }}>{m.division || 'Tanpa Divisi'}</span>
                {/* Stats row */}
                <div style={{display:'flex', justifyContent:'center', gap:14, borderTop:'1px solid var(--clr-border)', paddingTop:10}}>
                  <div>
                    <div style={{fontFamily:'var(--font-lora)', fontSize:15, fontWeight:700, color:'var(--clr-gold)', lineHeight:1}}>Lv.{lvl}</div>
                    <div style={{fontFamily:'var(--font-inter)', fontSize:9, color:'var(--clr-text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:2}}>Level</div>
                  </div>
                  <div>
                    <div style={{fontFamily:'var(--font-lora)', fontSize:15, fontWeight:700, color:'var(--clr-success)', lineHeight:1}}>{(m.xpCache || 0).toLocaleString()}</div>
                    <div style={{fontFamily:'var(--font-inter)', fontSize:9, color:'var(--clr-text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:2}}>XP</div>
                  </div>
                </div>
                {/* Status dot */}
                <div style={{position:'absolute', top:14, right:14}}>
                  <span style={{width:8, height:8, borderRadius:'50%', display:'inline-block',
                    background: m.status === 'active' ? '#22c55e' : m.status === 'suspended' ? '#ef4444' : '#8892a4',
                    boxShadow: m.status === 'active' ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
                  }} />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{gridColumn:'1/-1', textAlign:'center', padding:60, color:'var(--clr-text-secondary)'}}>
              <i className="ri-ghost-line" style={{fontSize:48, display:'block', marginBottom:8}} />
              Tidak ada member ditemukan
            </div>
          )}
        </div>

      ) : (
        // ── DIVISI VIEW ─────────────────────────────────────────
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          {Object.entries(byDivision).map(([div, divMembers]) => {
            const divColor = getDivColor(div);
            return (
              <div key={div} className="card" style={{padding:0, overflow:'hidden'}}>
                {/* Division header */}
                <div style={{
                  padding:'14px 20px',
                  background:`linear-gradient(90deg, ${divColor}18, transparent)`,
                  borderBottom:'1px solid var(--clr-border)',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span style={{width:10, height:10, borderRadius:'50%', background: divColor, flexShrink:0}} />
                    <h2 style={{fontFamily:'var(--font-lora)', fontSize:16, fontWeight:700, color:'var(--clr-text-primary)', margin:0}}>{div}</h2>
                  </div>
                  <span style={{
                    background:`${divColor}20`, border:`1px solid ${divColor}40`,
                    color: divColor, padding:'2px 10px', borderRadius:99,
                    fontFamily:'var(--font-inter)', fontSize:11, fontWeight:700,
                  }}>{divMembers.length} anggota</span>
                </div>
                {/* Members avatars strip */}
                <div style={{padding:'14px 20px', display:'flex', flexWrap:'wrap', gap:8}}>
                  {divMembers.map((m, i) => (
                    <div key={m.uid || i} title={m.name || '?'} style={{
                      width:40, height:40, borderRadius:'50%', overflow:'hidden', flexShrink:0,
                      background:`linear-gradient(135deg, ${divColor}, var(--clr-lavender))`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, fontWeight:700, color:'#fff',
                      border:`2px solid ${divColor}50`,
                      cursor:'pointer',
                    }}>
                      {m.photoURL ? <img src={m.photoURL} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : getInitials(m.name)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(byDivision).length === 0 && (
            <div className="card" style={{textAlign:'center', padding:60, color:'var(--clr-text-secondary)'}}>
              <i className="ri-organization-chart" style={{fontSize:48, display:'block', marginBottom:8}} />
              Tidak ada data divisi
            </div>
          )}
        </div>
      )}
    </div>
  );
}
