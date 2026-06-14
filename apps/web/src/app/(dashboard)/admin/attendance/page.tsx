'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AttendanceRow {
  eventId: string;
  eventName: string;
  userId: string;
  status: string;
  xpChange: number;
  isLate: boolean;
  attendedAt: { _seconds: number };
}

export default function AdminAttendancePage() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [csvData, setCsvData] = useState('');
  const [exporting, setExporting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventId) params.set('eventId', eventId);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await api.get(`/attendance/export/csv?${params}`) as { csv: string; count: number };
      setCsvData(res.csv || '');
      // Parse CSV back to display
      const lines = (res.csv || '').split('\n').slice(1);
      const parsed: AttendanceRow[] = lines.filter(Boolean).map(line => {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''));
        return {
          eventName: cols[0], eventId: cols[0], userId: cols[1],
          status: cols[2], xpChange: Number(cols[3]),
          isLate: false, attendedAt: { _seconds: 0 },
        };
      });
      setRows(parsed);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  function downloadCsv() {
    if (!csvData) return;
    setExporting(true);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance-report-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-display text-2xl">Laporan Absensi</h1>
          <p className="text-muted text-sm">Filter dan export data kehadiran anggota</p>
        </div>
        <button
          className="btn btn-primary btn-depth"
          onClick={downloadCsv}
          disabled={!csvData || exporting}
        >
          <i className="ri-download-2-line" /> Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="card mb-lg">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
          <div>
            <label className="label" htmlFor="att-event">Event ID</label>
            <input id="att-event" className="input" placeholder="Kosongkan untuk semua" value={eventId} onChange={e => setEventId(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="att-from">Dari Tanggal</label>
            <input id="att-from" type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="att-to">Sampai Tanggal</label>
            <input id="att-to" type="date" className="input" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary btn-depth w-full" onClick={load} disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Memuat...</> : <><i className="ri-search-line" /> Tampilkan</>}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {rows.length === 0 && !loading ? (
          <div className="text-center text-muted p-xl">
            <i className="ri-calendar-check-line" style={{ fontSize: 40, display: 'block', marginBottom: 8 }} />
            Belum ada data. Klik <strong>Tampilkan</strong> untuk memuat.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>XP</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td><span className="font-semibold">{r.eventName}</span></td>
                    <td><code className="text-xs">{r.userId}</code></td>
                    <td>
                      <span className={`badge ${r.status === 'present' ? 'badge-green' : r.status === 'late' ? 'badge-yellow' : 'badge-gray'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <span className={r.xpChange >= 0 ? 'text-green font-bold' : 'text-red font-bold'}>
                        {r.xpChange >= 0 ? '+' : ''}{r.xpChange}
                      </span>
                    </td>
                    <td className="text-xs text-muted">{r.attendedAt?._seconds ? new Date(r.attendedAt._seconds * 1000).toLocaleDateString('id') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
