'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Log {
  id?: string;
  timestamp: unknown;
  action: string;
  userId?: string;
  eventName?: string;
  result?: string;
  targetUserId?: string;
}

const ACTION_LABELS: Record<string, string> = {
  attend:         '📋 Attendance',
  login:          '🔑 Login',
  leave_approved: '✅ Leave Approved',
  leave_rejected: '❌ Leave Rejected',
  xp_edit:        '⚡ XP Edit',
  role_change:    '🛡️ Role Change',
  event_created:  '📅 Event Created',
  event_closed:   '🔒 Event Closed',
};

function formatTime(ts: unknown): string {
  if (!ts) return '-';
  const d = (ts as {toDate?:()=>Date}).toDate
    ? (ts as {toDate:()=>Date}).toDate()
    : (ts as {_seconds?:number})._seconds
      ? new Date((ts as {_seconds:number})._seconds * 1000)
      : new Date(ts as string);
  return d.toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export default function LogsPage() {
  const [logs, setLogs]               = useState<Log[]>([]);
  const [loading, setLoading]          = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom]        = useState('');
  const [dateTo, setDateTo]            = useState('');

  useEffect(() => { loadLogs(); }, [actionFilter, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      if (dateFrom)     params.set('startDate', dateFrom);
      if (dateTo)       params.set('endDate', dateTo);
      const qs  = params.toString();
      const res = await api.get(`/logs${qs ? '?' + qs : ''}`);
      setLogs((res as {logs?:Log[]})?.logs || (Array.isArray(res) ? res as Log[] : []));
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function exportLogs() {
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      if (dateFrom)     params.set('startDate', dateFrom);
      if (dateTo)       params.set('endDate', dateTo);
      const qs   = params.toString();
      const data = await api.get(`/logs/export${qs ? '?' + qs : ''}`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Export failed'); }
  }

  const actions = Object.keys(ACTION_LABELS);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{flexWrap:'wrap',gap:12}}>
        <h1 className="font-display text-2xl">System Logs</h1>
        <button className="btn btn-secondary btn-sm btn-depth" onClick={exportLogs}>
          <i className="ri-download-2-line" aria-hidden="true" /> Export JSON
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-lg">
        <div className="grid-3" style={{gap:12}}>
          <div>
            <label className="label" htmlFor="log-action">Action</label>
            <select id="log-action" className="input select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
              <option value="">All actions</option>
              {actions.map(a => <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="log-from">From</label>
            <input id="log-from" type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="log-to">To</label>
            <input id="log-to" type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card">{[1,2,3,4,5].map(i => <div key={i} className="skeleton mb-md" style={{height:40}} />)}</div>
      ) : (
        <div className="card" style={{padding:0}}>
          <div className="table-container" style={{border:'none'}}>
            <table className="table">
              <thead><tr><th>Time</th><th>Action</th><th>User</th><th>Details</th></tr></thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id || i}>
                    <td><span className="text-xs text-muted">{formatTime(log.timestamp)}</span></td>
                    <td><span className="badge badge-gray">{ACTION_LABELS[log.action] || log.action}</span></td>
                    <td><span className="text-sm">{log.userId?.substring(0, 8)}...</span></td>
                    <td>
                      <span className="text-xs text-muted">
                        {log.eventName && `Event: ${log.eventName}`}
                        {log.result && ` | ${log.result}`}
                        {log.targetUserId && ` | Target: ${log.targetUserId.substring(0,8)}...`}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={4} className="text-center text-muted p-lg">No logs found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
