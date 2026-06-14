'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

interface ProfileEditForm {
  bio: string;
  github: string;
  linkedin: string;
  skills: string;
}

interface ProfileEditModalProps {
  onClose: () => void;
  onSaved: () => void;
  initialData?: Partial<ProfileEditForm>;
}

export default function ProfileEditModal({ onClose, onSaved, initialData }: ProfileEditModalProps) {
  const [form, setForm] = useState<ProfileEditForm>({
    bio: initialData?.bio || '',
    github: initialData?.github || '',
    linkedin: initialData?.linkedin || '',
    skills: initialData?.skills || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch('/auth/me', {
        bio: form.bio,
        github: form.github,
        linkedin: form.linkedin,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card animate-slide-up"
        style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-lg">
          <h2 className="font-display text-xl">Edit Profil</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="mb-md">
            <label className="label" htmlFor="pf-bio">Bio</label>
            <textarea
              id="pf-bio"
              className="input textarea"
              rows={3}
              placeholder="Ceritakan tentang dirimu..."
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              maxLength={300}
            />
            <span className="text-xs text-muted">{form.bio.length}/300</span>
          </div>

          <div className="mb-md">
            <label className="label" htmlFor="pf-github">
              <i className="ri-github-line mr-xs" /> GitHub
            </label>
            <input
              id="pf-github"
              className="input"
              type="url"
              placeholder="https://github.com/username"
              value={form.github}
              onChange={e => setForm({ ...form, github: e.target.value })}
            />
          </div>

          <div className="mb-md">
            <label className="label" htmlFor="pf-linkedin">
              <i className="ri-linkedin-line mr-xs" /> LinkedIn
            </label>
            <input
              id="pf-linkedin"
              className="input"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={form.linkedin}
              onChange={e => setForm({ ...form, linkedin: e.target.value })}
            />
          </div>

          <div className="mb-lg">
            <label className="label" htmlFor="pf-skills">
              <i className="ri-code-line mr-xs" /> Skills
              <span className="text-muted text-xs font-normal"> (pisah koma)</span>
            </label>
            <input
              id="pf-skills"
              className="input"
              placeholder="Unity, C#, Blender, Figma"
              value={form.skills}
              onChange={e => setForm({ ...form, skills: e.target.value })}
            />
          </div>

          {error && (
            <div className="alert alert-danger mb-md">
              <i className="ri-error-warning-line" /> {error}
            </div>
          )}

          <div className="flex gap-sm">
            <button type="submit" className="btn btn-primary btn-depth" disabled={saving}>
              {saving ? <><span className="spinner spinner-sm" /> Menyimpan...</> : 'Simpan Perubahan'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
