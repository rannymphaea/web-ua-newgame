'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   NEWGAME — Vertical Flowchart Member Journey
   Top-to-bottom IA diagram with unique motion per element.
   ═══════════════════════════════════════════════════════════════ */

/* ── Color tokens ──────────────────────────────────────────────── */
const C = {
  gold:     '#FDCF41',
  goldDim:  '#c49a10',
  lavender: '#B9A6CE',
  trainee:  '#1B5E42',
  training: '#1A3F6B',
  eval:     '#7a4a00',
  assoc:    '#1B3D6B',
  soldat:   '#6B1E1E',
  yes:      '#4ade80',
  no:       '#f87171',
  text:     '#F0EEF4',
  muted:    '#8892A4',
};

/* ── Node definitions ─────────────────────────────────────────── */
interface FlowNode {
  id:       string;
  label:    string;
  sublabel?: string;
  color:    string;
  icon:     string;   // SVG path
  type:     'stage' | 'decision' | 'terminal' | 'branch';
  desc:     string;
  children?: BranchItem[];
}

interface BranchItem { label: string; tag?: string; tagColor?: string; loop?: boolean }

const FLOW_NODES: FlowNode[] = [
  {
    id: 'trainee', label: 'TRAINEE', sublabel: 'Tahap 01',
    color: C.trainee, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    type: 'stage',
    desc: 'Langkah pertama: isi formulir pendaftaran dan ikuti orientasi dasar NEWGAME.',
    children: [
      { label: 'Isi Formulir Pendaftaran' },
      { label: 'Orientasi NEWGAME' },
    ],
  },
  {
    id: 'training', label: 'TRAINING PHASE', sublabel: 'Tahap 02',
    color: C.training, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    type: 'stage',
    desc: 'Ikuti sesi belajar mingguan, event wajib, dan kerjakan mini project bersama tim.',
    children: [
      { label: 'Weekly Study Session' },
      { label: 'Event Wajib Organisasi' },
      { label: 'Mini Project Kelompok' },
    ],
  },
  {
    id: 'eval', label: 'PENILAIAN', sublabel: 'Tahap 03',
    color: C.eval, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    type: 'stage',
    desc: 'Penilaian kelayakan berdasarkan akumulasi EXP dan tingkat kehadiran event.',
    children: [
      { label: 'Akumulasi EXP' },
      { label: 'Tingkat Kehadiran' },
    ],
  },
  {
    id: 'eligible', label: 'ELIGIBLE?', sublabel: 'Decision Point',
    color: C.gold, icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    type: 'decision',
    desc: 'Apakah anggota memenuhi syarat minimum EXP dan kehadiran untuk naik level?',
    children: [
      { label: 'Lanjut ke Associate', tag: 'YES ✓', tagColor: C.yes },
      { label: 'Ulangi Training Phase', tag: 'NO ✗', tagColor: C.no, loop: true },
    ],
  },
  {
    id: 'associate', label: 'ASSOCIATE', sublabel: 'Tahap 04',
    color: C.assoc, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    type: 'stage',
    desc: 'Associate Member bisa memilih jalur: mengerjakan project nyata atau menjadi trainer.',
    children: [
      { label: 'Jalur A: Start Project' },
      { label: 'Jalur B: Be Trainer' },
    ],
  },
  {
    id: 'soldat', label: 'SOLDAT', sublabel: 'Tahap 05 — Final',
    color: C.soldat, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    type: 'terminal',
    desc: 'Puncak alur — Soldat siap mewakili NEWGAME di kompetisi game dev nasional!',
    children: [
      { label: 'Kompetisi Nasional' },
      { label: 'GameJam & Hackathon' },
      { label: 'Represent NEWGAME' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   ANIMATED CONNECTOR — Draw stroke from top to bottom
   ═══════════════════════════════════════════════════════════════ */
function AnimatedConnector({ color = C.gold, isLoop = false }: { color?: string; isLoop?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  if (isLoop) {
    return (
      <div ref={ref} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 48, position: 'relative' }}>
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={inView ? { scaleY: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            width: 2, height: 48,
            background: `linear-gradient(180deg, ${C.no}, transparent)`,
            borderRadius: 2,
            transformOrigin: 'top',
          }}
        />
        {/* Loop arrow */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{
            position: 'absolute', right: 'calc(50% - 72px)', top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700,
            color: C.no, letterSpacing: '0.05em',
          }}
        >
          ↩ retry
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '4px 0' }}>
      {/* Line draw animation */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={inView ? { scaleY: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: 2, height: 40,
          background: `linear-gradient(180deg, ${color}88, ${color})`,
          borderRadius: 2,
          transformOrigin: 'top',
        }}
      />
      {/* Arrowhead */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.4, duration: 0.25, type: 'spring', stiffness: 400 }}
        style={{
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${color}`,
          marginTop: -1,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAGE NODE — Spring bounce from below, unique glow ring
   ═══════════════════════════════════════════════════════════════ */
function StageNode({ node, index, active, onHover }: {
  node: FlowNode; index: number; active: boolean;
  onHover: (id: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const isDecision  = node.type === 'decision';
  const isTerminal  = node.type === 'terminal';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        type: 'spring',
        stiffness: 180,
        damping: 18,
      }}
      onHoverStart={() => onHover(node.id)}
      onHoverEnd={() => onHover(null)}
      style={{ width: '100%', maxWidth: 600, margin: '0 auto', position: 'relative' }}
    >
      {/* Outer glow ring — pulses on hover */}
      <motion.div
        animate={active ? {
          boxShadow: [`0 0 0 0px ${node.color}40`, `0 0 0 12px ${node.color}00`],
        } : { boxShadow: 'none' }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: -4,
          borderRadius: isDecision ? '50%' : 20,
          pointerEvents: 'none',
        }}
      />

      <div style={{
        background: isTerminal
          ? `linear-gradient(135deg, ${node.color}22, ${node.color}08)`
          : isDecision
          ? `linear-gradient(135deg, rgba(253,207,65,0.12), rgba(253,207,65,0.04))`
          : `linear-gradient(135deg, ${node.color}18, ${node.color}06)`,
        border: `1.5px solid ${active ? node.color : node.color + '44'}`,
        borderRadius: isDecision ? 16 : 20,
        padding: isDecision ? '20px 28px' : '24px 28px',
        display: 'flex',
        gap: 20,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: active
          ? `0 8px 40px ${node.color}20, 0 0 0 1px ${node.color}30`
          : '0 2px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Shimmer sweep on hover */}
        {active && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, bottom: 0, width: '50%',
              background: `linear-gradient(90deg, transparent, ${node.color}15, transparent)`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Icon circle */}
        <motion.div
          animate={active ? { rotate: isTerminal ? [0, 10, -10, 0] : 0, scale: 1.08 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            flexShrink: 0,
            width: isDecision ? 52 : 60, height: isDecision ? 52 : 60,
            borderRadius: isDecision ? 14 : 16,
            background: `${node.color}22`,
            border: `1.5px solid ${node.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width={isDecision ? 22 : 26} height={isDecision ? 22 : 26} viewBox="0 0 24 24"
            fill="none" stroke={node.color} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <path d={node.icon} />
          </svg>
        </motion.div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {node.sublabel && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: node.color, marginBottom: 4, opacity: 0.8,
            }}>{node.sublabel}</p>
          )}
          <h3 style={{
            fontFamily: 'var(--font-grotesk, var(--font-inter))',
            fontSize: isDecision ? 20 : 22,
            fontWeight: 800,
            color: 'var(--novel-ink)',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
            marginBottom: 6,
          }}>{node.label}</h3>
          {node.children && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {node.children.map((c, ci) => (
                <motion.span
                  key={ci}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.08 + 0.3 + ci * 0.07, type: 'spring', stiffness: 300 }}
                  style={{
                    padding: '3px 10px', borderRadius: 99,
                    background: c.loop ? `${C.no}15` : `${node.color}12`,
                    border: `1px solid ${c.loop ? C.no + '44' : node.color + '30'}`,
                    fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 600,
                    color: c.loop ? C.no : node.color,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {c.tag && (
                    <span style={{
                      fontWeight: 800, fontSize: 10,
                      color: c.tagColor || node.color,
                      marginRight: 2,
                    }}>{c.tag}</span>
                  )}
                  {c.label}
                  {c.loop && <span style={{ fontSize: 10 }}>↩</span>}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* Step number badge */}
        {!isDecision && !isTerminal && (
          <div style={{
            position: 'absolute', top: 12, right: 14,
            fontFamily: 'var(--font-inter)', fontSize: 28, fontWeight: 900,
            color: node.color, opacity: 0.07, lineHeight: 1,
            userSelect: 'none',
          }}>0{index + 1}</div>
        )}

        {/* Terminal star burst */}
        {isTerminal && active && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 20 }}>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: '50%', y: '50%' }}
                animate={{ opacity: [0, 0.7, 0], scale: [0, 1.5, 0.5], x: `${50 + Math.cos(i * 60 * Math.PI / 180) * 80}%`, y: `${50 + Math.sin(i * 60 * Math.PI / 180) * 40}%` }}
                transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity, repeatDelay: 1.5 }}
                style={{
                  position: 'absolute', width: 6, height: 6, borderRadius: '50%',
                  background: C.gold, transformOrigin: 'center',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info popup */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', bottom: -46, left: 0, right: 0, zIndex: 10,
              background: 'var(--clr-bg-surface-elevated)',
              border: `1px solid ${node.color}30`,
              borderRadius: 10, padding: '8px 16px',
              fontFamily: 'var(--font-inter)', fontSize: 12.5,
              color: 'var(--novel-cloud)', lineHeight: 1.5,
              boxShadow: `0 4px 20px ${node.color}15`,
              backdropFilter: 'blur(12px)',
            }}
          >
            {node.desc}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP FLOWCHART
   ═══════════════════════════════════════════════════════════════ */
function PirateMapDesktop() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section style={{ padding: '80px 32px 120px', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', marginBottom: 56 }}
      >
        <p className="section-badge">
          <i className="ri-map-line" />
          Alur Anggota
          <i className="ri-map-line" />
        </p>
        <h2 className="section-title">Pemetaan Alur Anggota</h2>
        <p style={{
          fontFamily: 'var(--font-cormorant)', fontSize: 17,
          color: 'var(--novel-cloud)', marginTop: 8, lineHeight: 1.7,
          maxWidth: 500, margin: '8px auto 0',
        }}>
          Perjalanan bergabung hingga menjadi anggota inti NEWGAME — hover untuk detail.
        </p>
      </motion.div>

      {/* Flowchart */}
      <div ref={containerRef} style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>

        {/* Root entry node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}
        >
          <div style={{
            padding: '10px 28px', borderRadius: 99,
            background: 'linear-gradient(135deg, #1F293A, #2d3f58)',
            border: `2px solid ${C.gold}`,
            boxShadow: `0 0 24px ${C.gold}30, 0 4px 20px rgba(0,0,0,0.15)`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {/* Spinning conic gradient ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: `conic-gradient(${C.gold}, ${C.lavender}, #1F293A, ${C.gold})`,
              }}
            />
            <span style={{
              fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 800,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: C.gold,
            }}>JOIN NEWGAME</span>
          </div>
        </motion.div>

        {/* Nodes + connectors */}
        {FLOW_NODES.map((node, i) => (
          <div key={node.id}>
            <AnimatedConnector
              color={node.type === 'decision' ? C.gold : node.color}
            />
            <StageNode
              node={node} index={i}
              active={activeNode === node.id}
              onHover={setActiveNode}
            />
          </div>
        ))}

        {/* Bottom terminator line */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{
              width: 2, height: 32,
              background: `linear-gradient(180deg, ${C.soldat}, transparent)`,
              transformOrigin: 'top',
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div style={{
            padding: '8px 24px', borderRadius: 99,
            background: `${C.soldat}22`,
            border: `1.5px solid ${C.soldat}66`,
            fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 700,
            color: C.soldat, letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>🏆 Represent NEWGAME</div>
        </motion.div>

        {/* Hover tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          style={{
            textAlign: 'center', marginTop: 40,
            fontFamily: 'var(--font-inter)', fontSize: 12,
            color: 'var(--novel-cloud)', opacity: 0.5,
          }}
        >
          💡 Hover pada setiap tahap untuk melihat detail
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE — Animated step cards with slide-in from left
   ═══════════════════════════════════════════════════════════════ */
function PirateMapMobile() {
  return (
    <section style={{ padding: '52px 20px 80px', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <p className="section-badge">Alur Anggota</p>
        <h2 className="section-title">Pemetaan Alur Anggota</h2>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
        {/* Vertical guide line */}
        <div style={{
          position: 'absolute', left: 22, top: 0, bottom: 0,
          width: 2,
          background: 'linear-gradient(180deg, rgba(253,207,65,0.5), rgba(185,166,206,0.3), transparent)',
          borderRadius: 2,
        }} />

        {FLOW_NODES.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              delay: i * 0.08,
              duration: 0.5,
              type: 'spring',
              stiffness: 160,
              damping: 20,
            }}
            style={{ display: 'flex', gap: 16, marginBottom: 20, paddingLeft: 4 }}
          >
            {/* Step dot */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.2, type: 'spring', stiffness: 300 }}
              style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
                background: node.type === 'decision' ? 'rgba(253,207,65,0.15)' : `${node.color}22`,
                border: `2px solid ${node.type === 'decision' ? C.gold : node.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900, color: node.type === 'decision' ? C.gold : node.color,
                fontFamily: 'var(--font-inter)',
                boxShadow: `0 0 16px ${node.color}33`,
                zIndex: 1,
              }}
            >
              {node.type === 'decision' ? '?' : node.type === 'terminal' ? '★' : `0${i}`}
            </motion.div>

            {/* Card */}
            <div style={{
              flex: 1,
              background: 'var(--clr-bg-surface)',
              border: `1px solid ${node.color}25`,
              borderRadius: 14, overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                padding: '10px 14px',
                background: `${node.color}12`,
                borderBottom: `1px solid ${node.color}20`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke={node.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={node.icon} />
                </svg>
                <span style={{
                  fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 800,
                  color: 'var(--novel-ink)', letterSpacing: '-0.2px',
                }}>{node.label}</span>
                {node.sublabel && (
                  <span style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-inter)', fontSize: 10, fontWeight: 700,
                    color: node.color, opacity: 0.7, letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>{node.sublabel}</span>
                )}
              </div>
              {node.children && (
                <div style={{ padding: '8px 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {node.children.map((c, ci) => (
                    <span key={ci} style={{
                      padding: '2px 8px', borderRadius: 99,
                      background: c.loop ? `${C.no}10` : `${node.color}10`,
                      border: `1px solid ${c.loop ? C.no + '30' : node.color + '25'}`,
                      fontFamily: 'var(--font-inter)', fontSize: 11,
                      color: c.loop ? C.no : node.color, fontWeight: 600,
                    }}>
                      {c.tag && <b>{c.tag} </b>}
                      {c.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT
   ═══════════════════════════════════════════════════════════════ */
export default function PirateMap() {
  return (
    <>
      <div className="desktop-map-container">
        <PirateMapDesktop />
      </div>
      <div className="mobile-map-container">
        <PirateMapMobile />
      </div>
    </>
  );
}
