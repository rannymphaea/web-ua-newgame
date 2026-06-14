'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function AdminBulkImportPage() {
  const [mode, setMode] = useState<'csv' | 'json'>('csv');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const CSV_TEMPLATE = `memberId,name,email,pillar,tempPassword\nNG11020001PG,Budi Santoso,budi@example.com,Game Logic,TempPass123!\nNG11020002GD,Ani Kusuma,ani@example.com,Game Design,TempPass456!`;
  const JSON_TEMPLATE = JSON.stringify([
    { memberId: 'NG11020001PG', name: 'Budi Santoso', email: 'budi@example.com', pillar: 'Game Logic', tempPassword: 'TempPass123!' },
  ], null, 2);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setContent(ev.target?.result as string || '');
    reader.readAsText(f);
  }

  async function handleImport() {
    if (!content.trim()) { setError('Masukkan data atau pilih file terlebih dahulu'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      let payload: object[];
      if (mode === 'json') {
        payload = JSON.parse(content);
      } else {
        // Parse CSV
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        payload = lines.slice(1).filter(Boolean).map(line => {
          const vals = line.split(',').map(v => v.trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
          return obj;
        });
      }
      const res = await api.post('/members/import', { members: payload }) as ImportResult;
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal import');
    } finally { setLoading(false); }
  }

  function downloadTemplate() {
    const data = mode === 'csv' ? CSV_TEMPLATE : JSON_TEMPLATE;
    const blob = new Blob([data], { type: mode === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `template-import.${mode}`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-display text-2xl">Bulk Import Anggota</h1>
          <p className="text-muted text-sm">Import banyak anggota sekaligus via CSV atau JSON</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
          <i className="ri-download-2-line" /> Download Template {mode.toUpperCase()}
        </button>
      </div>

      {/* Mode selector */}
      <div className="card mb-lg">
        <div className="flex gap-sm mb-lg">
          {(['csv', 'json'] as const).map(m => (
            <button
              key={m}
              className={`btn btn-sm btn-depth ${mode === m ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setMode(m); setContent(''); setFile(null); }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* File upload */}
        <div className="mb-md">
          <label className="label" htmlFor="bulk-file">Upload File</label>
          <input
            id="bulk-file"
            type="file"
            accept={mode === 'csv' ? '.csv' : '.json'}
            className="input"
            style={{ paddingTop: 8 }}
            onChange={handleFile}
          />
          {file && <p className="text-xs text-muted mt-xs"><i className="ri-file-line" /> {file.name}</p>}
        </div>

        <div className="mb-lg">
          <label className="label" htmlFor="bulk-text">Atau Paste Langsung</label>
          <textarea
            id="bulk-text"
            className="input textarea"
            rows={10}
            style={{ fontFamily: 'monospace', fontSize: 13 }}
            placeholder={mode === 'csv' ? CSV_TEMPLATE : JSON_TEMPLATE}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        {error && (
          <div className="alert alert-danger mb-md">
            <i className="ri-error-warning-line" /> {error}
          </div>
        )}

        <button className="btn btn-primary btn-depth" onClick={handleImport} disabled={loading}>
          {loading
            ? <><span className="spinner spinner-sm" /> Mengimport...</>
            : <><i className="ri-upload-2-line" /> Import Anggota</>
          }
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="card animate-slide-up">
          <h3 className="font-display text-lg mb-md">Hasil Import</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'var(--clr-success-bg)', border: '1px solid var(--clr-success-border)' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--clr-success)' }}>{result.success}</div>
              <div className="text-sm text-muted">Berhasil</div>
            </div>
            <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'var(--clr-danger-bg)', border: '1px solid var(--clr-danger-border)' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--clr-danger)' }}>{result.failed}</div>
              <div className="text-sm text-muted">Gagal</div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-sm">Error Detail:</p>
              <div style={{ maxHeight: 200, overflowY: 'auto', background: 'var(--clr-bg-muted)', borderRadius: 8, padding: 12 }}>
                {result.errors.map((e, i) => (
                  <div key={i} className="text-xs text-red mb-xs"><i className="ri-close-circle-line mr-xs" />{e}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
