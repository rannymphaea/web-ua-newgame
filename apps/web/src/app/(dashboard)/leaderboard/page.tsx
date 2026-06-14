'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface LeaderboardEntry {
  uid: string;
  username?: string;
  name?: string;
  pillar?: string;
  generation?: string;
  xpCache: number;
  level?: number;
  photoURL?: string;
}

const PILLARS = ['', 'Game Logic', 'Game Design', 'Game Sound'];
const GENS = ['', 'GEN 1', 'GEN 2'];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pillar, setPillar] = useState('');
  const [gen, setGen] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => { load(); }, [pillar, gen]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pillar) params.set('pillar', pillar);
      if (gen) params.set('generation', gen);
      const res = await api.get(`/xp/leaderboard?${params}`) as LeaderboardEntry[] | { leaderboard: LeaderboardEntry[] };
      const data = Array.isArray(res) ? res : (res as any).leaderboard || [];
      setEntries(data.slice(0, 100));
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function exportImage() {
    const { default: html2canvas } = await import('https://cdn.skypack.dev/html2canvas@1.4.1' as any).catch(() => ({ default: null }));
    if (!html2canvas || !tableRef.current) {
      // fallback: just export CSV
      const csv = ['Rank,Nama,Pilar,XP,Level',
        ...entries.map((e, i) => `${i+1},"${e.username || e.name || ''}","${e.pillar || ''}",${e.xpCache},${e.level || 1}`)
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `leaderboard-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      return;
    }
    try {
      const canvas = await html2canvas(tableRef.current, { backgroundColor: '#0f0f1a', scale: 2 });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = `leaderboard-${Date.now()}.png`; a.click();
    } catch { /* fallback to CSV handled above */ }
  }

  const rankBadge = (i: number) => {
    if (i === 0) return { icon: 'ri-trophy-fill', color: '#ffd700' };
    if (i === 1) return { icon: 'ri-medal-fill', color: '#c0c0c0' };
    if (i === 2) return { icon: 'ri-medal-fill', color: '#cd7f32' };
    return { icon: '', color: 'var(--clr-text-muted)' };
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-display text-2xl">Leaderboard</h1>
          <p className="text-muted text-sm">Top 100 berdasarkan XP</p>
        </div>
        <button className="btn btn-secondary btn-sm btn-depth" onClick={exportImage}>
          <i className="ri-image-line" /> Export
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {PILLARS.map(p => (
          <button
            key={p}
            className={`btn btn-sm btn-depth ${pillar === p ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPillar(p)}
          >
            {p || 'Semua Pilar'}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--clr-border)', margin: '0 4px' }} />
        {GENS.map(g => (
          <button
            key={g}
            className={`btn btn-sm btn-depth ${gen === g ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setGen(g)}
          >
            {g || 'Semua Gen'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div ref={tableRef} className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr><th style={{ width: 48 }}>#</th><th>Anggota</th><th>Pilar</th><th>Generasi</th><th>XP</th><th>Lv</th></tr>
            </thead>
            <tbody>
              {loading && [...Array(10)].map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20, borderRadius: 4 }} /></td></tr>
              ))}
              {!loading && entries.map((e, i) => {
                const badge = rankBadge(i);
                return (
                  <tr key={e.uid} style={{ background: i < 3 ? `${badge.color}11` : undefined }}>
                    <td style={{ textAlign: 'center' }}>
                      {badge.icon
                        ? <i className={badge.icon} style={{ color: badge.color, fontSize: 16 }} />
                        : <span style={{ color: 'var(--clr-text-secondary)', fontSize: 13 }}>{i + 1}</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--clr-gold-glow)', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: 'var(--clr-gold)',
                        }}>
                          {e.photoURL
                            ? <img src={e.photoURL} alt="" style={{ width: 28, height: 28, objectFit: 'cover' }} />
                            : (e.username || e.name || '?').charAt(0).toUpperCase()
                          }
                        </div>
                        <span className="font-semibold text-sm">{e.username || e.name || e.uid.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td>
                      {e.pillar && <span className="badge badge-blue text-xs">{e.pillar.replace('Game ', '')}</span>}
                    </td>
                    <td>
                      {e.generation && <span className="badge badge-gray text-xs">{e.generation}</span>}
                    </td>
                    <td><span style={{ color: 'var(--clr-gold)', fontWeight: 700 }}>{e.xpCache.toLocaleString()}</span></td>
                    <td><span className="badge badge-blue">{e.level || Math.floor(e.xpCache / 100) + 1}</span></td>
                  </tr>
                );
              })}
              {!loading && entries.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted p-xl">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
