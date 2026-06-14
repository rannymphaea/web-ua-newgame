'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface MemberProfile {
  id: string;
  uid?: string;
  username?: string;
  name?: string;
  memberId?: string;
  pillar?: string;
  generation?: string;
  xpCache?: number;
  level?: number;
  attendanceCount?: number;
  status?: string;
  photoURL?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  role?: string;
}

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const uid = params?.uid as string;
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    api.get(`/members/${uid}`)
      .then(res => setMember(res as MemberProfile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
    </div>
  );

  if (!member) return (
    <div className="card text-center p-xl">
      <i className="ri-user-unfollow-line" style={{ fontSize: 48, display: 'block', marginBottom: 8, opacity: 0.4 }} />
      <p className="text-muted">Anggota tidak ditemukan</p>
      <button className="btn btn-ghost mt-md" onClick={() => router.back()}>← Kembali</button>
    </div>
  );

  const level = member.level || Math.floor((member.xpCache || 0) / 100) + 1;
  const xpFrac = ((member.xpCache || 0) % 100) / 100;

  return (
    <div className="animate-fade-in">
      <button className="btn btn-ghost btn-sm mb-lg" onClick={() => router.back()}>
        <i className="ri-arrow-left-line" /> Kembali
      </button>

      {/* Profile card */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, var(--clr-bg-surface) 0%, rgba(244,196,48,0.05) 100%)' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: 'var(--clr-gold-glow)', border: '2px solid var(--clr-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: 'var(--clr-gold)', overflow: 'hidden',
          }}>
            {member.photoURL
              ? <img src={member.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (member.username || member.name || '?').charAt(0).toUpperCase()
            }
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="font-display text-2xl">{member.username || member.name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {member.role && <span className="badge badge-gold">{member.role}</span>}
              {member.pillar && <span className="badge badge-blue">{member.pillar}</span>}
              {member.generation && <span className="badge badge-gray">{member.generation}</span>}
            </div>
            <div className="text-xs text-muted mt-sm">{member.memberId}</div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="text-sm text-muted">Level {level}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--clr-gold)' }}>{member.xpCache || 0} XP</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--clr-bg-muted)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${xpFrac * 100}%`, background: 'var(--clr-gold)', borderRadius: 4, transition: 'width 1s ease' }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'XP', value: member.xpCache || 0, icon: 'ri-star-fill', color: 'var(--clr-gold)' },
          { label: 'Level', value: level, icon: 'ri-bar-chart-fill', color: 'var(--clr-info)' },
          { label: 'Kehadiran', value: member.attendanceCount || 0, icon: 'ri-calendar-check-fill', color: 'var(--clr-success)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 16 }}>
            <i className={s.icon} style={{ fontSize: 24, color: s.color, display: 'block', marginBottom: 4 }} />
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bio + links */}
      {(member.bio || member.github || member.linkedin || member.skills?.length) && (
        <div className="card">
          {member.bio && <p className="text-sm mb-md" style={{ lineHeight: 1.7 }}>{member.bio}</p>}
          {member.skills && member.skills.length > 0 && (
            <div className="mb-md" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {member.skills.map(s => <span key={s} className="badge badge-gray">{s}</span>)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                <i className="ri-github-line" /> GitHub
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                <i className="ri-linkedin-line" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
