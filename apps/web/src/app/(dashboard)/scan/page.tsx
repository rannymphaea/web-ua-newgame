'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';

export default function ScanPage() {
  const { activeEvent: _ae } = { activeEvent: null };
  void _ae;
  const { user: _u } = useAuthStore();
  void _u;
  const [state, setState] = useState<'loading'|'no-event'|'scanner'|'processing'|'success'|'error'|'already'>('loading');
  const [activeEvent, setActiveEvent] = useState<{id:string;name:string;xpReward?:number}|null>(null);
  const [result, setResult]   = useState<{eventName?:string;xpGained?:number;xpChange?:number;streakBonus?:number;totalXP?:number;level?:number;newStreak?:number}|null>(null);
  const [error, setError]     = useState('');
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef<{stop:()=>void}|null>(null);
  const readerRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkActiveEvent();
    return () => { stopScanner(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkActiveEvent() {
    setState('loading');
    try {
      const events = await api.get('/events?status=active&limit=1');
      const list = Array.isArray(events) ? events : (events as {events:unknown[]})?.events || [];
      if (list.length === 0) { setState('no-event'); return; }
      const ev = list[0] as {id:string;name:string;xpReward?:number};
      setActiveEvent(ev);
      try {
        const att = await api.get(`/attendance/check/${ev.id}`);
        if ((att as {attended:boolean})?.attended) { setState('already'); return; }
      } catch { /* not attended */ }
      setState('scanner');
      setTimeout(() => startScanner(), 300);
    } catch (err) {
      console.error(err);
      setState('no-event');
    }
  }

  async function startScanner() {
    if (typeof window === 'undefined') return;
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (scannerRef.current) { try { scannerRef.current.stop(); } catch { /* ignore */ } }
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner as unknown as {stop:()=>void};
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text: string) => { processQR(text); },
        () => {}
      );
    } catch (err) { console.error('Camera error:', err); }
  }

  function stopScanner() {
    if (scannerRef.current) {
      try { scannerRef.current.stop(); } catch { /* ignore */ }
      scannerRef.current = null;
    }
  }

  async function processQR(text: string) {
    if (state === 'processing') return;
    stopScanner();
    setState('processing');
    try {
      let tokenId = text;
      if (text.includes('token=')) {
        const url = new URL(text);
        tokenId = url.searchParams.get('token') || text;
      }
      if (!tokenId) throw new Error('Invalid QR code');
      const res = await api.post('/attendance/process', { tokenId, eventId: activeEvent?.id });
      setResult(res as typeof result);
      setState('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed';
      if (msg.includes('already')) { setState('already'); }
      else { setError(msg); setState('error'); }
    }
  }

  function handleManualToken() {
    if (!manualToken.trim()) return;
    processQR(manualToken.trim());
  }

  async function resetScanner() {
    setError('');
    setResult(null);
    await checkActiveEvent();
  }

  return (
    <div className="scan-page animate-fade-in">
      <div className="scan-container">

        {state === 'loading' && (
          <div className="card text-center scan-state-card">
            <div className="spinner mx-auto mb-md" />
            <p className="scan-desc">Memeriksa sesi absen...</p>
          </div>
        )}

        {state === 'no-event' && (
          <div className="card text-center scan-state-card animate-fade-in">
            <div className="state-icon bg-blue">
              <i className="ri-calendar-close-line" style={{fontSize:32,color:'var(--clr-info)'}} aria-hidden="true" />
            </div>
            <h2 className="scan-title">Belum Ada Event</h2>
            <p className="scan-desc mb-lg">Saat ini tidak ada event aktif yang memerlukan absensi.</p>
            <div style={{display:'flex',justifyContent:'center',marginBottom:24}}>
              <img src="/oc-cmd.svg" alt="OC" style={{height:100,opacity:0.8,filter:'drop-shadow(0 4px 12px var(--clr-border))'}} />
            </div>
            <button onClick={checkActiveEvent} className="btn btn-secondary w-full btn-depth" style={{padding:'12px'}}>
              <i className="ri-refresh-line" aria-hidden="true" /> Muat Ulang
            </button>
          </div>
        )}

        {state === 'scanner' && (
          <div className="card animate-fade-in" style={{padding:0,overflow:'hidden',border:'1px solid var(--clr-border-gold)'}}>
            <div className="scan-event-header">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className="pulse-dot" />
                <div>
                  <p style={{fontFamily:'var(--font-lora)',fontWeight:600,fontSize:16,color:'var(--clr-text-primary)'}}>{activeEvent?.name}</p>
                  <p style={{fontFamily:'var(--font-inter)',fontSize:11,color:'var(--clr-gold-dim)',display:'flex',alignItems:'center'}}>
                    <i className="ri-flashlight-fill" style={{fontSize:10,marginRight:3}} aria-hidden="true" />
                    +{activeEvent?.xpReward || 10} XP
                  </p>
                </div>
              </div>
            </div>
            <div className="scan-area">
              <div className="scan-reader-wrap">
                <div id="qr-reader" ref={readerRef} />
                <div className="scan-corner-v2 tl" /><div className="scan-corner-v2 tr" />
                <div className="scan-corner-v2 bl" /><div className="scan-corner-v2 br" />
                <div className="scan-line-v2" />
              </div>
              <p style={{fontFamily:'var(--font-inter)',fontSize:12,color:'var(--clr-text-secondary)',textAlign:'center',marginTop:16}}>
                Arahkan kamera ke QR Code
              </p>
            </div>
            <div style={{padding:'16px 20px',background:'var(--clr-bg-muted)',borderTop:'1px solid var(--clr-border)'}}>
              <details className="manual-token-details">
                <summary>Kamera bermasalah? Input token manual</summary>
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <input className="input" placeholder="Masukkan token..." value={manualToken} onChange={e => setManualToken(e.target.value)} />
                  <button className="btn btn-secondary" onClick={handleManualToken} aria-label="Submit token">
                    <i className="ri-send-plane-fill" aria-hidden="true" />
                  </button>
                </div>
              </details>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div className="card text-center scan-state-card">
            <div className="spinner mx-auto mb-md" style={{borderTopColor:'var(--clr-gold-dim)'}} />
            <h2 className="scan-title">Memproses...</h2>
            <p className="scan-desc">Mencatat kehadiran kamu</p>
          </div>
        )}

        {state === 'success' && result && (
          <div className="card text-center scan-state-card animate-slide-up" style={{border:'1px solid var(--clr-success-border)'}}>
            <div className="state-icon bg-green mb-md" style={{width:80,height:80}}>
              <i className="ri-check-line" style={{fontSize:48,color:'var(--clr-success)'}} aria-hidden="true" />
            </div>
            <h2 className="scan-title">Berhasil Hadir!</h2>
            <p className="scan-desc mb-lg">{result.eventName || activeEvent?.name}</p>
            <div className="xp-reward-box mb-lg">
              <p className="xp-label">XP Diterima</p>
              <p className="xp-value">+{result.xpGained || result.xpChange || 0}</p>
              {(result.streakBonus ?? 0) > 0 && (
                <p className="xp-streak">
                  <i className="ri-fire-fill" style={{marginRight:3}} aria-hidden="true" /> Bonus streak: +{result.streakBonus} XP
                </p>
              )}
            </div>
            <div className="stats-row mb-xl">
              <div><span className="stats-lbl">Total XP</span><span className="stats-val">{result.totalXP || '-'}</span></div>
              <div className="stats-div" />
              <div><span className="stats-lbl">Level</span><span className="stats-val">Lv.{result.level || '-'}</span></div>
              <div className="stats-div" />
              <div><span className="stats-lbl">Streak</span><span className="stats-val">{result.newStreak || '-'}</span></div>
            </div>
            <a href="/dashboard" className="btn btn-primary w-full btn-depth" style={{padding:12}}>Selesai</a>
          </div>
        )}

        {state === 'error' && (
          <div className="card text-center scan-state-card animate-slide-up" style={{border:'1px solid var(--clr-danger-border)'}}>
            <div className="state-icon bg-red mb-md" style={{width:80,height:80}}>
              <i className="ri-close-line" style={{fontSize:48,color:'var(--clr-danger)'}} aria-hidden="true" />
            </div>
            <h2 className="scan-title">Gagal</h2>
            <p style={{fontFamily:'var(--font-inter)',fontSize:14,color:'var(--clr-danger)',marginBottom:24}}>{error}</p>
            <button onClick={resetScanner} className="btn btn-secondary w-full btn-depth" style={{padding:12}}>Coba Lagi</button>
          </div>
        )}

        {state === 'already' && (
          <div className="card text-center scan-state-card animate-fade-in">
            <div className="state-icon bg-blue mb-md" style={{width:80,height:80}}>
              <i className="ri-information-line" style={{fontSize:40,color:'var(--clr-info)'}} aria-hidden="true" />
            </div>
            <h2 className="scan-title">Sudah Absen</h2>
            <p className="scan-desc mb-xl">Kamu sudah mencatat kehadiran untuk event ini.</p>
            <a href="/dashboard" className="btn btn-secondary w-full btn-depth" style={{padding:12}}>Kembali ke Dashboard</a>
          </div>
        )}
      </div>
    </div>
  );
}
