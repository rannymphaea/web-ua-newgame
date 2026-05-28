'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

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

/* ════════════════════════════════════════════════════════════════
   LOGIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const [mode,    setMode]    = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [regName,     setRegName]     = useState('');
  const [regMemberId, setRegMemberId] = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regPassword, setRegPassword] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        setError('Please verify your email before logging in.');
        setLoading(false); return;
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const verifyRes = await fetch('/api/auth/verify-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: regMemberId, name: regName }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.message || 'Member verification failed');
      }
      const cred = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      await sendEmailVerification(cred.user);
      const idToken = await cred.user.getIdToken();
      api.setToken(idToken);
      await api.post('/auth/register', { name: regName, memberId: regMemberId });
      setSuccess('Registration successful! Please check your email for verification.');
      setMode('login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally { setLoading(false); }
  }

  async function handleGoogleLogin() {
    setLoading(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      api.setToken(idToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
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
          <h1 style={{ fontFamily: 'var(--font-pinyon)', fontSize: 48, fontWeight: 400, color: 'var(--clr-text-primary)', letterSpacing: 1, lineHeight: 1, marginBottom: 6 }}>NEWGAME</h1>
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

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--clr-bg-muted)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {(['login', 'register'] as const).map(m => (
              <motion.button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: '9px 12px', border: 'none',
                  borderRadius: 7,
                  background: mode === m ? 'var(--clr-gold)' : 'transparent',
                  color: mode === m ? 'var(--clr-ink)' : 'var(--clr-text-secondary)',
                  fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: mode === m ? '0 2px 12px var(--clr-gold-glow)' : 'none',
                }}
              >
                {m === 'login' ? 'Masuk' : 'Daftar'}
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
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
              >
                <div style={{ marginBottom: 16 }}>
                  <label className="label" htmlFor="login-email"><i className="ri-mail-line" style={{ marginRight: 6 }} aria-hidden="true" />Email</label>
                  <input id="login-email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" required autoComplete="email" />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label className="label" htmlFor="login-password"><i className="ri-lock-line" style={{ marginRight: 6 }} aria-hidden="true" />Password</label>
                  <input id="login-password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
                </div>
                <motion.button type="submit" className="btn btn-primary btn-depth w-full" disabled={loading} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
                  {loading ? <><span className="spinner spinner-sm" /> Masuk...</> : <><i className="ri-login-circle-line" style={{ fontSize: 17 }} aria-hidden="true" /> Masuk</>}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
              >
                {[
                  { label: 'Nama Lengkap', icon: 'ri-user-line',   type: 'text',     id: 'reg-name',     val: regName,     set: setRegName,     ph: 'Nama kamu' },
                  { label: 'Member ID',    icon: 'ri-id-card-line', type: 'text',     id: 'reg-memberid', val: regMemberId, set: setRegMemberId, ph: 'Contoh: NEWGAME-001' },
                  { label: 'Email',        icon: 'ri-mail-line',    type: 'email',    id: 'reg-email',    val: regEmail,    set: setRegEmail,    ph: 'nama@email.com' },
                  { label: 'Password',     icon: 'ri-lock-line',    type: 'password', id: 'reg-password', val: regPassword, set: setRegPassword, ph: 'Min 6 karakter', min: 6 },
                ].map(({ label, icon, type, id, val, set, ph, min }, idx) => (
                  <div key={idx} style={{ marginBottom: idx === 3 ? 24 : 14 }}>
                    <label className="label" htmlFor={id}><i className={icon} style={{ marginRight: 6 }} aria-hidden="true" />{label}</label>
                    <input id={id} type={type} className="input" value={val} onChange={e => set(e.target.value)} placeholder={ph} required minLength={min} autoComplete={type === 'password' ? 'new-password' : undefined} />
                  </div>
                ))}
                <motion.button type="submit" className="btn btn-primary btn-depth w-full" disabled={loading} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
                  {loading ? <><span className="spinner spinner-sm" /> Mendaftar...</> : <><i className="ri-quill-pen-line" style={{ fontSize: 17 }} aria-hidden="true" /> Daftar</>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0', color: 'var(--clr-text-secondary)', fontFamily: 'var(--font-inter)', fontSize: 12 }}>
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
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: 12, color: 'var(--clr-text-secondary)', opacity: 0.8 }}>
          Learn · Create · Play
        </p>
      </motion.div>
    </div>
  );
}
