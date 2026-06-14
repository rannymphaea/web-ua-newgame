'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface LogEntry {
  id: string;
  userId: string;
  action: string;
  result: string;
  anomalyScore?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: { _seconds: number };
  details?: Record<string, unknown>;
}

const SEVERITY: Record<string, { label: string; color: string; badge: string }> = {
  critical:  { label: 'CRITICAL', color: 'var(--clr-danger)',  badge: 'badge-red'    },
  high:      { label: 'HIGH',     color: '#ff6b35',            badge: 'badge-orange' },
  medium:    { label: 'MEDIUM',   color: 'var(--clr-warning)', badge: 'badge-yellow' },
  low:       { label: 'LOW',      color: 'var(--clr-info)',    badge: 'badge-blue'   },
  normal:    { label: 'NORMAL',   color: 'var(--clr-success)', badge: 'badge-green'  },
};

function scoreToSeverity(score?: number): string {
  if (!score) return 'normal';
  if (score >= 0.85) return 'critical';
  if (score >= 0.7)  return 'high';
  if (score >= 0.5)  return 'medium';
  if (score >= 0.3)  return 'low';
  return 'normal';
}

export default function AdminSiemPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ action: '', userId: '', severity: '' });
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (filter.action) params.set('action', filter.action);
      if (filter.userId) params.set('userId', filter.userId);
      const res = await api.get(`/logs?${params}`) as LogEntry[] | { logs: LogEntry[] };
      const data = Array.isArray(res) ? res : (res as { logs: LogEntry[] }).logs || [];
      setLogs(data);
      setPage(1);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  const filtered = logs.filter(l => {
    if (filter.severity && filter.severity !== 'all') {
      const sev = scoreToSeverity(l.anomalyScore);
      if (sev !== filter.severity) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  function fmt(ts?: { _seconds: number }) {
    if (!ts) return '—';
    return new Date(ts._seconds * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-display text-2xl">
            <i className="ri-shield-keyhole-line mr-sm" style={{ color: 'var(--clr-danger)' }} />
            SIEM Log Viewer
          </h1>
          <p className="text-muted text-sm">Security event monitoring &amp; anomaly detection</p>
        </div>
        <button className="btn btn-secondary btn-sm btn-depth" onClick={loadLogs} disabled={loading}>
          <i className="ri-refresh-line" /> Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 20 }}>
        {Object.entries(SEVERITY).map(([key, val]) => {
          const count = logs.filter(l => scoreToSeverity(l.anomalyScore) === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(f => ({ ...f, severity: f.severity === key ? '' : key }))}
              style={{
                padding: '12px 16px', borderRadius: 10, border: `1px solid ${val.color}33`,
                background: filter.severity === key ? `${val.color}22` : 'var(--clr-bg-surface)',
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: val.color }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)' }}>{val.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="card mb-lg">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          <div>
            <label className="label" htmlFor="siem-action">Aksi</label>
            <input id="siem-action" className="input" placeholder="e.g. scan_qr, login, create_event" value={filter.action} onChange={e => setFilter(f => ({ ...f, action: e.target.value }))} />
          </div>
          <div>
            <label className="label" htmlFor="siem-user">User ID</label>
            <input id="siem-user" className="input" placeholder="Firebase UID" value={filter.userId} onChange={e => setFilter(f => ({ ...f, userId: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary btn-depth w-full" onClick={loadLogs} disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Memuat...</> : <><i className="ri-search-line" /> Filter</>}
            </button>
          </div>
        </div>
      </div>

      {/* Log table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Aksi</th>
                <th>User</th>
                <th>Result</th>
                <th>Score</th>
                <th>Waktu</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && !loading && (
                <tr><td colSpan={7} className="text-center text-muted p-xl">
                  <i className="ri-shield-check-line" style={{ fontSize: 36, display: 'block', marginBottom: 8 }} />
                  Tidak ada log. Klik Refresh atau ubah filter.
                </td></tr>
              )}
              {paginated.map(log => {
                const sev = scoreToSeverity(log.anomalyScore);
                const sevInfo = SEVERITY[sev];
                return (
                  <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(log)}>
                    <td>
                      <span className={`badge ${sevInfo.badge}`} style={{ fontSize: 10 }}>{sevInfo.label}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: 12 }}>{log.action}</code>
                    </td>
                    <td><code className="text-xs">{log.userId?.slice(0, 8)}…</code></td>
                    <td>
                      <span className={log.result === 'success' ? 'text-green text-sm' : 'text-red text-sm'}>{log.result}</span>
                    </td>
                    <td>
                      {log.anomalyScore != null
                        ? <span style={{ fontFamily: 'monospace', fontSize: 13, color: sevInfo.color }}>{(log.anomalyScore * 100).toFixed(0)}%</span>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td className="text-xs text-muted">{fmt(log.timestamp)}</td>
                    <td>
                      <i className="ri-arrow-right-s-line text-muted" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-sm p-md" style={{ justifyContent: 'center', borderTop: '1px solid var(--clr-border)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <i className="ri-arrow-left-s-line" />
            </button>
            <span className="text-sm text-muted" style={{ padding: '6px 12px' }}>
              {page} / {totalPages}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="card animate-slide-up"
            style={{ width: '100%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-display text-lg">Log Detail</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['ID', selected.id],
                ['Aksi', selected.action],
                ['User ID', selected.userId],
                ['Result', selected.result],
                ['Anomaly Score', selected.anomalyScore != null ? `${(selected.anomalyScore * 100).toFixed(1)}%` : '—'],
                ['IP Address', selected.ipAddress || '—'],
                ['User Agent', selected.userAgent || '—'],
                ['Timestamp', fmt(selected.timestamp)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ minWidth: 120, fontSize: 12, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
              {selected.details && (
                <div>
                  <p className="label mt-sm">Details</p>
                  <pre style={{
                    fontSize: 11, background: 'var(--clr-bg-muted)', padding: 12,
                    borderRadius: 8, overflowX: 'auto', marginTop: 4,
                    fontFamily: 'monospace', color: 'var(--clr-text-secondary)',
                  }}>
                    {JSON.stringify(selected.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
