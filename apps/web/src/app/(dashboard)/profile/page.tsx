'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';

interface UserData {
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  division?: string;
  photoURL?: string;
  xpCache?: number;
  streak?: number;
  attendanceCount?: number;
  level?: number;
}

export default function ProfilePage() {
  const { userData, user } = useAuthStore();
  void user;
  const [username,    setUsername]    = useState((userData as UserData)?.username || '');
  const [displayName, setDisplayName] = useState((userData as UserData)?.name || '');
  const [photoURL,    setPhotoURL]    = useState((userData as UserData)?.photoURL || '');
  const [saving,      setSaving]      = useState(false);
  const [message,     setMessage]     = useState('');
  const [isSuccess,   setIsSuccess]   = useState(false);
  const [darkMode,    setDarkMode]    = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    if (saved) document.documentElement.classList.add('dark');
  }, []);

  function toggleDarkMode() {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  }

  async function handleSave() {
    if (!displayName.trim()) {
      setMessage('Nama lengkap wajib diisi.');
      setIsSuccess(false);
      return;
    }
    if (username && !/^[a-z0-9_.-]{3,30}$/.test(username)) {
      setMessage('Username hanya boleh huruf kecil, angka, _ . - (3-30 karakter).');
      setIsSuccess(false);
      return;
    }
    setSaving(true); setMessage('');
    try {
      await api.patch('/users/profile', { displayName: displayName.trim(), username: username?.trim() || undefined, photoURL });
      setMessage('Profil berhasil disimpan!');
      setIsSuccess(true);
    } catch (err: unknown) {
      setMessage('Gagal menyimpan: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsSuccess(false);
    } finally { setSaving(false); }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setMessage('Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
      setIsSuccess(false);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Ukuran foto maksimal 2MB.');
      setIsSuccess(false);
      return;
    }
    setSaving(true); setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('usage', 'avatar');
      const res = await api.upload('/media/profile/upload', formData) as { url?: string };
      if (res?.url) {
        setPhotoURL(res.url);
        await api.patch('/users/profile', { photoURL: res.url });
        setMessage('Foto profil berhasil diubah!');
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      setMessage('Gagal upload foto: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsSuccess(false);
    } finally {
      setSaving(false);
    }
  }

  const initials = (displayName || 'U').charAt(0).toUpperCase();
  const ud = userData as UserData | null;

  return (
    <div className="animate-fade-in">

      {/* HEADER */}
      <div className="profile-header mb-xl">
        <div>
          <p className="profile-eyebrow">
            <i className="ri-user-settings-fill" style={{fontSize:11,marginRight:5,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
            Akun Saya
          </p>
          <h1 className="profile-title">Edit Profil</h1>
          <p className="profile-sub">Ubah informasi dan tampilan profil kamu</p>
        </div>
        <div className="profile-role-badge">
          <i className="ri-shield-check-fill" style={{fontSize:13,marginRight:5,color:'var(--clr-gold-dim)'}} aria-hidden="true" />
          {ud?.role || 'member'}
        </div>
        <button onClick={toggleDarkMode} className="btn" style={{padding:'6px 12px',fontSize:12,background:'var(--clr-bg-surface-elevated)',border:'1px solid var(--clr-border)'}}>
          {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      <div className="profile-layout">

        {/* LEFT: Avatar */}
        <div className="profile-avatar-card card">
          <div className="avatar-wrap">
            {photoURL
              ? <img src={photoURL} alt="Avatar" className="avatar-img" />
              : <div className="avatar-placeholder">{initials}</div>
            }
            {/* Hidden file input — triggered via ref on button click */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
              aria-hidden="true"
              tabIndex={-1}
            />
            <button
              type="button"
              className="avatar-change-btn"
              title="Ganti Foto Profil"
              aria-label="Ganti foto profil"
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
            >
              {saving
                ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                : <i className="ri-camera-fill" style={{fontSize:14,color:'var(--clr-text-primary)'}} aria-hidden="true" />
              }
            </button>
          </div>
          <h3 className="avatar-name">{displayName || 'Nama Lengkap'}</h3>
          <p className="avatar-username">@{username || 'username'}</p>
          {ud?.division && (
            <span className="avatar-division-badge">
              <i className="ri-building-2-line" style={{fontSize:10,marginRight:4}} aria-hidden="true" />
              {ud.division}
            </span>
          )}
          <div className="avatar-stats">
            <div className="avatar-stat">
              <span className="avatar-stat-val" style={{color:'var(--clr-gold-dim)'}}>{ud?.xpCache || 0}</span>
              <span className="avatar-stat-label">XP</span>
            </div>
            <div className="avatar-stat-divider" />
            <div className="avatar-stat">
              <span className="avatar-stat-val" style={{color:'var(--clr-lavender)'}}>Lv.{ud?.level || 1}</span>
              <span className="avatar-stat-label">Level</span>
            </div>
            <div className="avatar-stat-divider" />
            <div className="avatar-stat">
              <span className="avatar-stat-val" style={{color:'var(--clr-warning)'}}>{ud?.streak || 0}</span>
              <span className="avatar-stat-label">Streak</span>
            </div>
          </div>
          <p className="avatar-hint">
            <i className="ri-information-line" style={{fontSize:10,marginRight:4}} aria-hidden="true" />
            Max 2MB, JPG/PNG
          </p>
        </div>

        {/* RIGHT: Form */}
        <div className="card profile-form-card">
          <h3 style={{fontFamily:'var(--font-lora)',fontSize:16,fontWeight:600,color:'var(--clr-text-primary)',marginBottom:20}}>
            Informasi Profil
          </h3>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-name">
              <i className="ri-user-3-line" style={{fontSize:11,marginRight:4}} aria-hidden="true" /> Nama Lengkap
            </label>
            <input id="prof-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="input" placeholder="Nama lengkap kamu" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-username">
              <i className="ri-at-line" style={{fontSize:11,marginRight:4}} aria-hidden="true" /> Username
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">@</span>
              <input id="prof-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="input input-prefixed" placeholder="username123" />
            </div>
            <p className="form-hint">Tampil di sidebar dan leaderboard. Opsional.</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-email">
              <i className="ri-mail-line" style={{fontSize:11,marginRight:4}} aria-hidden="true" /> Email
            </label>
            <input id="prof-email" type="text" value={ud?.email || ''} disabled className="input input-disabled" />
            <p className="form-hint"><i className="ri-lock-line" style={{fontSize:10,marginRight:3}} aria-hidden="true" /> Email tidak bisa diubah</p>
          </div>

          <div className="form-group" style={{marginBottom:24}}>
            <label className="form-label" htmlFor="prof-role">
              <i className="ri-shield-star-line" style={{fontSize:11,marginRight:4}} aria-hidden="true" /> Role
            </label>
            <input id="prof-role" type="text" value={ud?.role || ''} disabled className="input input-disabled" style={{textTransform:'capitalize'}} />
          </div>

          {message && (
            <div className={`form-message ${isSuccess ? 'success' : 'error'}`}>
              <i className={`${isSuccess ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}`} style={{fontSize:14}} aria-hidden="true" />
              {message}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-depth" style={{padding:'11px 28px'}}>
            {saving
              ? <><span className="spinner spinner-sm" /> Menyimpan...</>
              : <><i className="ri-save-3-line" style={{fontSize:15}} aria-hidden="true" /> Simpan Perubahan</>
            }
          </button>
        </div>
      </div>

      <style>{`
        .profile-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; }
        .profile-eyebrow { font-family:var(--font-inter); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--clr-text-secondary); margin-bottom:6px; display:flex; align-items:center; }
        .profile-title { font-family:var(--font-lora); font-size:clamp(22px,3vw,28px); font-weight:700; color:var(--clr-text-primary); margin-bottom:4px; line-height:1.1; }
        .profile-sub { font-family:var(--font-cormorant); font-size:15px; color:var(--clr-text-secondary); font-style:italic; }
        .profile-role-badge { display:inline-flex; align-items:center; font-family:var(--font-inter); font-size:12px; font-weight:600; text-transform:capitalize; background:var(--clr-gold-subtle); border:1px solid var(--clr-border-gold); color:var(--clr-gold-dim); padding:6px 14px; border-radius:var(--radius-full); }
        .profile-layout { display:grid; grid-template-columns:260px 1fr; gap:20px; align-items:start; }
        .profile-avatar-card { text-align:center; padding:28px 20px; position:sticky; top:calc(var(--accent-bar-height) + var(--topbar-height) + 16px); }
        .avatar-wrap { position:relative; width:90px; margin:0 auto 14px; }
        .avatar-img,.avatar-placeholder { width:90px; height:90px; border-radius:50%; }
        .avatar-img { object-fit:cover; border:3px solid var(--clr-border-gold); box-shadow:0 4px 16px var(--clr-gold-glow); }
        .avatar-placeholder { background:linear-gradient(135deg,var(--clr-gold),var(--clr-lavender)); display:flex; align-items:center; justify-content:center; font-family:var(--font-lora); font-size:32px; font-weight:700; color:var(--clr-ink); box-shadow:0 4px 16px var(--clr-gold-glow); }
        .avatar-change-btn { position:absolute; bottom:2px; right:2px; width:28px; height:28px; border-radius:50%; background:var(--clr-bg-surface-elevated); border:2px solid var(--clr-border-gold); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease !important; box-shadow:var(--shadow-sm); }
        .avatar-change-btn:hover { background:var(--clr-gold-subtle); transform:scale(1.08); }
        .avatar-name { font-family:var(--font-lora); font-size:16px; font-weight:600; color:var(--clr-text-primary); margin-bottom:3px; }
        .avatar-username { font-family:var(--font-inter); font-size:12px; color:var(--clr-text-secondary); margin-bottom:10px; }
        .avatar-division-badge { display:inline-flex; align-items:center; font-family:var(--font-inter); font-size:10px; font-weight:600; color:var(--clr-lavender); background:var(--clr-lavender-subtle); border:1px solid rgba(185,166,206,0.2); padding:3px 10px; border-radius:20px; margin-bottom:16px; text-transform:uppercase; letter-spacing:0.5px; }
        .avatar-stats { display:flex; align-items:center; gap:0; background:var(--clr-bg-muted); border:1px solid var(--clr-border); border-radius:10px; padding:12px 8px; margin-bottom:14px; }
        .avatar-stat { flex:1; text-align:center; }
        .avatar-stat-val { display:block; font-family:var(--font-lora); font-size:18px; font-weight:700; line-height:1; margin-bottom:3px; }
        .avatar-stat-label { display:block; font-family:var(--font-inter); font-size:9px; color:var(--clr-text-secondary); text-transform:uppercase; letter-spacing:0.8px; }
        .avatar-stat-divider { width:1px; height:32px; background:var(--clr-border); }
        .avatar-hint { font-family:var(--font-inter); font-size:10px; color:var(--clr-text-secondary); display:flex; align-items:center; justify-content:center; }
        .profile-form-card { padding:24px; }
        .form-group { margin-bottom:18px; }
        .form-label { display:flex; align-items:center; margin-bottom:7px; font-family:var(--font-inter); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:var(--clr-text-secondary); }
        .input-with-prefix { display:flex; align-items:center; border:1px solid var(--clr-border); border-radius:var(--radius-md); overflow:hidden; background:var(--clr-bg-surface-elevated); transition:border-color 0.2s ease, box-shadow 0.2s ease !important; }
        .input-with-prefix:focus-within { border-color:var(--clr-border-gold); box-shadow:0 0 0 3px var(--clr-gold-glow); }
        .input-prefix { padding:12px 12px 12px 14px; font-family:var(--font-inter); font-size:14px; color:var(--clr-text-secondary); background:var(--clr-bg-muted); border-right:1px solid var(--clr-border); flex-shrink:0; }
        .input-prefixed { border:none !important; border-radius:0 !important; box-shadow:none !important; background:transparent !important; }
        .input-prefixed:focus { box-shadow:none !important; border:none !important; }
        .input-disabled { background:var(--clr-bg-muted) !important; color:var(--clr-text-secondary) !important; cursor:not-allowed; }
        .form-hint { margin-top:5px; font-family:var(--font-inter); font-size:10.5px; color:var(--clr-text-secondary); display:flex; align-items:center; }
        .form-message { display:flex; align-items:center; gap:8px; padding:11px 16px; border-radius:10px; font-family:var(--font-inter); font-size:13px; font-weight:500; margin-bottom:16px; }
        .form-message.success { background:var(--clr-success-bg); border:1px solid var(--clr-success-border); color:var(--clr-success); }
        .form-message.error { background:var(--clr-danger-bg); border:1px solid var(--clr-danger-border); color:var(--clr-danger); }
        @media (max-width:900px) { .profile-layout { grid-template-columns:1fr; } .profile-avatar-card { position:static; } }
      `}</style>
    </div>
  );
}
