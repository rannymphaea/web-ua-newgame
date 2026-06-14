'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface LogEntry {
  id: string;
  userId: string;
  action: string;
  result: string;
  timestamp: { _seconds: number };
  details?: Record<string, unknown>;
}

const ACTION_TYPES = [
  '', 'scan_qr', 'login', 'register', 'create_event', 'close_event',
  'manual_attendance', 'edit_xp', 'set_role', 'upload_media', 'award_badge',
];

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ action: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (filter.action) params.set('action', filter.action);
      const res = await api.get(`/logs?${params}`) as LogEntry[] | { logs: LogEntry[] };
      let data = Array.isArray(res) ? res : (res as any).logs || [];

      // date filter client-side
      if (filter.from || filter.to) {
        data = data.filter((l: LogEntry) => {
          const ts = l.timestamp?._seconds ? new Date(l.timestamp._seconds * 1000).toISOString() : '';
          if (filter.from && ts < filter.from) return false;
          if (filter.to && ts > filter.to + 'T23:59:59') return false;
          return true;
        });
      }
      setLogs(data);
      setPage(1);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, []);

  function downloadCsv() {
    const headers = ['Action', 'User ID', 'Result', 'Timestamp'];
    const rows = logs.map(l => [
      l.action, l.userId, l.result,
      l.timestamp?._seconds ? new Date(l.timestamp._seconds * 1000).toISOString() : '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `logs-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const paginated = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);

  function fmt(ts?: { _seconds: number }) {
    if (!ts?._seconds) return '—';
    return new Date(ts._seconds * 1000).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-display text-2xl">Riwayat Aktivitas</h1>
          <p className="text-muted text-sm">{logs.length} entri log ditemukan</p>
        </div>
        <button className="btn btn-secondary btn-sm btn-depth" onClick={downloadCsv} disabled={logs.length === 0}>
          <i className="ri-download-2-line" /> Export CSV
        </button>
      </div>

      {/* Filter */}
      <div className="card mb-lg">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
          <div>
            <label className="label" htmlFor="log-action">Tipe Aksi</label>
            <select id="log-action" className="input" value={filter.action} onChange={e => setFilter(f => ({ ...f, action: e.target.value }))}>
              {ACTION_TYPES.map(a => <option key={a} value={a}>{a || 'Semua'}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="log-from">Dari</label>
            <input id="log-from" type="date" className="input" value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} />
          </div>
          <div>
            <label className="label" htmlFor="log-to">Sampai</label>
            <input id="log-to" type="date" className="input" value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary btn-depth w-full" onClick={load} disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : <i className="ri-filter-line" />} Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr><th>Aksi</th><th>User</th><th>Result</th><th>Waktu</th></tr>
            </thead>
            <tbody>
              {paginated.length === 0 && !loading && (
                <tr><td colSpan={4} className="text-center text-muted p-xl">Tidak ada log</td></tr>
              )}
              {paginated.map(l => (
                <tr key={l.id}>
                  <td><code className="text-xs">{l.action}</code></td>
                  <td><code className="text-xs">{l.userId?.slice(0, 8)}…</code></td>
                  <td><span className={l.result === 'success' ? 'text-green text-sm' : 'text-red text-sm'}>{l.result}</span></td>
                  <td className="text-xs text-muted">{fmt(l.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-sm p-md" style={{ justifyContent: 'center', borderTop: '1px solid var(--clr-border)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <i className="ri-arrow-left-s-line" />
            </button>
            <span className="text-sm text-muted" style={{ padding: '6px 12px' }}>{page}/{totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
