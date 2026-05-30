'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

interface Form {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  division: string;
}

const DIVISIONS = ['general', 'gamedev', 'design', 'sound', 'narrative', 'tech'];

export default function RegisterAdminPage() {
  const [form, setForm]     = useState<Form>({ email: '', password: '', confirmPassword: '', displayName: '', division: 'general' });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (form.password !== form.confirmPassword) {
      setResult({ type: 'err', msg: 'Password tidak cocok' });
      return;
    }
    if (form.password.length < 8) {
      setResult({ type: 'err', msg: 'Password minimal 8 karakter' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register-admin', {
        email:       form.email.trim().toLowerCase(),
        password:    form.password,
        displayName: form.displayName.trim(),
        division:    form.division,
      }) as { success: boolean; email: string; displayName: string };

      setResult({ type: 'ok', msg: `Admin "${res.displayName}" (${res.email}) berhasil dibuat.` });
      setForm({ email: '', password: '', confirmPassword: '', displayName: '', division: 'general' });
    } catch (err: any) {
      setResult({ type: 'err', msg: err?.message || 'Gagal membuat admin' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px' }}>
      <div className="card" style={{ padding: 32 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(253,207,65,0.12)', border: '1.5px solid rgba(253,207,65,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ri-shield-user-line" style={{ fontSize: 20, color: 'var(--clr-gold-dim)' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 700, color: 'var(--clr-text-primary)', lineHeight: 1.2 }}>
                Daftarkan Admin
              </h1>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-text-secondary)', marginTop: 2 }}>
                Hanya dapat dilakukan oleh Superadmin
              </p>
            </div>
          </div>
          <div className="divider-glow" style={{ margin: '16px 0 0' }} />
        </div>

        {/* Result banner */}
        {result && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            background: result.type === 'ok' ? 'var(--clr-success-bg)' : 'var(--clr-danger-bg)',
            border: `1px solid ${result.type === 'ok' ? 'var(--clr-success-border)' : 'var(--clr-danger-border)'}`,
            color: result.type === 'ok' ? 'var(--clr-success)' : 'var(--clr-danger)',
            fontFamily: 'var(--font-inter)', fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <i className={result.type === 'ok' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} />
            {result.msg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label className="label" htmlFor="ra-name">Nama Lengkap</label>
            <input
              id="ra-name" className="input"
              placeholder="Contoh: Budi Santoso"
              value={form.displayName} onChange={set('displayName')}
              required minLength={2} autoComplete="off"
            />
          </div>

          <div>
            <label className="label" htmlFor="ra-email">Email</label>
            <input
              id="ra-email" type="email" className="input"
              placeholder="admin@example.com"
              value={form.email} onChange={set('email')}
              required autoComplete="off"
            />
          </div>

          <div>
            <label className="label" htmlFor="ra-division">Divisi</label>
            <select id="ra-division" className="input" value={form.division} onChange={set('division')}>
              {DIVISIONS.map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="ra-pw">Password</label>
            <input
              id="ra-pw" type="password" className="input"
              placeholder="Min. 8 karakter"
              value={form.password} onChange={set('password')}
              required minLength={8} autoComplete="new-password"
            />
          </div>

          <div>
            <label className="label" htmlFor="ra-cpw">Konfirmasi Password</label>
            <input
              id="ra-cpw" type="password" className="input"
              placeholder="Ulangi password"
              value={form.confirmPassword} onChange={set('confirmPassword')}
              required minLength={8} autoComplete="new-password"
            />
          </div>

          {/* Info box */}
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'var(--clr-bg-muted)', border: '1px solid var(--clr-border)',
            fontFamily: 'var(--font-inter)', fontSize: 11.5, color: 'var(--clr-text-secondary)',
            lineHeight: 1.6,
          }}>
            <i className="ri-information-line" style={{ marginRight: 6, color: 'var(--clr-info)' }} />
            Admin yang dibuat akan mendapat <strong>role: admin</strong> secara otomatis.
            Password di-hash oleh Firebase Auth. Admin tidak memiliki akses ke fitur superadmin.
          </div>

          <button
            type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <><span className="spinner spinner-sm" />Memproses...</>
            ) : (
              <><i className="ri-user-add-line" />Buat Akun Admin</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
