'use client';
import { useMemo } from 'react';

interface AttendanceRecord {
  attendedAt: { _seconds: number } | string;
}

interface ActivityHeatmapProps {
  records: AttendanceRecord[];
  weeks?: number; // default 16 weeks
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toTimestamp(r: AttendanceRecord): number {
  const a = r.attendedAt;
  if (typeof a === 'string') return new Date(a).getTime();
  if ((a as any)?._seconds) return (a as any)._seconds * 1000;
  return 0;
}

export default function ActivityHeatmap({ records, weeks = 16 }: ActivityHeatmapProps) {
  const { grid, maxCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of records) {
      const ts = toTimestamp(r);
      if (!ts) continue;
      const k = dayKey(new Date(ts));
      counts[k] = (counts[k] || 0) + 1;
    }

    // Build grid: weeks × 7 days, ending today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = weeks * 7;
    const grid: { date: Date; count: number }[][] = [];

    for (let w = weeks - 1; w >= 0; w--) {
      const col: { date: Date; count: number }[] = [];
      for (let d = 6; d >= 0; d--) {
        const offset = w * 7 + d;
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        col.unshift({ date, count: counts[dayKey(date)] || 0 });
      }
      grid.push(col);
    }

    const maxCount = Math.max(1, ...Object.values(counts));
    return { grid, maxCount };
  }, [records, weeks]);

  function cellColor(count: number) {
    if (count === 0) return 'var(--clr-bg-muted)';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return 'rgba(244,196,48,0.25)';
    if (intensity < 0.5)  return 'rgba(244,196,48,0.5)';
    if (intensity < 0.75) return 'rgba(244,196,48,0.75)';
    return 'var(--clr-gold)';
  }

  const DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  // Month labels above grid
  const monthLabels = grid.map((col, i) => {
    const d = col[0].date;
    return (i === 0 || d.getDate() <= 7) ? MONTHS_SHORT[d.getMonth()] : '';
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 18 }}>
          {DAYS_SHORT.map((d, i) => (
            <div key={d} style={{
              height: 12, fontSize: 9, color: 'var(--clr-text-secondary)',
              fontFamily: 'var(--font-inter)', lineHeight: 1,
              visibility: i % 2 === 0 ? 'visible' : 'hidden',
            }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto', flex: 1 }}>
          {/* Month labels */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 4, paddingLeft: 0 }}>
            {monthLabels.map((label, i) => (
              <div key={i} style={{ width: 12, fontSize: 9, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)', flexShrink: 0 }}>
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: 3 }}>
            {grid.map((col, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {col.map(({ date, count }) => {
                  const label = `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}: ${count} kehadiran`;
                  return (
                    <div
                      key={dayKey(date)}
                      title={label}
                      style={{
                        width: 12, height: 12, borderRadius: 2,
                        background: cellColor(count),
                        cursor: count > 0 ? 'pointer' : 'default',
                        transition: 'transform 0.1s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.3)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)' }}>Kurang</span>
        {[0, 0.3, 0.6, 1].map(v => (
          <div key={v} style={{
            width: 11, height: 11, borderRadius: 2,
            background: v === 0 ? 'var(--clr-bg-muted)' : `rgba(244,196,48,${v})`,
          }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)' }}>Banyak</span>
      </div>
    </div>
  );
}
