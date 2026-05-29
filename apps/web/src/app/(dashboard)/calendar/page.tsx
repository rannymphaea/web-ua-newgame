'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface CalEvent {
  id?: string;
  name?: string;
  title?: string;
  xpReward?: number;
  status?: string;
  date?: string;
  createdAt?: string;
}

export default function CalendarPage() {
  const [events, setEvents]   = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year,  setYear]  = useState(today.getFullYear());

  useEffect(() => {
    api.get('/events')
      .then(r => setEvents(Array.isArray(r) ? r as CalEvent[] : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstDay     = new Date(year, month, 1).getDay();
  const MONTH_NAMES  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const openEvents = events.filter(e => e.status === 'open' || e.status === 'active');

  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <div className="cal-hero mb-xl">
        <div className="cal-hero-text">
          <p className="cal-eyebrow">
            <i className="ri-calendar-event-fill" style={{fontSize:11,marginRight:5,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
            Jadwal Kegiatan
          </p>
          <h1 className="cal-title">Kalender Event</h1>
          <p className="cal-sub">Jangan lewatkan event terbaru dan raih XP tambahan!</p>
        </div>
        <div className="cal-oc-wrap">
          <img src="/oc-cmd.png" alt="Instructor OC" className="cal-oc-img animate-float" />
        </div>
      </div>

      <div className="cal-layout">

        {/* CALENDAR GRID */}
        <div className="card cal-grid-card">
          <div className="cal-month-header">
            <button onClick={prevMonth} className="cal-nav-btn" aria-label="Bulan sebelumnya">
              <i className="ri-arrow-left-s-line" style={{fontSize:18}} aria-hidden="true" />
            </button>
            <h3 className="cal-month-title">{MONTH_NAMES[month]} {year}</h3>
            <button onClick={nextMonth} className="cal-nav-btn" aria-label="Bulan berikutnya">
              <i className="ri-arrow-right-s-line" style={{fontSize:18}} aria-hidden="true" />
            </button>
          </div>

          <div className="cal-grid" role="grid" aria-label={`${MONTH_NAMES[month]} ${year}`}>
            {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map((d, i) => (
              <div key={d} className={`cal-day-label${i === 0 || i === 6 ? ' weekend' : ''}`} role="columnheader">{d}</div>
            ))}
            {Array.from({length: firstDay}, (_, i) => <div key={`empty-${i}`} className="cal-cell empty" aria-hidden="true" />)}
            {Array.from({length: daysInMonth}, (_, i) => {
              const day      = i + 1;
              const isToday  = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dateStr  = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const hasEvent = events.some(e => e.date === dateStr || (e.createdAt && e.createdAt.startsWith(dateStr)));
              return (
                <div key={day} className={`cal-cell${isToday ? ' today' : ''}${hasEvent ? ' has-event' : ''}`} role="gridcell" aria-label={isToday ? `${day}, hari ini` : String(day)}>
                  <span className="cal-day-num">{day}</span>
                  {hasEvent && <div className="cal-event-dot" aria-hidden="true" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* EVENT LIST */}
        <div className="card cal-list-card">
          <div className="cal-list-header">
            <i className="ri-calendar-check-line" style={{fontSize:18,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
            <h3 style={{fontFamily:'var(--font-lora)',fontSize:16,fontWeight:600,color:'var(--clr-text-primary)'}}>Event Mendatang</h3>
          </div>
          <div className="cal-events-list">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="skeleton" style={{height:64,marginBottom:12,borderRadius:10}} />)
            ) : openEvents.length > 0 ? (
              openEvents.map((e, i) => {
                const d     = e.date ? new Date(e.date) : null;
                const month = d ? MONTH_NAMES[d.getMonth()].substring(0,3).toUpperCase() : 'EVT';
                const day   = d ? d.getDate() : (i + 1);
                return (
                  <div key={i} className="event-list-item">
                    <div className="event-date-box">
                      <span className="event-month">{month}</span>
                      <span className="event-day">{day}</span>
                    </div>
                    <div className="event-details">
                      <h4 className="event-name">{e.name || e.title}</h4>
                      <p className="event-xp">
                        <i className="ri-flashlight-fill" style={{fontSize:11,marginRight:3,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
                        +{e.xpReward || 10} XP
                      </p>
                    </div>
                    <span className="badge badge-green">Open</span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <i className="ri-calendar-close-line" style={{fontSize:36,color:'var(--clr-text-secondary)',marginBottom:12,display:'block'}} aria-hidden="true" />
                <p style={{fontFamily:'var(--font-inter)',fontSize:13,color:'var(--clr-text-secondary)'}}>Belum ada event terjadwal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cal-hero { display:flex; align-items:center; justify-content:space-between; padding:24px 28px; background:var(--clr-bg-surface); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid var(--clr-border); border-radius:18px; overflow:hidden; position:relative; }
        .cal-hero::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--clr-ink),var(--clr-gold),var(--clr-ink)); pointer-events:none; }
        .cal-eyebrow { font-family:var(--font-inter); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--clr-text-secondary); margin-bottom:6px; display:flex; align-items:center; }
        .cal-title { font-family:var(--font-lora); font-size:clamp(22px,3vw,30px); font-weight:700; color:var(--clr-text-primary); margin-bottom:6px; line-height:1.1; }
        .cal-sub { font-family:var(--font-cormorant); font-size:16px; color:var(--clr-text-secondary); font-style:italic; }
        .cal-oc-wrap { flex-shrink:0; }
        .cal-oc-img { width:120px; height:120px; object-fit:contain; filter:drop-shadow(0 6px 20px var(--clr-border)); transition:none !important; }
        .cal-layout { display:grid; grid-template-columns:1fr 340px; gap:20px; align-items:start; }
        .cal-grid-card { padding:24px; }
        .cal-month-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
        .cal-month-title { font-family:var(--font-lora); font-size:20px; font-weight:600; color:var(--clr-text-primary); text-transform:capitalize; }
        .cal-nav-btn { width:32px; height:32px; border-radius:8px; background:var(--clr-bg-muted); border:1px solid var(--clr-border); display:flex; align-items:center; justify-content:center; color:var(--clr-text-primary); cursor:pointer; transition:all 0.2s ease !important; }
        .cal-nav-btn:hover { background:var(--clr-gold-subtle); border-color:var(--clr-border-gold); color:var(--clr-gold-dim); }
        .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
        .cal-day-label { text-align:center; font-family:var(--font-inter); font-size:10px; font-weight:700; text-transform:uppercase; color:var(--clr-text-secondary); padding-bottom:12px; }
        .cal-day-label.weekend { color:var(--clr-danger); opacity:0.7; }
        .cal-cell { aspect-ratio:1; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; transition:all 0.2s ease !important; border:1px solid transparent; cursor:pointer; }
        .cal-cell:not(.empty) { background:var(--clr-bg-muted); border-color:var(--clr-border); }
        .cal-cell:not(.empty):hover { background:var(--clr-gold-subtle); border-color:var(--clr-border-gold); }
        .cal-day-num { font-family:var(--font-inter); font-size:13px; font-weight:500; color:var(--clr-text-primary); }
        .cal-cell.today { background:var(--clr-danger-bg) !important; border-color:var(--clr-danger-border) !important; }
        .cal-cell.today .cal-day-num { color:var(--clr-danger); font-weight:700; }
        .cal-event-dot { width:6px; height:6px; border-radius:50%; background:var(--clr-gold-dim); margin-top:3px; }
        .cal-list-card { padding:24px; }
        .cal-list-header { display:flex; align-items:center; gap:8px; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid var(--clr-border); }
        .event-list-item { display:flex; align-items:center; gap:12px; padding:12px; background:var(--clr-bg-muted); border:1px solid var(--clr-border); border-radius:12px; margin-bottom:10px; transition:all 0.2s ease !important; }
        .event-list-item:hover { transform:translateX(4px); border-color:var(--clr-border-gold); box-shadow:var(--shadow-sm); }
        .event-date-box { background:var(--clr-danger-bg); border-radius:8px; width:44px; height:44px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
        .event-month { font-family:var(--font-inter); font-size:9px; font-weight:700; color:var(--clr-danger); }
        .event-day { font-family:var(--font-lora); font-size:16px; font-weight:700; color:var(--clr-danger); line-height:1; }
        .event-details { flex:1; min-width:0; }
        .event-name { font-family:var(--font-inter); font-size:13.5px; font-weight:600; color:var(--clr-text-primary); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .event-xp { font-family:var(--font-inter); font-size:11px; color:var(--clr-text-secondary); display:flex; align-items:center; }
        .empty-state { text-align:center; padding:40px 0; }
        @media (max-width:900px) { .cal-layout { grid-template-columns:1fr; } .cal-hero { padding:16px 18px; } .cal-oc-img { width:80px; height:80px; } }
      `}</style>
    </div>
  );
}
