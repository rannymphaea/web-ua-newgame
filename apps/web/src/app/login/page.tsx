'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import { api } from '@/lib/api';

/** Detect HTML response from misconfigured API URL */
async function safeParseJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  if (text.trimStart().startsWith('<!') || text.trimStart().startsWith('<html')) {
    throw new Error('Server API tidak dapat dihubungi. Pastikan backend (port 3001) sudah berjalan.');
  }
  try { return JSON.parse(text); }
  catch { throw new Error('Respons server tidak valid'); }
}

/* ── Floating ink particle ──────────────────────────────────── */
interface ParticleProps { x: number; y: number; delay: number; color: string; }
function InkParticle({ x, y, delay, color }: ParticleProps) {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute', left: `${x}%`, top: `${y}%`,
        width: 6, height: 6, borderRadius: '50%',
        background: color, pointerEvents: 'none',
      }}
      animate={{ y: [0, -30, -60], opacity: [0, 0.6, 0], scale: [0.5, 1, 0.3] }}
      transition={{ duration: 4, delay, repeat: Infinity, repeatDelay: 3, ease: 'easeOut' }}
    />
  );
}

const PARTICLES: ParticleProps[] = [
  { x: 10, y: 80, delay: 0,   color: 'var(--clr-gold)' },
  { x: 25, y: 60, delay: 1.2, color: 'var(--clr-lavender)' },
  { x: 75, y: 70, delay: 0.5, color: 'var(--clr-gold)' },
  { x: 88, y: 85, delay: 1.8, color: 'var(--clr-lavender)' },
  { x: 45, y: 90, delay: 2.2, color: 'var(--clr-ink)' },
  { x: 62, y: 55, delay: 0.8, color: 'var(--clr-gold)' },
  { x: 15, y: 40, delay: 3.0, color: 'var(--clr-lavender)' },
  { x: 90, y: 30, delay: 1.5, color: 'var(--clr-gold)' },
];

type PageMode = 'login' | 'register';
type LoginMethod = 'email' | 'member-id';

/* ════════════════════════════════════════════════════════════════
   LOGIN PAGE — 2 tabs: Login | Daftar
   Login tab: Email / Member ID toggle + Google sign-in
   ════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const [mode,        setMode]        = useState<PageMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [showForgot,  setShowForgot]  = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Email login
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // NEWGAME ID login — lookup dulu, lalu signIn dengan email yang di-resolve
  const [ngId,          setNgId]          = useState('');
  const [ngPassword,    setNgPassword]    = useState('');
  const [ngLookupDone,  setNgLookupDone]  = useState(false);
  const [ngMaskedEmail, setNgMaskedEmail] = useState('');
  const [ngResolvedEmail, setNgResolvedEmail] = useState('');

  // Register
  const [regName,         setRegName]         = useState('');
  const [regMemberId,     setRegMemberId]      = useState('');
  const [regTempPassword, setRegTempPassword]  = useState('');
  const [regEmail,        setRegEmail]         = useState('');
  const [regPassword,     setRegPassword]      = useState('');

  /* ── Login via Email (Better Auth) ────────────────────────── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await authClient.signIn.email({
        email:    email.trim().toLowerCase(),
        password: password,
      });
      if (result.error) throw new Error(result.error.message || 'Login gagal');
      try { sessionStorage.setItem('ng-just-logged-in', '1'); } catch {}
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login gagal';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('wrong')) {
        setError('Email atau password salah');
      } else if (msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('rate')) {
        setError('Terlalu banyak percobaan, coba lagi dalam beberapa menit');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  }

  /* ── Login via NEWGAME Member ID ───────────────────────────── */
  async function handleNewgameIdLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      let resolvedEmail = ngResolvedEmail;

      // Step 1: Resolve Member ID ke email (jika belum)
      if (!ngLookupDone) {
        const lookupRes = await fetch('/api/auth/lookup-id', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ memberId: ngId.trim().toUpperCase() }),
        });
        if (!lookupRes.ok) {
          const err = await safeParseJson(lookupRes).catch(() => ({}));
          const status = lookupRes.status;
          if (status === 404)      throw new Error('Member ID tidak ditemukan');
          if (status === 400)      throw new Error((err as any).message || 'Format Member ID tidak valid');
          if (status === 401)      throw new Error((err as any).message || 'Akun belum diaktifkan');
          if (status === 429)      throw new Error('Terlalu banyak percobaan');
          throw new Error((err as any).message || 'Gagal mencari Member ID');
        }
        const lookupData = await safeParseJson(lookupRes) as any;
        setNgMaskedEmail(lookupData.maskedEmail);
        setNgResolvedEmail(lookupData.email);
        setNgLookupDone(true);
        resolvedEmail = lookupData.email;
      }

      // Step 2: Sign in dengan Better Auth menggunakan email yang di-resolve
      const result = await authClient.signIn.email({
        email:    resolvedEmail,
        password: ngPassword,
      });
      if (result.error) throw new Error(result.error.message || 'Password salah');

      try { sessionStorage.setItem('ng-just-logged-in', '1'); } catch {}
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login gagal';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('wrong')) {
        setError('Password salah');
      } else {
        setError(msg);
      }
      if (!ngLookupDone) setNgLookupDone(false);
    } finally { setLoading(false); }
  }

  /* ── Register via Better Auth + link ke Member ─────────────── */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Step 1: Verifikasi Member ID + Kode Akses (Prisma)
      const verifyRes = await fetch('/api/auth/verify-member', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          memberId:     regMemberId.trim().toUpperCase(),
          tempPassword: regTempPassword.trim(),
        }),
      });
      if (!verifyRes.ok) {
        const err = await safeParseJson(verifyRes).catch(() => ({}));
        throw new Error((err as any).message || 'Verifikasi gagal — cek Member ID dan Kode Akses');
      }
      const verified = await safeParseJson(verifyRes) as any;

      // Step 2: Buat akun via Better Auth
      const signUpResult = await authClient.signUp.email({
        email:    regEmail.trim().toLowerCase(),
        password: regPassword,
        name:     regName.trim() || verified.name,
      });
      if (signUpResult.error) throw new Error(signUpResult.error.message || 'Pendaftaran gagal');

      // Step 3: Link Member ke akun (Better Auth session sudah aktif)
      const linkRes = await fetch('/api/auth/link-member', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ memberId: regMemberId.trim().toUpperCase() }),
      });
      if (!linkRes.ok) {
        const err = await safeParseJson(linkRes).catch(() => ({}));
        // Jika link gagal, lanjut tetap berhasil — bisa di-link manual nanti
        console.warn('Link member gagal:', (err as any).message);
      }

      setSuccess('Pendaftaran berhasil! Kamu sudah bisa login.');
      setMode('login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Pendaftaran gagal';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('sudah')) {
        setError('Email ini sudah terdaftar. Gunakan email lain atau login.');
      } else if (msg.toLowerCase().includes('password')) {
        setError('Password terlalu lemah. Gunakan minimal 8 karakter.');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  }

  /* ── Google Login (Better Auth Social) ─────────────────────── */
  async function handleGoogleLogin() {
    setLoading(true); setError('');
    try {
      await authClient.signIn.social({ provider: 'google' });
      // Redirect ditangani oleh Better Auth OAuth callback
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login gagal');
      setLoading(false);
    }
  }

  /* ── Forgot Password (Better Auth) ─────────────────────────── */
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError('Masukkan email kamu'); return; }
    setLoading(true); setError('');
    try {
      await authClient.forgetPassword({
        email:       forgotEmail.trim(),
        redirectTo:  '/reset-password',
      });
      setSuccess(`Link reset password telah dikirim ke ${forgotEmail}. Cek inbox dan folder spam.`);
      setShowForgot(false);
      setForgotEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim link reset');
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--clr-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ink orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--clr-gold-subtle), transparent 70%)', filter: 'blur(60px)', animation: 'floatOrb 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, var(--clr-lavender-subtle), transparent 70%)', filter: 'blur(60px)', animation: 'floatOrb 18s ease-in-out infinite', animationDelay: '-7s' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, var(--clr-bg-muted), transparent 70%)', filter: 'blur(40px)', animation: 'floatOrb 22s ease-in-out infinite', animationDelay: '-14s' }} />
      </div>

      {/* Particles */}
      {PARTICLES.map((p, i) => <InkParticle key={i} {...p} />)}

      {/* Dot texture */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, var(--clr-border) 1px, transparent 0)', backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0 }} aria-hidden="true" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <Image
              src="/logo.png" alt="NEWGAME" width={72} height={72}
              style={{ borderRadius: 16, margin: '0 auto 16px', display: 'block', filter: 'drop-shadow(0 4px 20px var(--clr-gold-glow))' }}
            />
          </motion.div>
          <h1 style={{ fontFamily: 'var(--font-grotesk)', fontSize: 36, fontWeight: 800, color: 'var(--clr-text-primary)', letterSpacing: '-2px', lineHeight: 0.92, marginBottom: 8, textTransform: 'uppercase' }}>NEWGAME</h1>
          <p style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: 13, color: 'var(--clr-text-secondary)' }}>Portal Anggota</p>
        </div>

        {/* Main card */}
        <div style={{
          background: 'var(--clr-bg-surface)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--clr-border)',
          borderRadius: 20, padding: 32, position: 'relative', overflow: 'hidden',
          boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--clr-border-gold)',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--clr-gold), var(--clr-lavender), transparent)' }} aria-hidden="true" />

          {/* Tabs — 2 modes: Login | Daftar */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--clr-bg-muted)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {(['login', 'register'] as const).map(m => (
              <motion.button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); setNgLookupDone(false); setShowForgot(false); }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: '9px 8px', border: 'none',
                  borderRadius: 7,
                  background: mode === m ? 'var(--clr-gold)' : 'transparent',
                  color: mode === m ? 'var(--clr-ink)' : 'var(--clr-text-secondary)',
                  fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: mode === m ? '0 2px 12px var(--clr-gold-glow)' : 'none',
                }}
              >
                {m === 'login' ? 'Login' : 'Daftar'}
              </motion.button>
            ))}
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ padding: '11px 14px', borderRadius: 8, marginBottom: 16, background: 'var(--clr-danger-bg)', border: '1px solid var(--clr-danger-border)', color: 'var(--clr-danger)', fontFamily: 'var(--font-inter)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <i className="ri-error-warning-line" style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ padding: '11px 14px', borderRadius: 8, marginBottom: 16, background: 'var(--clr-success-bg)', border: '1px solid var(--clr-success-border)', color: 'var(--clr-success)', fontFamily: 'var(--font-inter)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <i className="ri-checkbox-circle-line" style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {/* ── LOGIN TAB (Email + Member ID + Google) ──────── */}
            {mode === 'login' && !showForgot && (
              <motion.div
                key="login-combined"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Login method toggle: Email / Member ID */}
                <div style={{ display: 'flex', gap: 3, background: 'var(--clr-bg-surface-elevated)', borderRadius: 8, padding: 3, marginBottom: 18, border: '1px solid var(--clr-border)' }}>
                  {([
                    { key: 'email' as LoginMethod, label: 'Email', icon: 'ri-mail-line' },
                    { key: 'member-id' as LoginMethod, label: 'Member ID', icon: 'ri-gamepad-line' },
                  ]).map(m => (
                    <button
                      key={m.key}
                      onClick={() => { setLoginMethod(m.key); setError(''); setNgLookupDone(false); }}
                      style={{
                        flex: 1, padding: '7px 6px', border: 'none',
                        borderRadius: 6, cursor: 'pointer',
                        background: loginMethod === m.key ? 'var(--clr-bg-muted)' : 'transparent',
                        color: loginMethod === m.key ? 'var(--clr-text-primary)' : 'var(--clr-text-secondary)',
                        fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <i className={m.icon} style={{ fontSize: 13 }} aria-hidden="true" />
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Email login form */}
                {loginMethod === 'email' && (
                  <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 16 }}>
                      <label className="label" htmlFor="login-email"><i className="ri-mail-line" style={{ marginRight: 6 }} aria-hidden="true" />Email</label>
                      <input id="login-email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" required autoComplete="email" />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label className="label" htmlFor="login-password"><i className="ri-lock-line" style={{ marginRight: 6 }} aria-hidden="true" />Password</label>
                      <input id="login-password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: 20 }}>
                      <button type="button" onClick={() => { setShowForgot(true); setError(''); setSuccess(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-gold-dim)', fontWeight: 600 }}>
                        Lupa Password?
                      </button>
                    </div>
                    <motion.button type="submit" className="btn btn-primary btn-depth w-full" disabled={loading} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
                      {loading ? <><span className="spinner spinner-sm" /> Masuk...</> : <><i className="ri-login-circle-line" style={{ fontSize: 17 }} aria-hidden="true" /> Masuk</>}
                    </motion.button>
                  </form>
                )}

                {/* Member ID login form */}
                {loginMethod === 'member-id' && (
                  <form onSubmit={handleNewgameIdLogin}>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--clr-info-bg)', border: '1px solid var(--clr-info-border)', marginBottom: 14 }}>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: 'var(--clr-info)', lineHeight: 1.6, display: 'flex', gap: 6 }}>
                        <i className="ri-information-line" style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }} />
                        Masukkan Member ID NEWGAME kamu. Contoh: NG11020125SF
                      </p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label className="label" htmlFor="ng-id"><i className="ri-id-card-line" style={{ marginRight: 6 }} aria-hidden="true" />Member ID</label>
                      <input
                        id="ng-id" type="text" className="input"
                        value={ngId}
                        onChange={e => setNgId(e.target.value.toUpperCase())}
                        placeholder="NG11020125SF" required autoComplete="username"
                        style={{ fontFamily: 'var(--font-grotesk)', letterSpacing: '1px', fontWeight: 600 }}
                      />
                    </div>
                    {/* Show masked email after lookup */}
                    {ngLookupDone && ngMaskedEmail && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--clr-success-bg)', border: '1px solid var(--clr-success-border)', marginBottom: 12, fontSize: 12, color: 'var(--clr-success)', fontFamily: 'var(--font-inter)' }}
                      >
                        <i className="ri-checkbox-circle-line" style={{ marginRight: 6 }} />
                        Akun ditemukan: {ngMaskedEmail}
                      </motion.div>
                    )}
                    <div style={{ marginBottom: 20 }}>
                      <label className="label" htmlFor="ng-password"><i className="ri-lock-line" style={{ marginRight: 6 }} aria-hidden="true" />Password</label>
                      <input id="ng-password" type="password" className="input" value={ngPassword} onChange={e => setNgPassword(e.target.value)} placeholder="Password akun kamu" required autoComplete="current-password" />
                    </div>
                    <motion.button type="submit" className="btn btn-primary btn-depth w-full" disabled={loading} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
                      {loading ? <><span className="spinner spinner-sm" /> Masuk...</> : <><i className="ri-gamepad-line" style={{ fontSize: 17 }} aria-hidden="true" /> Masuk</>}
                    </motion.button>
                  </form>
                )}

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '18px 0', color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)', fontSize: 12 }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--clr-border), transparent)' }} aria-hidden="true" />
                  <span>atau</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--clr-border), transparent)' }} aria-hidden="true" />
                </div>

                {/* Google */}
                <motion.button
                  onClick={handleGoogleLogin} disabled={loading}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', padding: '11px 20px',
                    background: 'var(--clr-bg-surface-elevated)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 14,
                    color: 'var(--clr-text-primary)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Lanjutkan dengan Google
                </motion.button>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD ────────────────────────────── */}
            {mode === 'login' && showForgot && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleForgotPassword}
              >
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--clr-info-bg)', border: '1px solid var(--clr-info-border)', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-info)', lineHeight: 1.6, display: 'flex', gap: 8 }}>
                    <i className="ri-key-line" style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }} />
                    Masukkan email yang terdaftar. Kami akan kirim link untuk reset password.
                  </p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="label" htmlFor="forgot-email"><i className="ri-mail-line" style={{ marginRight: 6 }} aria-hidden="true" />Email</label>
                  <input id="forgot-email" type="email" className="input" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="nama@email.com" required autoComplete="email" />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button type="submit" className="btn btn-primary btn-depth" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
                    {loading ? <><span className="spinner spinner-sm" /> Mengirim...</> : <><i className="ri-send-plane-line" style={{ fontSize: 15 }} aria-hidden="true" /> Kirim Link Reset</>}
                  </motion.button>
                  <button type="button" onClick={() => setShowForgot(false)}
                    style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--clr-border)', background: 'var(--clr-bg-surface-elevated)', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: 'var(--clr-text-secondary)' }}>
                    Batal
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── REGISTER TAB ──────────────────────────────── */}
            {mode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
              >
                {/* Registration info box */}
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--clr-info-bg)', border: '1px solid var(--clr-info-border)', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--clr-info)', lineHeight: 1.6, display: 'flex', gap: 8 }}>
                    <i className="ri-information-line" style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }} />
                    Kamu memerlukan <strong>Member ID</strong> dan <strong>Kode Akses</strong> dari admin untuk mendaftar.
                  </p>
                </div>

                {[
                  { label: 'Nama Lengkap',  icon: 'ri-user-line',    type: 'text',     id: 'reg-name',         val: regName,         set: setRegName,         ph: 'Nama kamu' },
                  { label: 'Member ID',     icon: 'ri-id-card-line', type: 'text',     id: 'reg-memberid',     val: regMemberId,     set: setRegMemberId,     ph: 'Contoh: NG11020125SF' },
                  { label: 'Kode Akses',    icon: 'ri-key-2-line',   type: 'password', id: 'reg-temppassword', val: regTempPassword, set: setRegTempPassword, ph: 'Dari admin' },
                  { label: 'Email',         icon: 'ri-mail-line',    type: 'email',    id: 'reg-email',        val: regEmail,        set: setRegEmail,        ph: 'nama@email.com' },
                  { label: 'Password Baru', icon: 'ri-lock-line',    type: 'password', id: 'reg-password',     val: regPassword,     set: setRegPassword,     ph: 'Min 6 karakter', min: 6 },
                ].map(({ label, icon, type, id, val, set, ph, min }: any, idx) => (
                  <div key={idx} style={{ marginBottom: idx === 4 ? 24 : 14 }}>
                    <label className="label" htmlFor={id}><i className={icon} style={{ marginRight: 6 }} aria-hidden="true" />{label}</label>
                    <input id={id} type={type} className="input" value={val} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value)} placeholder={ph} required minLength={min} autoComplete={type === 'password' ? 'new-password' : 'off'} />
                  </div>
                ))}
                <motion.button type="submit" className="btn btn-primary btn-depth w-full" disabled={loading} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
                  {loading ? <><span className="spinner spinner-sm" /> Mendaftar...</> : <><i className="ri-quill-pen-line" style={{ fontSize: 17 }} aria-hidden="true" /> Daftar</>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: 12, color: 'var(--clr-text-secondary)', opacity: 0.8 }}>
          Learn · Create · Play
        </p>
      </motion.div>
    </div>
  );
}
