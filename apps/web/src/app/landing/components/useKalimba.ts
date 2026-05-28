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

function initAudioGraph(refs: AudioRefs) {
  if (refs.ctx) return refs.ctx;
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -15;
  compressor.knee.value = 5;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.1;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.6;

  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = 0.15;

  const feedback = ctx.createGain();
  feedback.gain.value = 0.15;

  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.15;

  masterGain.connect(compressor);
  compressor.connect(ctx.destination);

  masterGain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(compressor);

  refs.ctx = ctx;
  refs.masterGain = masterGain;
  refs.compressor = compressor;
  refs.delay = delay;
  refs.feedback = feedback;
  refs.wetGain = wetGain;
  return ctx;
}

export function useKalimba(enabled: boolean) {
  const refs = useRef<AudioRefs>({
    ctx: null, masterGain: null, compressor: null,
    delay: null, feedback: null, wetGain: null, unlocked: false,
  });

  // Unlock on first user interaction
  useEffect(() => {
    if (!enabled) return;
    const unlock = () => {
      if (refs.current.unlocked) return;
      const ctx = initAudioGraph(refs.current);
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => { refs.current.unlocked = true; });
      } else {
        refs.current.unlocked = true;
      }
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    document.addEventListener('keydown', unlock);
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, [enabled]);

  const play = useCallback((freq: number) => {
    if (!enabled) return;
    const { ctx, masterGain } = refs.current;
    if (!ctx || !masterGain || ctx.state === 'suspended') return;

    const now = ctx.currentTime;

    // Fundamental sine (kalimba body)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    g1.gain.setValueAtTime(0.0, now);
    g1.gain.linearRampToValueAtTime(0.4, now + 0.003);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc1.connect(g1); g1.connect(masterGain);

    // 2nd partial (brightness)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.75, now);
    g2.gain.setValueAtTime(0.0, now);
    g2.gain.linearRampToValueAtTime(0.15, now + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(g2); g2.connect(masterGain);

    // 3rd partial (attack click)
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
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
