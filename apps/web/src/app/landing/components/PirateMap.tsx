'use client';
import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   NEWGAME — Information Architecture Flowchart
   Gaya: Left-to-right hierarchy tree dengan animated connectors
   Inspired by IA diagram style (dots + lines + nodes)
   ═══════════════════════════════════════════════════════════════ */

// SVG canvas
const VW = 880, VH = 560;

// ── Color tokens ─────────────────────────────────────────────
const C = {
  root:      '#1F293A',
  rootBdr:   '#FDCF41',
  p1:        '#1B5E42',   // Trainee — teal green
  p2:        '#1A3F6B',   // Training — deep blue
  p3:        '#6B3A1A',   // Penilaian — amber
  p4:        '#1B3D6B',   // Associate — cobalt
  p5:        '#6B1E1E',   // Soldat — crimson
  sec:       '#111827',   // secondary node bg
  secBdr:    '#FFFFFF22', // secondary node border
  line:      'rgba(255,255,255,0.18)',
  dot:       'rgba(255,255,255,0.55)',
  yes:       '#4ade80',
  no:        '#f87171',
  term:      '#C68A00',   // terminal gold
  txt:       '#F0EEF4',
  txtMuted:  '#8892A4',
};

// ── Computed node positions ────────────────────────────────────
// Stage centers
const SY = { s1: 72, s2: 192, s3: 322, s4: 438, s5: 520 };

// x-positions for columns
const CX = { root: 60, stage: 165, junc1: 290, sec: 308, junc2: 430, ter: 448, junc3: 572, quat: 590 };

// ── Stage definitions ─────────────────────────────────────────
interface Stage { id: string; label: string[]; cy: number; color: string }
const STAGES: Stage[] = [
  { id:'s1', label:['Trainee'],        cy: SY.s1, color: C.p1 },
  { id:'s2', label:['Training Phase'], cy: SY.s2, color: C.p2 },
  { id:'s3', label:['Penilaian'],      cy: SY.s3, color: C.p3 },
  { id:'s4', label:['Associate'],      cy: SY.s4, color: C.p4 },
  { id:'s5', label:['Soldat'],         cy: SY.s5, color: C.p5 },
];

// ── Secondary nodes ───────────────────────────────────────────
interface SecNode { label: string[]; cy: number; stageId: string; special?: 'yes'|'no'|'term'; termColor?: string }
const SEC_NODES: SecNode[] = [
  // Trainee (s1, cy=72)
  { stageId:'s1', label:['Form', 'Daftar'],         cy: 55 },
  { stageId:'s1', label:['Orientasi', 'NEWGAME'],   cy: 89 },
  // Training (s2, cy=192)
  { stageId:'s2', label:['Weekly', 'Study'],         cy: 167 },
  { stageId:'s2', label:['Event Wajib'],             cy: 199 },
  { stageId:'s2', label:['Mini Project'],            cy: 231 },
  // Penilaian (s3, cy=322)
  { stageId:'s3', label:['EXP &', 'Kehadiran'],     cy: 300 },
  { stageId:'s3', label:['Eligible?'],               cy: 336, special:'yes', termColor: C.term },
  // Associate (s4, cy=438)
  { stageId:'s4', label:['Start', 'Project'],        cy: 420 },
  { stageId:'s4', label:['Be Trainer'],              cy: 456 },
  // Soldat (s5, cy=520)
  { stageId:'s5', label:['Join', 'Comp.'],           cy: 520, special:'term', termColor: C.term },
];

// ── Tertiary nodes ─────────────────────────────────────────────
interface TerNode { label: string[]; cy: number; secIdx: number; color?: string; dashed?: boolean; labelTag?: string; labelColor?: string }
const TER_NODES: TerNode[] = [
  // from Eligible? YES
  { secIdx:6, label:['→ Jadi','Associate'],  cy: 318, color: C.yes,  labelTag:'YES', labelColor: C.yes },
  // from Eligible? NO
  { secIdx:6, label:['Ulangi', 'Training'], cy: 354, color: C.no,   labelTag:'NO',  labelColor: C.no,  dashed:true },
  // from Start Project
  { secIdx:7, label:['→ Soldat'],            cy: 420, color: C.p5,  labelTag:'→' },
  // from Be Trainer
  { secIdx:8, label:['→ Soldat'],            cy: 456, color: C.p5,  dashed:true, labelTag:'↗' },
  // from Join Comp.
  { secIdx:9, label:['Kompetisi', 'Nasional'], cy: 506, color: C.term },
  { secIdx:9, label:['GameJam &', 'Hackathon'], cy: 536, color: C.term },
];

/* ═══════════════════════════════════════════════════════════════
   SVG HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */
function NodeRect({
  x, y, w = 115, h = 36, rx = 8,
  fill, stroke, strokeWidth = 1.5,
  labels, labelColor = C.txt,
  fontSize = 10.5, fontWeight = '700',
  opacity = 1, style = {},
}: {
  x:number; y:number; w?:number; h?:number; rx?:number;
  fill:string; stroke:string; strokeWidth?:number;
  labels:string[]; labelColor?:string;
  fontSize?:number; fontWeight?:string;
  opacity?:number; style?:React.CSSProperties;
}) {
  const lineH = fontSize * 1.3;
  const totalH = labels.length * lineH;
  const startY = y + h / 2 - totalH / 2 + fontSize * 0.75;
  return (
    <g opacity={opacity} style={style}>
      <rect x={x} y={y} width={w} height={h} rx={rx}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {labels.map((l, i) => (
        <text key={i} x={x + w / 2} y={startY + i * lineH}
          textAnchor="middle" fill={labelColor}
          fontSize={fontSize} fontWeight={fontWeight}
          fontFamily="'Inter','Space Grotesk',sans-serif"
        >{l}</text>
      ))}
    </g>
  );
}

function Dot({ cx, cy, r = 4, fill = C.dot, style = {} }: {
  cx:number; cy:number; r?:number; fill?:string; style?:React.CSSProperties;
}) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} style={style} />;
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP FLOWCHART COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function PirateMapDesktop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // desc for hover info bar
  const stageDescs: Record<string,string> = {
    s1: 'Langkah awal bergabung: isi formulir pendaftaran & ikuti orientasi dasar NEWGAME.',
    s2: 'Ikuti sesi belajar mingguan, event wajib organisasi, dan mini project kelompok.',
    s3: 'Penilaian kelayakan berdasarkan akumulasi EXP, tingkat kehadiran, dan hasil project.',
    s4: 'Associate Member bisa memilih jalur: mengerjakan project nyata atau menjadi trainer.',
    s5: 'Puncak alur — Soldat siap mewakili NEWGAME di kompetisi game dev nasional!',
  };
  const activeDesc = hoveredStage ? stageDescs[hoveredStage] : 'Hover pada tahap untuk melihat detail alur anggota NEWGAME.';

  // Animation helpers
  const lineStyle = (delay: number): React.CSSProperties => ({
    strokeDashoffset: revealed ? 0 : 999,
    strokeDasharray: 999,
    transition: `stroke-dashoffset 0.7s ${delay}s cubic-bezier(0.4,0,0.2,1)`,
  });
  const nodeStyle = (delay: number): React.CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateX(0)' : 'translateX(-18px)',
    transition: `opacity 0.5s ${delay}s ease, transform 0.5s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
  });
  const dotStyle = (delay: number): React.CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: `scale(${revealed ? 1 : 0})`,
    transformOrigin: 'center',
    transition: `opacity 0.3s ${delay}s, transform 0.3s ${delay}s cubic-bezier(0.34,1.56,0.64,1)`,
  });

  return (
    <section style={{ padding: '72px 32px', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <p className="section-badge">Alur</p>
        <h2 className="section-title">Pemetaan Alur Anggota</h2>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: 'var(--novel-cloud)', marginTop: 8, maxWidth: 440, margin: '8px auto 0' }}>
          Diagram alur bergabung hingga menjadi anggota inti NEWGAME
        </p>
      </div>

      {/* Chart wrapper */}
      <div ref={containerRef} style={{
        maxWidth: 920, margin: '0 auto',
        background: 'linear-gradient(150deg, rgba(11,15,22,0.98) 0%, rgba(18,26,42,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(253,207,65,0.03)',
      }}>
        {/* Top accent bar */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, #9E2A2B, #FDCF41, #1a6b5a, #1a486b, transparent)',
        }} />

        {/* SVG diagram */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ display: 'block', overflow: 'visible', userSelect: 'none' }}
        >
          {/* Grid dots background */}
          <defs>
            <pattern id="ng-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.03)" />
            </pattern>
            {/* Glow filter */}
            <filter id="ng-glow">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Arrow markers */}
            {['rgba(255,255,255,0.4)', C.yes, C.no, C.p5, C.term].map((c, i) => (
              <marker key={i} id={`arr${i}`} viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="5" markerHeight="5" orient="auto">
                <path d="M1 1L9 5L1 9" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
              </marker>
            ))}
          </defs>

          <rect width={VW} height={VH} fill="url(#ng-grid)" />

          {/* ── ROOT NODE ── */}
          <NodeRect
            x={10} y={SY.s1 + (SY.s5 - SY.s1)/2 - 20}
            w={95} h={40} rx={10}
            fill={C.root} stroke={C.rootBdr} strokeWidth={2}
            labels={['NEWGAME']}
            fontSize={11} fontWeight="800"
            style={nodeStyle(0)}
          />
          {/* Root connector horizontal */}
          <line x1={105} y1={SY.s1 + (SY.s5 - SY.s1)/2}
                x2={135} y2={SY.s1 + (SY.s5 - SY.s1)/2}
                stroke={C.line} strokeWidth={1.5} style={lineStyle(0.1)} />
          <Dot cx={135} cy={SY.s1 + (SY.s5 - SY.s1)/2} style={dotStyle(0.15)} />
          {/* Main vertical spine */}
          <line x1={135} y1={SY.s1} x2={135} y2={SY.s5}
                stroke={C.line} strokeWidth={1.5} style={lineStyle(0.2)} />

          {/* ── STAGE NODES + THEIR BRANCHES ── */}
          {STAGES.map((stage, si) => {
            const isHov = hoveredStage === stage.id;
            const dimmed = hoveredStage && !isHov;
            const stageSecs = SEC_NODES.filter(s => s.stageId === stage.id);
            const secTopY = Math.min(...stageSecs.map(s => s.cy));
            const secBotY = Math.max(...stageSecs.map(s => s.cy));
            const stageDelay = 0.3 + si * 0.12;

            return (
              <g key={stage.id} opacity={dimmed ? 0.3 : 1}
                style={{ transition: 'opacity 0.3s', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredStage(stage.id)}
                onMouseLeave={() => setHoveredStage(null)}>

                {/* Spine → stage horizontal connector */}
                <line x1={135} y1={stage.cy} x2={152} y2={stage.cy}
                      stroke={isHov ? stage.color : C.line} strokeWidth={isHov ? 2 : 1.5}
                      style={{ ...lineStyle(stageDelay), transition: `stroke-dashoffset 0.7s ${stageDelay}s ease, stroke 0.25s` }} />
                <Dot cx={143} cy={stage.cy} r={4} fill={isHov ? stage.color : C.dot}
                     style={{ ...dotStyle(stageDelay + 0.05), transition: `opacity 0.3s ${stageDelay + 0.05}s, transform 0.3s, fill 0.25s` }} />

                {/* Stage node */}
                <NodeRect
                  x={152} y={stage.cy - 18} w={118} h={36} rx={8}
                  fill={isHov ? stage.color : `${stage.color}CC`}
                  stroke={isHov ? '#FDCF4199' : `${stage.color}55`}
                  strokeWidth={isHov ? 2 : 1.5}
                  labels={stage.label}
                  fontSize={11} fontWeight="700"
                  style={{
                    ...nodeStyle(stageDelay + 0.05),
                    filter: isHov ? 'url(#ng-glow)' : undefined,
                    transition: `opacity 0.5s ${stageDelay + 0.05}s ease, transform 0.5s, fill 0.25s, filter 0.25s`,
                  }}
                />

                {/* Stage right-dot & branch junction */}
                <Dot cx={CX.junc1 - 8} cy={stage.cy} r={4} fill={isHov ? stage.color : C.dot}
                     style={{ ...dotStyle(stageDelay + 0.1), transition: `opacity 0.3s ${stageDelay + 0.1}s, transform 0.3s, fill 0.25s` }} />
                <line x1={270} y1={stage.cy} x2={CX.junc1} y2={stage.cy}
                      stroke={isHov ? stage.color : C.line} strokeWidth={isHov ? 2 : 1.5}
                      style={{ ...lineStyle(stageDelay + 0.1), transition: `stroke-dashoffset 0.7s ${stageDelay + 0.1}s ease, stroke 0.25s` }} />
                <Dot cx={CX.junc1} cy={stage.cy} r={3.5} fill={isHov ? stage.color : C.dot}
                     style={{ ...dotStyle(stageDelay + 0.15), transition: `opacity 0.3s ${stageDelay + 0.15}s, transform 0.3s, fill 0.25s` }} />

                {/* Vertical secondary branch line */}
                {stageSecs.length > 1 && (
                  <line x1={CX.junc1} y1={secTopY} x2={CX.junc1} y2={secBotY}
                        stroke={isHov ? stage.color : C.line} strokeWidth={1.5}
                        style={{ ...lineStyle(stageDelay + 0.15), transition: `stroke-dashoffset 0.7s ${stageDelay + 0.15}s ease, stroke 0.25s` }} />
                )}

                {/* Secondary nodes */}
                {stageSecs.map((sec, seci) => {
                  const secDelay = stageDelay + 0.18 + seci * 0.07;
                  const isElig = sec.label[0] === 'Eligible?';
                  const isTerm = sec.special === 'term';
                  const terItems = TER_NODES.filter(t =>
                    t.secIdx === SEC_NODES.indexOf(sec)
                  );

                  return (
                    <g key={seci}>
                      {/* Branch → secondary horizontal */}
                      <line x1={CX.junc1} y1={sec.cy} x2={CX.sec} y2={sec.cy}
                            stroke={isHov ? stage.color : C.line} strokeWidth={1.5}
                            style={{ ...lineStyle(secDelay), transition: `stroke-dashoffset 0.7s ${secDelay}s ease, stroke 0.25s` }} />
                      <Dot cx={CX.junc1 + 4} cy={sec.cy} r={3} fill={isHov ? stage.color : C.dot}
                           style={{ ...dotStyle(secDelay + 0.05), transition: `opacity 0.3s ${secDelay + 0.05}s, transform 0.3s, fill 0.25s` }} />

                      {/* Secondary node */}
                      <NodeRect
                        x={CX.sec} y={sec.cy - 15} w={108} h={30} rx={6}
                        fill={isElig ? `${C.term}22` : isTerm ? `${C.term}22` : `${C.sec}`}
                        stroke={isElig ? C.term : isTerm ? C.term : (isHov ? `${stage.color}88` : C.secBdr)}
                        strokeWidth={isElig || isTerm ? 1.5 : 1}
                        labels={sec.label}
                        labelColor={isElig ? C.term : isTerm ? C.term : C.txt}
                        fontSize={9.5} fontWeight={isElig || isTerm ? '700' : '500'}
                        style={{
                          ...nodeStyle(secDelay + 0.05),
                          transition: `opacity 0.5s ${secDelay + 0.05}s, transform 0.5s, stroke 0.25s`,
                        }}
                      />

                      {/* Right dot for secondary if it has tertiary children */}
                      {terItems.length > 0 && (
                        <>
                          <Dot cx={CX.junc2 - 8} cy={sec.cy} r={3}
                               fill={isHov ? stage.color : C.dot}
                               style={{ ...dotStyle(secDelay + 0.1), transition: `opacity 0.3s ${secDelay + 0.1}s, transform 0.3s, fill 0.25s` }} />
                          <line x1={CX.sec + 108} y1={sec.cy} x2={CX.junc2} y2={sec.cy}
                                stroke={isHov ? stage.color : C.line} strokeWidth={1.5}
                                style={{ ...lineStyle(secDelay + 0.1), transition: `stroke-dashoffset 0.7s ${secDelay + 0.1}s ease, stroke 0.25s` }} />
                          <Dot cx={CX.junc2} cy={sec.cy} r={3}
                               fill={isHov ? stage.color : C.dot}
                               style={{ ...dotStyle(secDelay + 0.12), transition: `opacity 0.3s ${secDelay + 0.12}s, transform 0.3s, fill 0.25s` }} />

                          {/* Vert line for tertiary if multiple */}
                          {terItems.length > 1 && (
                            <line x1={CX.junc2} y1={terItems[0].cy} x2={CX.junc2} y2={terItems[terItems.length - 1].cy}
                                  stroke={C.line} strokeWidth={1.2}
                                  style={lineStyle(secDelay + 0.14)} />
                          )}

                          {/* Tertiary nodes */}
                          {terItems.map((ter, teri) => {
                            const terDelay = secDelay + 0.16 + teri * 0.06;
                            const terColor = ter.color ?? C.sec;
                            return (
                              <g key={teri}>
                                <line x1={CX.junc2} y1={ter.cy} x2={CX.ter} y2={ter.cy}
                                      stroke={ter.dashed ? ter.color ?? C.line : C.line}
                                      strokeWidth={1.5}
                                      strokeDasharray={ter.dashed ? '5 4' : undefined}
                                      style={lineStyle(terDelay)} />
                                {ter.labelTag && (
                                  <text x={CX.junc2 + 10} y={ter.cy - 4}
                                        fill={ter.labelColor ?? C.txtMuted}
                                        fontSize={9} fontWeight="700"
                                        fontFamily="'Inter',sans-serif">
                                    {ter.labelTag}
                                  </text>
                                )}
                                <Dot cx={CX.ter - 4} cy={ter.cy} r={3}
                                     fill={terColor}
                                     style={dotStyle(terDelay + 0.04)} />
                                <NodeRect
                                  x={CX.ter} y={ter.cy - 14} w={104} h={28} rx={6}
                                  fill={`${terColor}18`}
                                  stroke={terColor}
                                  strokeWidth={1.2}
                                  labels={ter.label}
                                  labelColor={terColor}
                                  fontSize={9} fontWeight="600"
                                  style={nodeStyle(terDelay + 0.04)}
                                />
                              </g>
                            );
                          })}
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* ── STEP NUMBER LABELS beside each stage ── */}
          {STAGES.map((stage, i) => (
            <text key={i}
              x={163} y={stage.cy + 1}
              fill={`${stage.color}BB`}
              fontSize={7.5} fontWeight="800"
              fontFamily="'Inter',sans-serif"
              textAnchor="start"
              opacity={revealed ? 0.9 : 0}
              style={{ transition: `opacity 0.4s ${0.35 + i * 0.12}s` }}
            >
              0{i + 1}
            </text>
          ))}
        </svg>

        {/* Info bar */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 12,
          minHeight: 54,
          background: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: hoveredStage
              ? STAGES.find(s => s.id === hoveredStage)?.color ?? C.dot
              : 'rgba(255,255,255,0.15)',
            boxShadow: hoveredStage
              ? `0 0 8px ${STAGES.find(s => s.id === hoveredStage)?.color ?? '#fff'}88`
              : 'none',
            transition: 'all 0.3s',
          }} />
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-inter)', fontSize: 12.5,
            color: hoveredStage ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
            lineHeight: 1.5,
            transition: 'color 0.3s',
          }}>{activeDesc}</p>
          {hoveredStage && (
            <span style={{
              marginLeft: 'auto', flexShrink: 0,
              fontFamily: 'var(--font-inter)', fontSize: 9, fontWeight: 800,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: STAGES.find(s => s.id === hoveredStage)?.color ?? C.dot,
            }}>
              {STAGES.find(s => s.id === hoveredStage)?.label.join(' ')}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE FALLBACK — clean step list
   ═══════════════════════════════════════════════════════════════ */
const MOBILE_STEPS = [
  { num:1, label:'Trainee',        color: C.p1, items:['Formulir Daftar','Orientasi NEWGAME'] },
  { num:2, label:'Training Phase', color: C.p2, items:['Weekly Study','Event Wajib','Mini Project'] },
  { num:3, label:'Penilaian',      color: C.p3, items:['EXP & Kehadiran','Eligible? → YES/NO'] },
  { num:4, label:'Associate',      color: C.p4, items:['Start Project','Be Trainer'] },
  { num:5, label:'Soldat',         color: C.p5, items:['Join Comp. Nasional','GameJam'] },
];

function PirateMapMobile() {
  return (
    <section style={{ padding: '52px 20px', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign:'center', marginBottom: 28 }}>
        <p className="section-badge">Alur</p>
        <h2 className="section-title">Pemetaan Alur Anggota</h2>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 12, maxWidth: 440, margin:'0 auto' }}>
        {MOBILE_STEPS.map((s, i) => (
          <div key={i} style={{
            borderRadius: 14,
            background: 'rgba(255,255,255,0.02)',
            border: `1.5px solid ${s.color}30`,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              background: `${s.color}20`,
              borderBottom: `1px solid ${s.color}25`,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: s.color,
                display: 'flex', alignItems:'center', justifyContent:'center',
                fontSize: 12, fontWeight: 800, color: '#f5f0e8',
                fontFamily: 'var(--font-inter)',
                boxShadow: `0 0 12px ${s.color}55`,
                flexShrink: 0,
              }}>{s.num}</div>
              <span style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 14, fontWeight: 700,
                color: 'var(--novel-ink)',
              }}>{s.label}</span>
            </div>
            <div style={{ padding: '10px 16px 12px 58px', display:'flex', flexDirection:'column', gap: 5 }}>
              {s.items.map((item, ii) => (
                <span key={ii} style={{
                  fontFamily: 'var(--font-inter)', fontSize: 12,
                  color: 'var(--novel-cloud)',
                }}>• {item}</span>
              ))}
            </div>
          </div>
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
