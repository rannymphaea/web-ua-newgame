// DO NOT EDIT - Web Audio API synthesizer. Mengubah nilai frekuensi/gain dapat merusak kualitas suara.
'use client';
import { useEffect, useRef, useCallback } from 'react';

// Kalimba scale frequencies C5 → A6
const SCALE = [523.25, 659.25, 783.99, 880.00, 1046.50, 1318.51, 1567.98, 1760.00];

interface AudioRefs {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  compressor: DynamicsCompressorNode | null;
  delay: DelayNode | null;
  feedback: GainNode | null;
  wetGain: GainNode | null;
  unlocked: boolean;
}

// ── Audio graph init — ONLY called inside a gesture handler ──────────────────
function initAudioGraph(refs: AudioRefs): AudioContext {
  if (refs.ctx) return refs.ctx;

  const Ctx = window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();

  // Expose for external resume (SoundToggle, etc.)
  (window as unknown as Record<string, unknown>).__audioCtx = ctx;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -15;
  compressor.knee.value      = 5;
  compressor.ratio.value     = 4;
  compressor.attack.value    = 0.002;
  compressor.release.value   = 0.1;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.6;

  const delay    = ctx.createDelay(1.0);
  delay.delayTime.value = 0.15;

  const feedback = ctx.createGain();
  feedback.gain.value = 0.15;

  const wetGain  = ctx.createGain();
  wetGain.gain.value = 0.15;

  masterGain.connect(compressor);
  compressor.connect(ctx.destination);
  masterGain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(compressor);

  refs.ctx        = ctx;
  refs.masterGain = masterGain;
  refs.compressor = compressor;
  refs.delay      = delay;
  refs.feedback   = feedback;
  refs.wetGain    = wetGain;
  return ctx;
}

// ── Gesture-unlock: init + resume inside the SAME gesture tick ───────────────
// FIX MOBILE: AudioContext must be created AND resumed in one synchronous
// gesture callstack. Separating them (create on load, resume on touch)
// fails on iOS Safari & Chrome Android.
async function gestureUnlock(refs: AudioRefs): Promise<void> {
  if (refs.unlocked) return;
  try {
    const ctx = initAudioGraph(refs);        // create inside gesture ✓
    if (ctx.state === 'suspended') {
      await ctx.resume();                    // resume inside same gesture ✓
    }
    refs.unlocked = true;
  } catch (e) {
    console.warn('[Kalimba] AudioContext unlock failed:', e);
  }
}

export function useKalimba(enabled: boolean) {
  const refs = useRef<AudioRefs>({
    ctx: null, masterGain: null, compressor: null,
    delay: null, feedback: null, wetGain: null, unlocked: false,
  });

  // ── Register gesture listeners ────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // touchstart fires before touchend — gives iOS the synchronous gesture context
    // click covers desktop; keydown covers keyboard users
    const unlock = () => { void gestureUnlock(refs.current); };

    // { passive: true } = no scroll penalty; { once: false } = re-try if first fails
    document.addEventListener('touchstart', unlock, { passive: true });
    document.addEventListener('touchend',   unlock, { passive: true });
    document.addEventListener('click',      unlock);
    document.addEventListener('keydown',    unlock);

    // MOBILE FALLBACK: if already inside a gesture context on mount, try immediately
    // e.g. user tapped a button that toggled enabled=true
    void gestureUnlock(refs.current);

    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('touchend',   unlock);
      document.removeEventListener('click',      unlock);
      document.removeEventListener('keydown',    unlock);
    };
  }, [enabled]);

  // ── Play a frequency ─────────────────────────────────────────────────────
  const play = useCallback((freq: number) => {
    if (!enabled) return;
    const { ctx, masterGain } = refs.current;

    // Guard: context not ready or still suspended (mobile not yet unlocked)
    if (!ctx || !masterGain || ctx.state !== 'running') return;

    const now = ctx.currentTime;

    // Fundamental sine (kalimba body)
    const osc1 = ctx.createOscillator();
    const g1   = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    g1.gain.setValueAtTime(0.0, now);
    g1.gain.linearRampToValueAtTime(0.4, now + 0.003);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc1.connect(g1); g1.connect(masterGain);

    // 2nd partial (brightness)
    const osc2 = ctx.createOscillator();
    const g2   = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.75, now);
    g2.gain.setValueAtTime(0.0, now);
    g2.gain.linearRampToValueAtTime(0.15, now + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(g2); g2.connect(masterGain);

    // 3rd partial (attack click)
    const osc3 = ctx.createOscillator();
    const g3   = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 5.40, now);
    g3.gain.setValueAtTime(0.0, now);
    g3.gain.linearRampToValueAtTime(0.05, now + 0.003);
    g3.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc3.connect(g3); g3.connect(masterGain);

    osc1.start(now); osc1.stop(now + 1.3);
    osc2.start(now); osc2.stop(now + 0.3);
    osc3.start(now); osc3.stop(now + 0.15);
  }, [enabled]);

  const playNote = useCallback((index: number) => {
    play(SCALE[index % SCALE.length]);
  }, [play]);

  const playFreq = useCallback((freq: number) => {
    play(freq);
  }, [play]);

  return { playNote, playFreq, SCALE };
}
