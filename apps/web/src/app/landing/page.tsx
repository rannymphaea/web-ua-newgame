'use client';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useScrollReveal,
  useParallax,
  AnimatedCounter,
  StaggerText,
  TypewriterText,
} from './components/ScrollReveal';
import {
  MISI_LIST,
  MAIN_CORE,
  PILLARS,
  RANKS,
  PROJECTS,
  STATS,
  FAQS,
  CONTACTS,
} from './components/data';
import dynamic from 'next/dynamic';
import { useTheme } from '@/lib/theme-engine';

// Dynamically import heavy / client-only components
const PaperCanvas         = dynamic(() => import('./components/PaperCanvas'),         { ssr: false });
const QuestStack3D        = dynamic(() => import('./components/QuestStack3D'),        { ssr: false });
const PirateMap           = dynamic(() => import('./components/PirateMap'),           { ssr: false });
const AssessmentAccordion = dynamic(() => import('./components/AssessmentAccordion'), { ssr: false });
const VideoModal          = dynamic(() => import('./components/VideoModal'),           { ssr: false });
const SplashScreen        = dynamic(() => import('./components/SplashScreen'),        { ssr: false });

/* ── Sound toggle ───────────────────────────────── */
function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  /**
   * MOBILE SOUND FIX: AudioContext must be resumed INSIDE a synchronous
   * user gesture. onPointerDown fires before onClick — perfect for iOS.
   * We attempt resume here so the audio system is unlocked before toggle.
   */
  const handlePointerDown = useCallback(() => {
    try {
      // Find any suspended AudioContext and resume it immediately
      const win = window as any;
      const AudioCtx = win.AudioContext || win.webkitAudioContext;
      if (!AudioCtx) return;
      // Resume existing context if suspended (created by useKalimba)
      if (win.__audioCtx && win.__audioCtx.state === 'suspended') {
        win.__audioCtx.resume();
      }
    } catch (_) { /* ignore */ }
  }, []);

  return (
    <button
      id="sound-toggle"
      className={`sound-toggle-btn${enabled ? '' : ' muted'}`}
      onPointerDown={handlePointerDown}  /* gesture unlock — fires before onClick */
      onClick={onToggle}
      aria-label={enabled ? 'Matikan suara' : 'Aktifkan suara'}
      title={enabled ? 'Sound ON' : 'Sound OFF'}
      style={{ touchAction: 'manipulation' }}
    >
      {enabled ? (
        <i className="ri-volume-up-line" style={{ fontSize: 18 }} />
      ) : (
        <i className="ri-volume-mute-line" style={{ fontSize: 18 }} />
      )}
    </button>
  );
}

/* ── Scroll To Top ─────────────────────────────────────────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      id="scroll-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Kembali ke atas"
      className="sound-toggle-btn"
      style={{ bottom: 148, touchAction: 'manipulation' }}
      title="Scroll ke atas"
    >
      <i className="ri-arrow-up-line" style={{ fontSize: 18 }} />
    </button>
  );
}

/* ── Theme toggle ──────────────────────────────────────────────── */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      id="theme-toggle"
      className="sound-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
      style={{ bottom: 88 }}
    >
      {isDark ? (
        <i className="ri-sun-line" style={{ fontSize: 18, color: '#FDCF41' }} />
      ) : (
        <i className="ri-moon-line" style={{ fontSize: 18 }} />
      )}
    </button>
  );
}

/* ── Framer Motion variants ───────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};
const fadeLeft = {
  hidden:  { opacity: 0, x: -40 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: (delay = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const scrollRef = useScrollReveal();
  useParallax();

  const [openFaq,   setOpenFaq]   = useState<number | null>(null);
  const [soundOn,   setSoundOn]   = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);

  const toggleSound = useCallback(() => setSoundOn(s => !s), []);
  const openVideo   = useCallback((e: React.MouseEvent) => { e.preventDefault(); setVideoOpen(true); }, []);
  const closeVideo  = useCallback(() => setVideoOpen(false), []);

  return (
    <div
      ref={scrollRef}
      style={{ minHeight: '100vh', background: 'var(--novel-bg)', color: 'var(--novel-ink)', overflowX: 'hidden', position: 'relative' }}
    >
      {/* ── Splash Screen Entrance ─ */}
      <SplashScreen />

      {/* ── Paper Texture ─── */}
      <PaperCanvas />

      {/* ── Warm Ink Orbs (fixed bg) ─ */}
      <div className="bg-orbs" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="bg-orb bg-orb-1 parallax-slow" />
        <div className="bg-orb bg-orb-2 parallax-slow" />
        <div className="bg-orb bg-orb-3 parallax-fast" />
      </div>

      {/* ── Sound Toggle ─ */}
      <SoundToggle enabled={soundOn} onToggle={toggleSound} />

      {/* ── Theme Toggle ─ */}
      <ThemeToggle />

      {/* M2: Scroll To Top ─ */}
      <ScrollToTop />

      {/* ════ HERO (Asymmetric Split) ═══════════════════════════ */}
      <section
        className="hero-section"
        aria-label="Hero section"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="hero-parallax-bg parallax-slow" />
        <div className="hero-glow" />

        {/* Left — Text column */}
        <div className="hero-text-col">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="NEWGAME"
            width={72}
            height={72}
            className="hero-logo"
            priority
          />

          {/* Eyebrow */}
          <p className="hero-eyebrow">
            UKM Game Development · Universitas Andalas
          </p>

          {/* H1 — Typewriter Animation */}
          <h1
            className="hero-title"
            style={{
              fontSize: 'clamp(4rem, 8vw, 6.5rem)',
              fontWeight: 800,
              color: '#000000',
              /* fontFamily intentionally removed — let .hero-title CSS class control */
              textShadow: '2px 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '0.2rem',
              letterSpacing: '-1px',
              minHeight: '1.2em'
            }}
          >
            <TypewriterText text="NEWGAME" />
          </h1>

          {/* Tagline — Lora italic */}
          <p className="hero-subtitle">
            Wadah bagi para game developer muda untuk belajar, berkarya, dan berprestasi bersama.
          </p>

          <p className="hero-tagline">Learn · Create · Play</p>

          {/* CTA Buttons */}
          <div className="hero-cta">
            <motion.a
              href="/login"
              className="btn btn-primary hero-btn"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <i className="ri-login-circle-line" style={{ fontSize: 18 }} />
              Masuk ke Portal
            </motion.a>
            <motion.a
              href="#about"
              className="btn btn-secondary hero-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="ri-book-open-line" style={{ fontSize: 18 }} />
              Pelajari Lebih
            </motion.a>
            <motion.a
              href="#guidebook"
              className="btn btn-secondary hero-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ borderColor: 'rgba(253,207,65,0.5)', color: '#c49a10' }}
            >
              <i className="ri-book-2-line" style={{ fontSize: 18 }} />
              Guidebook
            </motion.a>
          </div>
        </div>

        {/* Right — OC Image column */}
        <motion.div
          className="hero-image-col"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-oc-wrap">
            <div className="hero-oc-blob" />
            <div className="hero-oc-ring" />
            <Image
              src="/yua.png"
              alt="NEWGAME Character"
              width={480}
              height={560}
              className="hero-oc-img"
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        </motion.div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint">
          <div className="scroll-arrow" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ════ VISI & MISI ════════════════════════════════════════ */}
      <section id="about" className="landing-section">
        <div className="section-inner" style={{ maxWidth: 1000 }}>
          <div className="reveal">
            <p className="section-badge">
              <i className="ri-sparkling-line" />
              Tentang Kami
              <i className="ri-sparkling-line" />
            </p>
            <h2 className="section-title">Visi &amp; Misi</h2>
          </div>
          <div className="visimisi-grid">
            <div className="reveal-left reveal-delay-1 glow-card visi-card">
              <h3 style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--novel-ink)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(253,207,65,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ri-eye-line" style={{ fontSize: 18, color: '#c49a10' }} />
                </div>
                Visi
              </h3>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 17, lineHeight: 1.85, color: 'var(--novel-cloud)' }}>
                Menjadi UKM unggulan di Universitas Andalas yang menjadi wadah bagi mahasiswa untuk berkembang secara profesional dalam bidang pengembangan game serta berprestasi di tingkat nasional dan internasional.
              </p>
              <a href="https://2b-eternity.github.io/test/" target="_blank" rel="noopener noreferrer" className="guidebook-link">
                <i className="ri-book-2-line" style={{ fontSize: 16 }} />
                Buka Guidebook Lengkap
                <i className="ri-arrow-right-up-line" style={{ fontSize: 14 }} />
              </a>
            </div>
            <div className="reveal-right reveal-delay-2 glow-card misi-card">
              <h3 style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--novel-ink)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(185,166,206,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ri-compass-3-line" style={{ fontSize: 18, color: 'var(--novel-lavender)' }} />
                </div>
                Misi
              </h3>
              <div className="misi-list">
                {MISI_LIST.map((m, i) => (
                  <div key={i} className="misi-item">
                    <span className="misi-num">{i + 1}</span>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, lineHeight: 1.75, color: 'var(--novel-cloud)' }}>{m}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-glow" style={{ maxWidth: 600, margin: '0 auto' }} />

      {/* ════ MAIN CORE ══════════════════════════════════════════ */}
      <section className="landing-section">
        <div className="section-inner" style={{ maxWidth: 900 }}>
          <div className="reveal">
            <p className="section-badge">
              <i className="ri-team-line" />Presidium<i className="ri-team-line" />
            </p>
            <h2 className="section-title">Main Core</h2>
            <p className="section-desc">
              Main Core adalah rumpun organisasi pertama — presidium inti dari NewGame.
            </p>
          </div>
          <div className="org-tree">
            <div className="reveal-scale reveal-delay-1 glow-card org-president">
              <div className="org-avatar-ring">
                <div className="org-avatar-inner">
                  <i className="ri-vip-crown-line" style={{ fontSize: 24, color: '#c49a10' }} />
                </div>
              </div>
              <p style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-lora)', letterSpacing: 1 }}>
                <span className="gradient-text">Pixel President</span>
              </p>
              <p className="novel-tag" style={{ marginTop: 4 }}>Presiden UKM</p>
            </div>
            <div className="org-branches">
              {MAIN_CORE.map((c, i) => (
                <div key={i} className={`reveal reveal-delay-${i + 2} glow-card org-branch-card`}>
                  <div className="org-branch-icon" style={{ background: `rgba(253,207,65,0.08)` }}>
                    <i className="ri-user-star-line" style={{ fontSize: 20, color: 'var(--novel-lavender)' }} />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 15, fontFamily: 'var(--font-lora)', color: 'var(--novel-ink)' }}>{c.role}</p>
                  <p className="novel-tag" style={{ marginTop: 4 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider-glow" style={{ maxWidth: 600, margin: '0 auto' }} />

      {/* ════ 3 PILLAR ═══════════════════════════════════════════ */}
      <section className="landing-section">
        <div className="section-inner" style={{ maxWidth: 950 }}>
          <div className="reveal">
            <p className="section-badge">
              <i className="ri-layout-grid-line" />Bidang<i className="ri-layout-grid-line" />
            </p>
            <h2 className="section-title">3 Pillar</h2>
          </div>
          <div className="pillar-grid">
            {PILLARS.map((p, i) => (
              <motion.div
                key={i}
                className={`reveal reveal-delay-${i + 1} glow-card pillar-card ${p.cls}`}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="pillar-icon" style={{ background: `rgba(185,166,206,0.1)` }}>
                  <i className="ri-gamepad-line" style={{ fontSize: 28, color: 'var(--novel-lavender)' }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-lora)', color: 'var(--novel-ink)' }}>{p.name}</h3>
                <p className="pillar-desc">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ QUEST — 3D CARD STACK ══════════════════════════════ */}
      <section id="quest" className="landing-section">
        <div className="section-inner" style={{ maxWidth: 800 }}>
          <div className="reveal">
            <p className="section-badge">
              <i className="ri-sword-line" />Divisi<i className="ri-sword-line" />
            </p>
            <h2 className="section-title">Quest</h2>
          </div>
          <p className="reveal reveal-delay-1 quest-info">
            Quest merupakan divisi-divisi yang ada di NewGame. Setiap quest memiliki task dan jobdesk tersendiri.
          </p>
          <QuestStack3D soundEnabled={soundOn} />
        </div>
      </section>

      <div className="divider-glow" style={{ maxWidth: 600, margin: '0 auto' }} />

      {/* ════ SISTEM PENILAIAN ═══════════════════════════════════ */}
      <section id="sistem-penilaian" className="landing-section">
        <div className="section-inner" style={{ maxWidth: 900 }}>
          <div className="reveal">
            <p className="section-badge">
              <i className="ri-medal-line" />Gamification<i className="ri-medal-line" />
            </p>
            <h2 className="section-title">Sistem Penilaian EXP</h2>
            <p className="section-desc">
              Sistem kerja di NewGame berdasarkan game! Kerjakan task, dapatkan EXP, naik rank!
            </p>
          </div>
          <div className="exp-grid">
            {[
              { icon: 'ri-flashlight-line', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', title: 'Poin EXP', desc: 'Setiap task yang dikerjakan mendapat EXP. Skor menentukan jabatan Core & Quest, Penghargaan Anggota Terbaik, dan kesempatan lomba GameJam!' },
              { icon: 'ri-trophy-line', color: 'var(--novel-lavender)', bg: 'rgba(185,166,206,0.1)', title: 'Tingkatan Rank', desc: 'Naik rank berdasarkan EXP yang dikumpulkan. Semua rank tetap boleh ikut study weekly!', ranks: true },
              { icon: 'ri-award-line', color: '#FDCF41', bg: 'rgba(253,207,65,0.08)', title: 'Eligible Lomba', desc: 'Yang paling seru — siapa yang berangkat lomba GameJam ke Pulau Jawa atau Luar Negeri ditentukan dari EXP!' },
            ].map((card, i) => (
              <motion.div
                key={i}
                className={`reveal reveal-delay-${i + 1} glow-card exp-card`}
                whileHover={{ y: -4 }}
              >
                <div className="exp-card-icon" style={{ background: card.bg }}>
                  <i className={card.icon} style={{ fontSize: 22, color: card.color }} />
                </div>
                <h4 style={{ fontWeight: 600, fontSize: 17, marginBottom: 8, fontFamily: 'var(--font-lora)', color: 'var(--novel-ink)' }}>{card.title}</h4>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: 'var(--novel-cloud)', lineHeight: 1.75 }}>{card.desc}</p>
                {card.ranks && (
                  <div className="rank-badges">
                    {RANKS.map((r, ri) => (
                      <span key={ri} className="rank-badge" style={{ color: r.color, borderColor: r.border, background: r.bg }}>{r.name}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="reveal" style={{ marginTop: 36 }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'var(--novel-cloud)', textAlign: 'center', marginBottom: 16 }}>
              Klik salah satu untuk detail lebih lanjut:
            </p>
            <AssessmentAccordion soundEnabled={soundOn} />
          </div>
        </div>
      </section>

      {/* ════ PROJECT ════════════════════════════════════════════ */}
      <section className="landing-section">
        <div className="section-inner" style={{ maxWidth: 900 }}>
          <div className="reveal">
            <p className="section-badge">
              <i className="ri-code-box-line" />Karya<i className="ri-code-box-line" />
            </p>
            <h2 className="section-title">Project Ideas</h2>
          </div>
          <div className="project-grid" style={{ marginTop: 28 }}>
            {PROJECTS.map((p, i) => (
              <motion.div
                key={i}
                className={`reveal reveal-delay-${i + 1} glow-card project-card`}
                whileHover={{ y: -6 }}
              >
                <span className="project-level" style={{ color: 'var(--novel-ink)' }}>{p.level}</span>
                {/* Project icon — SVG inline agar tidak jadi kotak hitam di Android */}
                <div className="project-icon" style={{
                  background: `${p.color}15`,
                  border: `1.5px solid ${p.color}30`,
                  borderRadius: 16,
                  width: 60, height: 60,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.icon} />
                  </svg>
                </div>
                <h4 style={{ fontWeight: 600, fontSize: 17, marginBottom: 8, fontFamily: 'var(--font-lora)', color: 'var(--novel-ink)' }}>{p.name}</h4>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, color: 'var(--novel-cloud)', lineHeight: 1.75 }}>{p.desc}</p>
                {/* GOTS label */}
                {p.name === 'GOTS' && (
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: p.color, marginTop: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Game of The Season</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-glow" style={{ maxWidth: 600, margin: '0 auto' }} />

      {/* ════ PIRATE MAP ═════════════════════════════════════════ */}
      <PirateMap />

      <div className="divider-glow" style={{ maxWidth: 600, margin: '0 auto' }} />

      {/* ════ STATS ══════════════════════════════════════════════ */}
      <section className="landing-section stats-section">
        <div className="section-inner">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1}`} style={{ padding: 24 }}>
                <p className="stat-counter"><AnimatedCounter end={s.value} suffix={s.suffix} /></p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'var(--novel-cloud)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FAQ ════════════════════════════════════════════════ */}
      <section className="landing-section">
        <div className="section-inner" style={{ maxWidth: 700 }}>
          <div className="reveal">
            <p className="section-badge">
              <i className="ri-question-line" />Pertanyaan<i className="ri-question-line" />
            </p>
            <h2 className="section-title">FAQ</h2>
          </div>
          <div className="reveal reveal-delay-1">
            {FAQS.map((f, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <i className={`ri-arrow-down-s-line faq-chevron`} style={{ fontSize: 20 }} />
                </button>
                <div className="faq-answer">
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 17, color: 'var(--novel-cloud)', lineHeight: 1.8, padding: '0 0 20px' }}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ GUIDEBOOK ══════════════════════════════════════════ */}
      <section id="guidebook" className="landing-section">
        <div className="section-inner" style={{ maxWidth: 800 }}>
          <div className="reveal">
            <p className="section-badge">
              <i className="ri-book-2-line" />
              Panduan
              <i className="ri-book-2-line" />
            </p>
            <h2 className="section-title">Guidebook NEWGAME</h2>
            <p className="section-desc">
              Semua yang perlu kamu tahu — struktur organisasi, sistem EXP, divisi (quest),
              pillar, hingga FAQ kegiatan NEWGAME secara lengkap dan interaktif.
            </p>
          </div>

          {/* GUIDEBOOK CARD — mobile responsive */}
          <motion.a
            href="https://2b-eternity.github.io/test/"
            target="_blank"
            rel="noopener noreferrer"
            className="reveal reveal-delay-1 glow-card guidebook-card"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 24,
              padding: '32px 28px', borderRadius: 24,
              background: 'linear-gradient(135deg,rgba(253,207,65,0.08) 0%,rgba(185,166,206,0.06) 100%)',
              textDecoration: 'none', color: 'inherit',
              marginTop: 28, flexWrap: 'wrap',
            }}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Book icon — SVG inline, tidak bergantung Remix Icon CDN */}
            <div style={{
              flexShrink: 0, width: 72, height: 72, borderRadius: 18,
              background: 'rgba(253,207,65,0.12)',
              border: '2px solid rgba(253,207,65,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c49a10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
              </svg>
            </div>

            {/* Text + chips — flex:1 dengan min-width:0 agar wrap benar */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '0.72rem',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--novel-cloud)', marginBottom: 6,
              }}>Dokumen Resmi · NEWGAME</p>
              <h3 style={{
                fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 700,
                color: 'var(--novel-ink)', marginBottom: 8,
              }}>Buka Guidebook Lengkap</h3>
              <p style={{
                fontFamily: 'var(--font-cormorant)', fontSize: 15,
                color: 'var(--novel-cloud)', lineHeight: 1.7, marginBottom: 14,
              }}>Panduan interaktif bergaya handwritten dengan animasi — cocok dibaca sebelum bergabung atau sebagai referensi anggota aktif.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Struktur Org', color: '#335C67', bg: '#e8f0f2' },
                  { label: 'Sistem EXP',   color: '#7a4a00', bg: '#fdf6e3' },
                  { label: 'Quest/Divisi', color: '#9E2A2B', bg: '#f5ece0' },
                  { label: '3 Pillar',     color: '#335C67', bg: '#e8f0f2' },
                  { label: 'Main Core',    color: '#7a4a00', bg: '#fdf6e3' },
                  { label: 'FAQ',          color: '#9E2A2B', bg: '#f5ece0' },
                ].map(chip => (
                  <span key={chip.label} style={{
                    padding: '4px 12px', borderRadius: 99,
                    background: chip.bg, color: chip.color,
                    fontFamily: 'var(--font-inter)', fontSize: '0.73rem',
                    fontWeight: 600, border: `1.5px solid ${chip.color}33`,
                  }}>{chip.label}</span>
                ))}
              </div>
            </div>

            {/* CTA — full width on mobile via flexWrap */}
            <div style={{ flexShrink: 0, width: '100%', maxWidth: 160 }}>
              <div style={{
                padding: '11px 20px', borderRadius: 12,
                background: '#FDCF41', color: '#2c1810',
                fontFamily: 'var(--font-lora)', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 16px rgba(253,207,65,0.4)',
              }}>
                Buka Sekarang
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: 'var(--novel-cloud)', marginTop: 6, textAlign: 'center' }}>Membuka tab baru</p>
            </div>
          </motion.a>
        </div>
      </section>

      <div className="divider-glow" style={{ maxWidth: 600, margin: '0 auto' }} />

      {/* ════ CTA ════════════════════════════════════════════════ */}
      <section className="landing-section">
        <motion.div
          className="reveal"
          style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glow-card animate-glow" style={{ padding: '60px 40px', borderRadius: 24, background: 'linear-gradient(135deg,rgba(253,207,65,0.06),rgba(185,166,206,0.06))' }}>
            <p className="section-badge" style={{ justifyContent: 'center', marginBottom: 12 }}>
              <i className="ri-star-line" />Bergabung<i className="ri-star-line" />
            </p>
            <h2 className="section-title" style={{ marginBottom: 14 }}>Siap Bergabung?</h2>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: 'var(--novel-cloud)', marginBottom: 32, lineHeight: 1.8 }}>
              Jadilah bagian dari komunitas game developer terbesar di Universitas Andalas.
            </p>
            <motion.a
              href="/login"
              className="btn btn-primary hero-btn"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <i className="ri-rocket-line" style={{ fontSize: 18 }} />
              Masuk Sekarang
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* ════ CONTACT ════════════════════════════════════════════ */}
      <section className="landing-section" style={{ paddingBottom: 40 }}>
        <div className="section-inner reveal" style={{ maxWidth: 600, textAlign: 'center' }}>
          <h2 className="section-title" style={{ fontSize: 24 }}>Kontak</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
            {CONTACTS.map((c, i) => (
              <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="contact-link">
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={c.icon}/></svg>
                </div>
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════════════════════════════════════════════ */}
      <footer className="landing-footer">
        <div className="divider-glow" style={{ margin: '0 auto 24px', maxWidth: 400 }} />
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'var(--novel-cloud)' }}>
          NEWGAME — Universitas Andalas
        </p>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: 'var(--novel-cloud)', marginTop: 6, opacity: 0.7 }}>
          Learn&nbsp;·&nbsp;Create&nbsp;·&nbsp;
          <button id="play-btn" className="footer-play-btn" onClick={openVideo}>Play</button>
        </p>
      </footer>

      {/* ════ VIDEO MODAL ════════════════════════════════════════ */}
      <VideoModal isOpen={videoOpen} onClose={closeVideo} />
    </div>
  );
}
