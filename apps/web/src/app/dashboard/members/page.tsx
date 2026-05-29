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
  role?: string;
  xpCache?: number;
  status?: string;
}

export default function MembersPage() {
  const { userData } = useAuthStore();
  const isSuperadmin = (userData as any)?.role === 'superadmin';
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading]  = useState(true);
  const [search, setSearch]    = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{created?: number; failed?: number; errors?: string[]} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSuperadmin) {
      api.get('/members')
        .then(res => setMembers(Array.isArray(res?.data) ? res.data as Member[] : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isSuperadmin]);

  const filtered = search
    ? members.filter(m =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.memberId?.toLowerCase().includes(search.toLowerCase()) ||
        m.division?.toLowerCase().includes(search.toLowerCase()))
    : members;

  async function handleImport() {
    if (!importData.trim()) return;
    setImporting(true);
    setImportResult(null);
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
    } finally {
      setImporting(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setImportData(content);
      setImportFormat(file.name.endsWith('.json') ? 'json' : 'csv');
    };
    reader.readAsText(file);
  }

  if (!isSuperadmin) {
    return (
      <div className="card" style={{textAlign:'center',padding:40}}>
        <i className="ri-shield-keyhole-line" style={{fontSize:48,color:'var(--clr-text-secondary)',marginBottom:16}} aria-hidden="true" />
        <h2 style={{fontFamily:'var(--font-lora)',fontSize:20,color:'var(--clr-text-primary)',marginBottom:8}}>Akses Terbatas</h2>
        <p style={{fontFamily:'var(--font-inter)',fontSize:14,color:'var(--clr-text-secondary)'}}>Hanya Superadmin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      {/* HEADER */}
      <div className="members-header mb-xl">
        <div>
          <p className="members-eyebrow">
            <i className="ri-team-fill" style={{fontSize:11,marginRight:5,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
            Komunitas
          </p>
          <h1 className="members-title">Member Management</h1>
          <p className="members-sub">Kelola data anggota NEWGAME Unand</p>
        </div>
        <div className="members-count">
          <span className="members-count-val">{members.length}</span>
          <span className="members-count-lbl">Total Member</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="card mb-lg" style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <button onClick={() => setShowImport(!showImport)} className="btn btn-primary" style={{padding:'8px 16px',fontSize:13}}>
          <i className="ri-upload-cloud-2-line" style={{fontSize:14,marginRight:6}} aria-hidden="true" />
          Import Data
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="btn" style={{padding:'8px 16px',fontSize:13,background:'var(--clr-bg-surface-elevated)',border:'1px solid var(--clr-border)'}}>
          <i className="ri-file-upload-line" style={{fontSize:14,marginRight:6}} aria-hidden="true" />
          Upload File
        </button>
        <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleFileUpload} style={{display:'none'}} />
      </div>

      {/* IMPORT PANEL */}
      {showImport && (
        <div className="card mb-lg" style={{padding:20}}>
          <h3 style={{fontFamily:'var(--font-lora)',fontSize:16,fontWeight:600,color:'var(--clr-text-primary)',marginBottom:16}}>Import Member Data</h3>
          <div style={{display:'flex',gap:12,marginBottom:12}}>
            <label style={{fontFamily:'var(--font-inter)',fontSize:12,color:'var(--clr-text-secondary)',display:'flex',alignItems:'center',gap:6}}>
              <input type="radio" name="format" value="csv" checked={importFormat === 'csv'} onChange={() => setImportFormat('csv')} />
              CSV
            </label>
            <label style={{fontFamily:'var(--font-inter)',fontSize:12,color:'var(--clr-text-secondary)',display:'flex',alignItems:'center',gap:6}}>
              <input type="radio" name="format" value="json" checked={importFormat === 'json'} onChange={() => setImportFormat('json')} />
              JSON
            </label>
          </div>
          <textarea
            value={importData}
            onChange={e => setImportData(e.target.value)}
            placeholder={importFormat === 'csv' ? 'name,email,username,division,role,memberId,status\nJohn Doe,john@example.com,johndoe,IT,member,M001,active' : '[{"name":"John Doe","email":"john@example.com","username":"johndoe","division":"IT","role":"member","memberId":"M001","status":"active"}]'}
            style={{width:'100%',height:120,fontFamily:'monospace',fontSize:12,padding:12,border:'1px solid var(--clr-border)',borderRadius:8,background:'var(--clr-bg-surface-elevated)',color:'var(--clr-text-primary)',resize:'vertical',marginBottom:12}}
          />
          <div style={{display:'flex',gap:8}}>
            <button onClick={handleImport} disabled={importing || !importData.trim()} className="btn btn-primary" style={{padding:'8px 16px',fontSize:13}}>
              {importing ? 'Importing...' : 'Import'}
            </button>
            <button onClick={() => {setShowImport(false);setImportData('');setImportResult(null);}} className="btn" style={{padding:'8px 16px',fontSize:13,background:'var(--clr-bg-surface-elevated)',border:'1px solid var(--clr-border)'}}>
              Cancel
            </button>
          </div>
          {importResult && (
            <div style={{marginTop:12,padding:12,background:(importResult.created || 0) > 0 ? 'var(--clr-success-bg)' : 'var(--clr-danger-bg)',borderRadius:8}}>
              <p style={{fontFamily:'var(--font-inter)',fontSize:13,fontWeight:600,color:(importResult.created || 0) > 0 ? 'var(--clr-success)' : 'var(--clr-danger)',marginBottom:4}}>
                Created: {importResult.created || 0} | Failed: {importResult.failed || 0}
              </p>
              {importResult.errors && importResult.errors.length > 0 && (
                <ul style={{fontFamily:'var(--font-inter)',fontSize:11,color:'var(--clr-text-secondary)',margin:4,marginLeft:16}}>
                  {importResult.errors.slice(0,5).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* SEARCH */}
      <div className="card mb-lg" style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
        <i className="ri-search-line" style={{fontSize:18,color:'var(--clr-text-secondary)'}} aria-hidden="true" />
        <input
          id="members-search"
          className="members-search"
          placeholder="Cari nama, ID member, atau divisi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Cari member"
        />
        {search && (
          <button onClick={() => setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--clr-text-secondary)',padding:0}} aria-label="Hapus pencarian">
            <i className="ri-close-circle-fill" style={{fontSize:16}} aria-hidden="true" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="card">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton mb-md" style={{height:54,borderRadius:10}} />)}
        </div>
      ) : (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div className="table-container" style={{border:'none'}}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{width:50}}>#</th>
                  <th>Member</th>
                  <th className="hide-mobile">Email</th>
                  <th>Divisi</th>
                  <th>Role</th>
                  <th style={{textAlign:'right'}}>XP</th>
                  <th style={{textAlign:'right'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.uid || m.id || m.memberId || i} className="members-row">
                    <td><span className="members-index">{i + 1}</span></td>
                    <td>
                      <div className="members-user-cell">
                        <div className="members-avatar">
                          {m.photoURL
                            ? <img src={m.photoURL} alt="" />
                            : <span>{(m.name||'?').charAt(0).toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <span className="members-name">{m.name || '-'}</span>
                          {m.username && <span className="members-username">@{m.username}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile"><span className="members-email">{m.email || '-'}</span></td>
                    <td><span className="members-division">{m.division || '-'}</span></td>
                    <td><span className="members-role">{m.role || 'member'}</span></td>
                    <td style={{textAlign:'right'}}><span className="members-xp">{(m.xpCache || 0).toLocaleString()}</span></td>
                    <td style={{textAlign:'right'}}>
                      <span className={`badge ${m.status === 'active' ? 'badge-green' : m.status === 'suspended' ? 'badge-red' : 'badge-gray'}`}>
                        {m.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="members-empty">
                        <i className="ri-ghost-line" style={{fontSize:32,marginBottom:8}} aria-hidden="true" />
                        <p>{search ? 'Tidak ada member yang cocok' : 'Belum ada data member'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .members-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .members-eyebrow { font-family:var(--font-inter); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--clr-text-secondary); margin-bottom:6px; display:flex; align-items:center; }
        .members-title { font-family:var(--font-lora); font-size:clamp(22px,3vw,28px); font-weight:700; color:var(--clr-text-primary); margin-bottom:4px; line-height:1.1; }
        .members-sub { font-family:var(--font-cormorant); font-size:15px; color:var(--clr-text-secondary); font-style:italic; }
        .members-count { background:var(--clr-gold-subtle); border:1px solid var(--clr-border-gold); padding:10px 20px; border-radius:14px; text-align:center; display:flex; flex-direction:column; }
        .members-count-val { font-family:var(--font-lora); font-size:24px; font-weight:700; color:var(--clr-gold-dim); line-height:1; }
        .members-count-lbl { font-family:var(--font-inter); font-size:9px; text-transform:uppercase; letter-spacing:0.5px; color:var(--clr-text-secondary); margin-top:4px; }
        .members-search { flex:1; background:transparent; border:none; outline:none; font-family:var(--font-inter); font-size:14px; color:var(--clr-text-primary); }
        .members-search::placeholder { color:var(--clr-text-secondary); opacity:0.7; }
        .members-row { transition:background 0.2s ease !important; }
        .members-row:hover td { background:var(--clr-bg-muted) !important; }
        .members-index { font-family:var(--font-inter); font-size:12px; color:var(--clr-text-secondary); }
        .members-user-cell { display:flex; align-items:center; gap:10px; }
        .members-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--clr-gold),var(--clr-lavender)); display:flex; align-items:center; justify-content:center; font-family:var(--font-inter); font-size:12px; font-weight:700; color:var(--clr-ink); overflow:hidden; flex-shrink:0; }
        .members-avatar img { width:100%; height:100%; object-fit:cover; }
        .members-name { display:block; font-family:var(--font-inter); font-size:13.5px; font-weight:600; color:var(--clr-text-primary); }
        .members-username { display:block; font-family:var(--font-inter); font-size:11px; color:var(--clr-text-secondary); }
        .members-email { font-family:monospace; font-size:11px; color:var(--clr-text-secondary); }
        .members-division { font-family:var(--font-inter); font-size:12px; color:var(--clr-text-primary); }
        .members-role { font-family:var(--font-inter); font-size:11px; text-transform:capitalize; color:var(--clr-lavender); background:var(--clr-lavender-subtle); padding:2px 8px; border-radius:10px; }
        .members-xp { font-family:var(--font-inter); font-size:13px; font-weight:600; color:var(--clr-success); }
        .members-empty { text-align:center; padding:40px 0; color:var(--clr-text-secondary); font-family:var(--font-inter); font-size:13px; }
        @media (max-width:768px) { .members-title { font-size:22px; } }
      `}</style>
    </div>
  );
}
