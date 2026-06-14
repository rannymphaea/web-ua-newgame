'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface CalEvent {
  id: string;
  name: string;
  date: { _seconds: number } | string;
  type?: string;
  pillar?: string;
  location?: string;
}

function toDate(d: CalEvent['date']): Date {
  if (typeof d === 'string') return new Date(d);
  if ((d as any)?._seconds) return new Date((d as any)._seconds * 1000);
  return new Date();
}

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [dayEvents, setDayEvents] = useState<CalEvent[]>([]);

  useEffect(() => {
    api.get('/events?limit=100')
      .then(res => {
        const data = Array.isArray(res) ? res : (res as any).events || [];
        setEvents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function getEventsOnDay(day: number) {
    return events.filter(e => {
      const d = toDate(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function selectDay(day: number) {
    const d = new Date(year, month, day);
    setSelected(d);
    setDayEvents(getEventsOnDay(day));
  }

  const today = new Date();

  const pillTypeColor: Record<string, string> = {
    training: 'var(--clr-info)',
    competition: 'var(--clr-danger)',
    gathering: 'var(--clr-success)',
    meeting: 'var(--clr-warning)',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h1 className="font-display text-2xl">Kalender Event</h1>
        <div className="flex gap-sm items-center">
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(new Date(year, month - 1, 1))}>
            <i className="ri-arrow-left-s-line" />
          </button>
          <span className="font-semibold" style={{ minWidth: 160, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(new Date(year, month + 1, 1))}>
            <i className="ri-arrow-right-s-line" />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(new Date())}>Hari ini</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,300px)', gap: 16, alignItems: 'start' }}>
        {/* Calendar grid */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Days header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--clr-border)' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', padding: '8px 4px', fontSize: 12, fontWeight: 600, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)' }}>
                {d}
              </div>
            ))}
          </div>
          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {[...Array(firstDay)].map((_, i) => <div key={`blank-${i}`} style={{ minHeight: 72, borderBottom: '1px solid var(--clr-border)', borderRight: '1px solid var(--clr-border)' }} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dayEvs = getEventsOnDay(day);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const isSel = selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
              return (
                <div
                  key={day}
                  onClick={() => selectDay(day)}
                  style={{
                    minHeight: 72, padding: 6, cursor: 'pointer',
                    borderBottom: '1px solid var(--clr-border)',
                    borderRight: '1px solid var(--clr-border)',
                    background: isSel ? 'rgba(244,196,48,0.08)' : isToday ? 'rgba(244,196,48,0.04)' : undefined,
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: isToday ? 'var(--clr-gold)' : 'transparent',
                    color: isToday ? '#000' : 'var(--clr-text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: isToday ? 700 : 400, marginBottom: 4,
                  }}>
                    {day}
                  </div>
                  {dayEvs.slice(0, 2).map(ev => (
                    <div key={ev.id} style={{
                      fontSize: 10, borderRadius: 3, padding: '1px 4px', marginBottom: 2,
                      background: pillTypeColor[ev.type || 'training'] || 'var(--clr-info)',
                      color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ev.name}
                    </div>
                  ))}
                  {dayEvs.length > 2 && <div style={{ fontSize: 10, color: 'var(--clr-text-secondary)' }}>+{dayEvs.length - 2} lagi</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {selected ? (
            <div className="card">
              <h3 className="font-display text-base mb-md">
                {selected.getDate()} {MONTHS[selected.getMonth()]} {selected.getFullYear()}
              </h3>
              {dayEvents.length === 0 ? (
                <p className="text-sm text-muted">Tidak ada event hari ini</p>
              ) : (
                dayEvents.map(ev => (
                  <div key={ev.id} style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--clr-bg-muted)', borderLeft: `3px solid ${pillTypeColor[ev.type || 'training'] || 'var(--clr-info)'}` }}>
                    <div className="font-semibold text-sm mb-xs">{ev.name}</div>
                    {ev.pillar && <span className="badge badge-blue text-xs mr-xs">{ev.pillar}</span>}
                    {ev.type && <span className="badge badge-gray text-xs">{ev.type}</span>}
                    {ev.location && <div className="text-xs text-muted mt-xs"><i className="ri-map-pin-line mr-xs" />{ev.location}</div>}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="card text-center text-muted text-sm">
              <i className="ri-calendar-line" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.4 }} />
              Pilih tanggal untuk melihat event
            </div>
          )}

          {/* Legend */}
          <div className="card mt-md" style={{ padding: '12px 16px' }}>
            <p className="text-xs font-semibold mb-sm text-muted">LEGENDA</p>
            {Object.entries(pillTypeColor).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span className="text-xs" style={{ textTransform: 'capitalize' }}>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
