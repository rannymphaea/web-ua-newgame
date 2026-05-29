'use client';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  altText?: string;
  usage?: string;
  size?: number;
}

const USAGES = ['logo','thumbnail','banner','avatar','content','other'];

export default function AdminMediaPage() {
  const [media, setMedia]       = useState<MediaItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadMedia(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadMedia() {
    setLoading(true);
    try {
      const url = `/media${filter ? `?usage=${filter}` : ''}`;
      const res = await api.get(url);
      setMedia(Array.isArray(res) ? res as MediaItem[] : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await api.post('/media/upload', {
          data: base64, filename: file.name, mimeType: file.type,
          usage: 'content', altText: file.name,
        });
        loadMedia();
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function deleteMedia(id: string) {
    if (!confirm('Delete this media?')) return;
    try { await api.delete(`/media/${id}`); loadMedia(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    alert('URL copied!');
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{flexWrap:'wrap',gap:12}}>
        <h1 className="font-display text-2xl">Media Gallery</h1>
        <div className="flex gap-sm items-center">
          <input ref={fileRef} type="file" accept="image/*,.gif" onChange={handleUpload} style={{display:'none'}} id="media-upload" aria-label="Upload image" />
          <label htmlFor="media-upload" className="btn btn-primary btn-sm btn-depth" style={{cursor:'pointer'}}>
            {uploading
              ? <><span className="spinner spinner-sm" /> Uploading...</>
              : <><i className="ri-upload-cloud-2-line" aria-hidden="true" /> Upload Image</>
            }
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-sm mb-lg" style={{flexWrap:'wrap'}}>
        <button className={`btn btn-sm${!filter?' btn-primary':' btn-secondary'}`} onClick={() => setFilter('')}>All</button>
        {USAGES.map(u => (
          <button key={u} className={`btn btn-sm${filter===u?' btn-primary':' btn-secondary'}`} onClick={() => setFilter(u)}>{u}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid-cards">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{height:200,borderRadius:16}} />)}</div>
      ) : media.length === 0 ? (
        <div className="card text-center p-xl">
          <i className="ri-image-2-line" style={{fontSize:48,color:'var(--clr-text-secondary)',marginBottom:12,display:'block'}} aria-hidden="true" />
          <p className="text-muted">No media uploaded yet. Click &quot;Upload Image&quot; to add images, logos, or GIFs.</p>
        </div>
      ) : (
        <div className="media-grid">
          {media.map(m => (
            <div key={m.id} className="media-item card" style={{padding:0,overflow:'hidden'}}>
              <div className="media-preview">
                <img src={m.url} alt={m.altText || m.filename} loading="lazy" />
              </div>
              <div className="p-sm">
                <p className="text-xs font-semibold truncate">{m.filename}</p>
                <div className="flex justify-between items-center mt-xs">
                  <span className="badge badge-gray">{m.usage}</span>
                  <span className="text-xs text-muted">{((m.size || 0)/1024).toFixed(0)}KB</span>
                </div>
                <div className="flex gap-xs mt-sm">
                  <button className="btn btn-ghost btn-sm flex-1" onClick={() => copyUrl(m.url)}>
                    <i className="ri-clipboard-line" aria-hidden="true" /> Copy
                  </button>
                  <button className="btn btn-ghost btn-sm text-red" onClick={() => deleteMedia(m.id)} aria-label={`Delete ${m.filename}`}>
                    <i className="ri-delete-bin-line" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .media-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr)); gap:var(--space-md); }
        .media-preview { height:150px; overflow:hidden; background:var(--clr-bg-secondary); }
        .media-preview img { width:100%; height:100%; object-fit:cover; transition:transform 0.3s ease !important; }
        .media-item:hover .media-preview img { transform:scale(1.05); }
      `}</style>
    </div>
  );
}
