'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  status: string;
  xpReward?: number;
  attendeeCount?: number;
  description?: string;
}

interface EventForm {
  name: string;
  xpReward: string;
  description: string;
}

export default function AdminPage() {
  const [events, setEvents]       = useState<Event[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]           = useState<EventForm>({ name: '', xpReward: '10', description: '' });
  const [creating, setCreating]   = useState(false);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const res = await api.get('/events?limit=20');
      setEvents(Array.isArray(res) ? res as Event[] : (res as {events:Event[]})?.events || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault(); setCreating(true);
    try {
      await api.post('/events', { name: form.name, xpReward: parseInt(form.xpReward), description: form.description });
      setShowCreate(false); setForm({ name: '', xpReward: '10', description: '' });
      loadEvents();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
    finally { setCreating(false); }
  }

  async function generateToken(eventId: string) {
    try { await api.post(`/events/${eventId}/generate-token`, {}); alert('QR Token generated!'); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
  }

  async function closeEvent(eventId: string) {
    if (!confirm('Close this event?')) return;
    try { await api.patch(`/events/${eventId}/close`, {}); loadEvents(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{flexWrap:'wrap',gap:12}}>
        <h1 className="font-display text-2xl">Admin Panel</h1>
        <div className="flex gap-sm">
          <Link href="/admin/news" className="btn btn-secondary btn-sm btn-depth">
            <i className="ri-newspaper-line" aria-hidden="true" /> Manage News
          </Link>
          <Link href="/admin/media" className="btn btn-secondary btn-sm btn-depth">
            <i className="ri-image-2-line" aria-hidden="true" /> Media
          </Link>
          <button className="btn btn-primary btn-sm btn-depth" onClick={() => setShowCreate(!showCreate)}>
            <i className="ri-add-line" aria-hidden="true" /> Create Event
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="card mb-lg animate-slide-up">
          <h3 className="font-display text-lg mb-md">Create New Event</h3>
          <form onSubmit={createEvent}>
            <div className="grid-2 mb-md">
              <div>
                <label className="label" htmlFor="ev-name">Event Name</label>
                <input id="ev-name" className="input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required />
              </div>
              <div>
                <label className="label" htmlFor="ev-xp">XP Reward</label>
                <input id="ev-xp" type="number" className="input" value={form.xpReward} onChange={e => setForm({...form,xpReward:e.target.value})} required />
              </div>
            </div>
            <div className="mb-md">
              <label className="label" htmlFor="ev-desc">Description</label>
              <textarea id="ev-desc" className="input textarea" value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
            </div>
            <div className="flex gap-sm">
              <button type="submit" className="btn btn-primary btn-sm btn-depth" disabled={creating}>
                {creating ? <><span className="spinner spinner-sm" /> Creating...</> : 'Create Event'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card">{[1,2,3].map(i => <div key={i} className="skeleton mb-md" style={{height:60}} />)}</div>
      ) : (
        <div className="card" style={{padding:0}}>
          <div className="table-container" style={{border:'none'}}>
            <table className="table">
              <thead>
                <tr><th>Event</th><th>Status</th><th>XP</th><th>Attendees</th><th style={{textAlign:'right'}}>Actions</th></tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td>
                      <span className="font-semibold">{ev.name}</span><br />
                      <span className="text-xs text-muted">{ev.id}</span>
                    </td>
                    <td>
                      <span className={`badge ${ev.status==='active'?'badge-green':ev.status==='closed'?'badge-gray':'badge-yellow'}`}>{ev.status}</span>
                    </td>
                    <td><span className="font-bold text-green">{ev.xpReward || 10}</span></td>
                    <td>{ev.attendeeCount || 0}</td>
                    <td style={{textAlign:'right'}}>
                      <div className="flex gap-xs" style={{justifyContent:'flex-end'}}>
                        {ev.status === 'active' && (
                          <>
                            <button className="btn btn-secondary btn-sm btn-depth" onClick={() => generateToken(ev.id)}>
                              <i className="ri-refresh-line" aria-hidden="true" /> QR
                            </button>
                            <button className="btn btn-ghost btn-sm text-red" onClick={() => closeEvent(ev.id)}>Close</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && <tr><td colSpan={5} className="text-center text-muted p-xl">No events yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
