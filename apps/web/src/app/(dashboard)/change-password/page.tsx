'use client';
import { useState } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useAuthStore } from '@/lib/auth-store';
import { auth } from '@/lib/firebase';

export default function ChangePasswordPage() {
  const { user } = useAuthStore();
  void user;
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
    if (newPw.length < 6)   { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) throw new Error('Not authenticated');
      const cred = EmailAuthProvider.credential(firebaseUser.email, currentPw);
      await reauthenticateWithCredential(firebaseUser, cred);
      await updatePassword(firebaseUser, newPw);
      setSuccess('Password updated successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally { setLoading(false); }
  }

  return (
    <div className="animate-fade-in" style={{maxWidth:480}}>
      <h1 className="font-display text-2xl mb-lg">Change Password</h1>
      <div className="card">
        {error   && (
          <div className="mb-md" style={{padding:'12px 16px',borderRadius:'var(--radius-md)',background:'var(--clr-danger-bg)',border:'1px solid var(--clr-danger-border)',color:'var(--clr-danger)',fontSize:13,display:'flex',alignItems:'center',gap:8}}>
            <i className="ri-error-warning-fill" style={{fontSize:15}} aria-hidden="true" />{error}
          </div>
        )}
        {success && (
          <div className="mb-md" style={{padding:'12px 16px',borderRadius:'var(--radius-md)',background:'var(--clr-success-bg)',border:'1px solid var(--clr-success-border)',color:'var(--clr-success)',fontSize:13,display:'flex',alignItems:'center',gap:8}}>
            <i className="ri-checkbox-circle-fill" style={{fontSize:15}} aria-hidden="true" />{success}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <label className="label" htmlFor="cp-current">Current Password</label>
            <input id="cp-current" type="password" className="input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required autoComplete="current-password" />
          </div>
          <div className="mb-md">
            <label className="label" htmlFor="cp-new">New Password</label>
            <input id="cp-new" type="password" className="input" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} autoComplete="new-password" />
          </div>
          <div className="mb-lg">
            <label className="label" htmlFor="cp-confirm">Confirm New Password</label>
            <input id="cp-confirm" type="password" className="input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required minLength={6} autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-depth" disabled={loading} style={{padding:'12px'}}>
            {loading
              ? <><span className="spinner spinner-sm" /> Memperbarui...</>
              : <><i className="ri-lock-password-line" style={{fontSize:16}} aria-hidden="true" /> Update Password</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
