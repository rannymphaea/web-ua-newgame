'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';

/* ── Types ──────────────────────────────────────────────────────── */
interface UserRow {
  id:          string;
  displayName: string;
  email:       string;
  memberId:    string;
  role:        'member' | 'admin' | 'superadmin';
  division:    string;
  status:      string;
}

const ROLES = ['member', 'admin', 'superadmin'] as const;
type Role = typeof ROLES[number];

const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
  superadmin: { bg: 'rgba(253,207,65,0.12)', text: '#c49a10',      border: 'rgba(253,207,65,0.4)' },
  admin:      { bg: 'rgba(185,166,206,0.12)', text: '#8b6fad',     border: 'rgba(185,166,206,0.4)' },
  member:     { bg: 'rgba(31,41,58,0.06)',    text: 'var(--clr-text-secondary)', border: 'var(--clr-border)' },
};

/* ════════════════════════════════════════════════════════════════
   ROLE MANAGEMENT PAGE — superadmin only
   ════════════════════════════════════════════════════════════════ */
export default function RoleManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();

  const [users,   setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [search,  setSearch]  = useState('');
  const [toast,   setToast]   = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  /* Guard — superadmin only */
  useEffect(() => {
    if (!authLoading && user && (user as any).role !== 'superadmin') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  /* Load users */
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<UserRow[]>('/auth/users');
      setUsers(data);
    } catch {
      showToast('Gagal memuat data user', 'err');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  /* Toast helper */
  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  /* Change role */
  async function changeRole(userId: string, newRole: Role) {
    if (userId === (user as any)?.uid && newRole !== 'superadmin') {
      showToast('Kamu tidak bisa menurunkan role dirimu sendiri', 'err');
      return;
    }
    setSaving(userId);
    try {
      await api.post('/auth/set-role', { userId, role: newRole });
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
      showToast(`Role berhasil diubah ke ${newRole}`, 'ok');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah role', 'err');
    } finally {
      setSaving(null);
    }
  }

  /* Filter */
  const filtered = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.memberId.toLowerCase().includes(search.toLowerCase()) ||
    u.division.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || (user as any)?.role !== 'superadmin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(253,207,65,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ri-shield-star-line" style={{ fontSize: 20, color: '#c49a10' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-lora)', fontSize: 24, fontWeight: 700,
            color: 'var(--clr-text-primary)', margin: 0,
          }}>
            Manajemen Role
          </h1>
        </div>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'var(--clr-text-secondary)', margin: 0 }}>
          Kelola hak akses seluruh anggota NEWGAME. Hanya superadmin yang dapat mengakses halaman ini.
        </p>
      </div>

      {/* Role legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {ROLES.map(r => {
          const c = ROLE_COLORS[r];
          return (
            <div key={r} style={{
              padding: '6px 14px', borderRadius: 99,
              background: c.bg, border: `1px solid ${c.border}`,
              fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600,
              color: c.text, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <i className={r === 'superadmin' ? 'ri-vip-crown-line' : r === 'admin' ? 'ri-shield-user-line' : 'ri-user-line'} />
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </div>
          );
        })}
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-secondary)', alignSelf: 'center', marginLeft: 4 }}>
          — klik dropdown untuk ubah role anggota
        </span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <i className="ri-search-line" style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--clr-text-secondary)', fontSize: 16,
        }} />
        <input
          type="text"
          className="input"
          placeholder="Cari nama, email, member ID, atau divisi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <span className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 12, fontFamily: 'var(--font-inter)', fontSize: 13, color: 'var(--clr-text-secondary)' }}>
            Memuat data...
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--clr-bg-surface)', border: '1px solid var(--clr-border)',
          borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 140px 120px 120px',
            padding: '12px 20px',
            background: 'var(--clr-bg-muted)',
            borderBottom: '1px solid var(--clr-border)',
            fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--clr-text-secondary)',
          }}>
            <span>Nama</span>
            <span>Email</span>
            <span>Member ID</span>
            <span>Divisi</span>
            <span>Role</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)', fontSize: 13 }}>
              {search ? 'Tidak ada hasil yang cocok' : 'Belum ada user'}
            </div>
          ) : (
            filtered.map((u, i) => {
              const roleColor = ROLE_COLORS[u.role] ?? ROLE_COLORS.member;
              const isSelf    = u.id === (user as any)?.uid;
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 140px 120px 120px',
                    padding: '14px 20px', alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--clr-border)' : 'none',
                    background: isSelf ? 'rgba(253,207,65,0.03)' : 'transparent',
                  }}
                >
                  {/* Name */}
                  <div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 14, color: 'var(--clr-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {u.displayName || '—'}
                      {isSelf && <span style={{ fontSize: 10, background: 'rgba(253,207,65,0.15)', color: '#c49a10', padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>Kamu</span>}
                    </p>
                  </div>

                  {/* Email */}
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </p>

                  {/* Member ID */}
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-muted)', margin: 0, fontWeight: 600, letterSpacing: '0.02em' }}>
                    {u.memberId || '—'}
                  </p>

                  {/* Division */}
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-secondary)', margin: 0 }}>
                    {u.division || '—'}
                  </p>

                  {/* Role selector */}
                  <div style={{ position: 'relative' }}>
                    {saving === u.id ? (
                      <span className="spinner spinner-sm" />
                    ) : (
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={e => changeRole(u.id, e.target.value as Role)}
                        style={{
                          padding: '5px 10px', borderRadius: 99,
                          background: roleColor.bg,
                          border: `1px solid ${roleColor.border}`,
                          color: roleColor.text,
                          fontFamily: 'var(--font-inter)', fontSize: 12, fontWeight: 600,
                          cursor: isSelf ? 'not-allowed' : 'pointer',
                          appearance: 'none', WebkitAppearance: 'none',
                          paddingRight: 28,
                          opacity: isSelf ? 0.5 : 1,
                        }}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r} style={{ background: 'var(--clr-bg-surface-solid)', color: 'var(--clr-text-primary)' }}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Stats footer */}
      {!loading && (
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {ROLES.map(r => {
            const count = users.filter(u => u.role === r).length;
            const c     = ROLE_COLORS[r];
            return (
              <div key={r} style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-secondary)' }}>
                <span style={{ color: c.text, fontWeight: 700 }}>{count}</span> {r}
              </div>
            );
          })}
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-secondary)', marginLeft: 'auto' }}>
            Total: <strong style={{ color: 'var(--clr-text-primary)' }}>{users.length}</strong> user
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              padding: '12px 24px', borderRadius: 12,
              background: toast.type === 'ok' ? 'var(--clr-success-bg)' : 'var(--clr-danger-bg)',
              border: `1px solid ${toast.type === 'ok' ? 'var(--clr-success-border)' : 'var(--clr-danger-border)'}`,
              color: toast.type === 'ok' ? 'var(--clr-success)' : 'var(--clr-danger)',
              fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: 'var(--shadow-lg)', zIndex: 9999, whiteSpace: 'nowrap',
            }}
          >
            <i className={toast.type === 'ok' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} style={{ fontSize: 16 }} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
