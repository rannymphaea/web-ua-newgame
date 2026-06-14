'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Member {
  id: string;
  uid?: string;
  username?: string;
  name?: string;
  memberId?: string;
  pillar?: string;
  generation?: string;
  xpCache?: number;
  status?: string;
  photoURL?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pillar, setPillar] = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      if (pillar) params.set('pillar', pillar);
      const res = await api.get(`/members?${params}`) as Member[] | { members: Member[] };
      setMembers(Array.isArray(res) ? res : (res as any).members || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, pillar]);

  useEffect(() => { load(); }, [load]);

  const pillars = ['Game Logic', 'Game Design', 'Game Sound'];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h1 className="font-display text-2xl">Direktori Anggota</h1>
        <span className="badge badge-blue">{members.length} anggota</span>
      </div>

      {/* Search + filter */}
      <div className="card mb-lg" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <i className="ri-search-line" style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--clr-text-secondary)',
            }} />
            <input
              id="member-search"
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Cari nama atau Member ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>
          <select
            id="member-pillar-filter"
            className="input"
            style={{ width: 'auto' }}
            value={pillar}
            onChange={e => setPillar(e.target.value)}
          >
            <option value="">Semua Pilar</option>
            {pillars.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn-secondary btn-depth" onClick={load}>
            <i className="ri-search-line" />
          </button>
        </div>
      </div>

      {/* Member grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
          {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
          {members.map(m => (
            <button
              key={m.id}
              id={`member-card-${m.id}`}
              onClick={() => router.push(`/members/${m.uid || m.id}`)}
              style={{
                background: 'var(--clr-bg-surface)', border: '1px solid var(--clr-border)',
                borderRadius: 12, padding: 16, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 8,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--clr-gold)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--clr-border)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--clr-gold-glow)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--clr-gold)',
                  flexShrink: 0,
                }}>
                  {m.photoURL
                    ? <img src={m.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    : (m.username || m.name || '?').charAt(0).toUpperCase()
                  }
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div className="font-semibold text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.username || m.name || m.memberId || 'Anggota'}
                  </div>
                  <div className="text-xs text-muted">{m.memberId || m.id.slice(0, 8)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {m.pillar && <span className="badge badge-blue text-xs">{m.pillar.replace('Game ', '')}</span>}
                {m.generation && <span className="badge badge-gray text-xs">{m.generation}</span>}
              </div>
              <div className="text-xs text-muted">
                <i className="ri-star-line mr-xs" style={{ color: 'var(--clr-gold)' }} />
                {m.xpCache || 0} XP
              </div>
            </button>
          ))}
          {members.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--clr-text-secondary)' }}>
              <i className="ri-group-line" style={{ fontSize: 48, display: 'block', marginBottom: 8, opacity: 0.4 }} />
              Tidak ada anggota ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
