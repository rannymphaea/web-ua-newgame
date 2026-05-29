'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const CATEGORIES = [
  { value: 'news',     label: 'Berita'   },
  { value: 'blog',     label: 'Blog'     },
  { value: 'event',    label: 'Event'    },
  { value: 'tutorial', label: 'Tutorial' },
];
const TUTORIAL_SUBS = [
  { value: 'game-logic',  label: 'Game Logic'  },
  { value: 'game-design', label: 'Game Design' },
  { value: 'game-sound',  label: 'Game Sound'  },
];

interface PostForm {
  title: string; content: string; excerpt: string; category: string;
  tutorialCategory: string; youtubeUrl: string; thumbnail: string;
  tags: string; status: string; featured: boolean; priority: string; eventDate: string;
}

interface Post {
  id: string;
  title: string;
  category: string;
  status: string;
  views?: number;
  tutorialCategory?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  youtubeUrl?: string;
  tags?: string[];
  featured?: boolean;
  priority?: number;
  eventDate?: { seconds?: number } | string;
}

const EMPTY_FORM: PostForm = {
  title:'', content:'', excerpt:'', category:'news', tutorialCategory:'',
  youtubeUrl:'', thumbnail:'', tags:'', status:'draft', featured:false, priority:'0', eventDate:'',
};

export default function AdminNewsPage() {
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<Post|null>(null);
  const [filter, setFilter]         = useState('');
  const [form, setForm]             = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { loadPosts(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPosts() {
    setLoading(true);
    try {
      const url = `/news${filter ? `?category=${filter}` : ''}`;
      const res = await api.get(url);
      setPosts(Array.isArray(res) ? res as Post[] : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  function openEditor(post?: Post) {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title || '', content: post.content || '', excerpt: post.excerpt || '',
        category: post.category || 'news', tutorialCategory: post.tutorialCategory || '',
        youtubeUrl: post.youtubeUrl || '', thumbnail: post.thumbnail || '',
        tags: (post.tags || []).join(', '), status: post.status || 'draft',
        featured: post.featured || false, priority: String(post.priority || 0),
        eventDate: post.eventDate
          ? (() => {
              const d = typeof post.eventDate === 'object' && (post.eventDate as {seconds?:number}).seconds
                ? new Date((post.eventDate as {seconds:number}).seconds * 1000)
                : new Date(post.eventDate as string);
              return d.toISOString().split('T')[0];
            })()
          : '',
      });
    } else {
      setEditingPost(null);
      setForm(EMPTY_FORM);
    }
    setShowEditor(true);
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const data = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        priority: parseInt(form.priority),
        tutorialCategory: form.category === 'tutorial' ? form.tutorialCategory : undefined,
        youtubeUrl: form.youtubeUrl || undefined,
        eventDate:  form.eventDate  || undefined,
      };
      if (editingPost) { await api.patch(`/news/${editingPost.id}`, data); }
      else             { await api.post('/news', data); }
      setShowEditor(false); loadPosts();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function archivePost(id: string) {
    if (!confirm('Archive this post?')) return;
    try { await api.patch(`/news/${id}/archive`, {}); loadPosts(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
  }

  async function restorePost(id: string) {
    try { await api.patch(`/news/${id}/restore`, {}); loadPosts(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
  }

  async function deletePost(id: string) {
    if (!confirm('Permanently delete this post?')) return;
    try { await api.delete(`/news/${id}`); loadPosts(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error'); }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{flexWrap:'wrap',gap:12}}>
        <h1 className="font-display text-2xl">Manage News &amp; Tutorials</h1>
        <button className="btn btn-primary btn-sm btn-depth" onClick={() => openEditor()}>
          <i className="ri-add-line" aria-hidden="true" /> New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-sm mb-lg" style={{flexWrap:'wrap'}}>
        <button className={`btn btn-sm${!filter?' btn-primary':' btn-secondary'}`} onClick={() => setFilter('')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c.value} className={`btn btn-sm${filter===c.value?' btn-primary':' btn-secondary'}`} onClick={() => setFilter(c.value)}>{c.label}</button>
        ))}
      </div>

      {/* Editor */}
      {showEditor && (
        <div className="card mb-lg animate-slide-up" style={{border:'1px solid var(--clr-danger-border)'}}>
          <h3 className="font-display text-lg mb-md">{editingPost ? 'Edit Post' : 'Create New Post'}</h3>
          <form onSubmit={savePost}>
            <div className="grid-2 mb-md">
              <div>
                <label className="label" htmlFor="pf-title">Title *</label>
                <input id="pf-title" className="input" value={form.title} onChange={e => setForm({...form,title:e.target.value})} required />
              </div>
              <div>
                <label className="label" htmlFor="pf-cat">Category *</label>
                <select id="pf-cat" className="input select" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {form.category === 'tutorial' && (
              <div className="grid-2 mb-md">
                <div>
                  <label className="label" htmlFor="pf-tcat">Tutorial Category *</label>
                  <select id="pf-tcat" className="input select" value={form.tutorialCategory} onChange={e => setForm({...form,tutorialCategory:e.target.value})} required>
                    <option value="">Select...</option>
                    {TUTORIAL_SUBS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="pf-yturl">YouTube URL *</label>
                  <input id="pf-yturl" className="input" value={form.youtubeUrl} onChange={e => setForm({...form,youtubeUrl:e.target.value})} placeholder="https://youtube.com/watch?v=..." required />
                </div>
              </div>
            )}

            {form.category !== 'tutorial' && (
              <div className="mb-md">
                <label className="label" htmlFor="pf-yt">YouTube URL (Optional)</label>
                <input id="pf-yt" className="input" value={form.youtubeUrl} onChange={e => setForm({...form,youtubeUrl:e.target.value})} placeholder="https://youtube.com/watch?v=..." />
              </div>
            )}

            {form.category === 'event' && (
              <div className="mb-md">
                <label className="label" htmlFor="pf-evdt">Event Date</label>
                <input id="pf-evdt" type="date" className="input" value={form.eventDate} onChange={e => setForm({...form,eventDate:e.target.value})} />
              </div>
            )}

            <div className="mb-md">
              <label className="label" htmlFor="pf-content">Content *</label>
              <textarea id="pf-content" className="input textarea" rows={8} value={form.content} onChange={e => setForm({...form,content:e.target.value})} required />
            </div>
            <div className="mb-md">
              <label className="label" htmlFor="pf-excerpt">Excerpt</label>
              <input id="pf-excerpt" className="input" value={form.excerpt} onChange={e => setForm({...form,excerpt:e.target.value})} placeholder="Short summary..." />
            </div>
            <div className="mb-md">
              <label className="label" htmlFor="pf-thumb">Thumbnail URL</label>
              <input id="pf-thumb" className="input" value={form.thumbnail} onChange={e => setForm({...form,thumbnail:e.target.value})} placeholder="https://..." />
            </div>
            <div className="grid-2 mb-md">
              <div>
                <label className="label" htmlFor="pf-tags">Tags (comma separated)</label>
                <input id="pf-tags" className="input" value={form.tags} onChange={e => setForm({...form,tags:e.target.value})} placeholder="unity, tutorial, beginner" />
              </div>
              <div>
                <label className="label" htmlFor="pf-prio">Priority (higher = first)</label>
                <input id="pf-prio" type="number" className="input" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})} />
              </div>
            </div>
            <div className="flex gap-md items-center mb-lg">
              <label className="flex items-center gap-sm" style={{cursor:'pointer'}}>
                <input type="checkbox" checked={form.status === 'published'} onChange={e => setForm({...form,status:e.target.checked?'published':'draft'})} />
                <span className="text-sm">Publish immediately</span>
              </label>
              <label className="flex items-center gap-sm" style={{cursor:'pointer'}}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm({...form,featured:e.target.checked})} />
                <span className="text-sm">Featured (show in slider)</span>
              </label>
            </div>
            <div className="flex gap-sm">
              <button type="submit" className="btn btn-primary btn-sm btn-depth" disabled={saving}>
                {saving ? <><span className="spinner spinner-sm" /> Saving...</> : (editingPost ? 'Update' : 'Create')}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowEditor(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="card">{[1,2,3].map(i => <div key={i} className="skeleton mb-md" style={{height:50}} />)}</div>
      ) : (
        <div className="card" style={{padding:0}}>
          <table className="table">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td>
                    <span className="font-semibold text-sm">{p.title}</span>
                    {p.tutorialCategory && <span className="text-xs text-muted"> ({p.tutorialCategory})</span>}
                  </td>
                  <td><span className={`badge badge-${p.category}`}>{p.category}</span></td>
                  <td><span className={`badge ${p.status==='published'?'badge-green':p.status==='archived'?'badge-gray':'badge-yellow'}`}>{p.status}</span></td>
                  <td className="text-muted text-sm">{p.views || 0}</td>
                  <td style={{textAlign:'right'}}>
                    <div className="flex gap-xs" style={{justifyContent:'flex-end'}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditor(p)}>Edit</button>
                      {p.status === 'archived'
                        ? <button className="btn btn-ghost btn-sm" onClick={() => restorePost(p.id)}>Restore</button>
                        : <button className="btn btn-ghost btn-sm" onClick={() => archivePost(p.id)}>Archive</button>
                      }
                      <button className="btn btn-ghost btn-sm text-red" onClick={() => deletePost(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={5} className="text-center text-muted p-lg">No posts</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
