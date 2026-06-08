'use client';
// Pirate Map — NEWGAME Learning Roadmap
// IA-style tree diagram: dark theme, gold accents, animated connections
import { useState } from 'react';

/* ─── Data ─────────────────────────────────────────────────────── */
interface L3Node { label: string; done?: boolean; }
interface L2Node { label: string; icon: string; items: L3Node[]; }
interface L1Node {
  id: string; label: string; icon: string; color: string;
  description: string; children: L2Node[];
}

const MAP: L1Node[] = [
  {
    id: 'onboarding', label: 'Onboarding', icon: 'ri-door-open-line',
    color: '#FDCF41', description: 'Bergabung & kenali komunitas',
    children: [
      { label: 'Registrasi', icon: 'ri-user-add-line', items: [
        { label: 'Buat Akun Portal' }, { label: 'Verifikasi Email' }, { label: 'Lengkapi Profil' },
      ]},
      { label: 'Orientasi', icon: 'ri-compass-3-line', items: [
        { label: 'Kenali Dashboard' }, { label: 'Scan QR Pertama' }, { label: 'Raih Badge Baru' },
      ]},
    ],
  },
  {
    id: 'foundation', label: 'Foundation', icon: 'ri-book-2-line',
    color: '#B9A6CE', description: 'Dasar-dasar game development',
    children: [
      { label: 'Game Design', icon: 'ri-layout-2-line', items: [
        { label: 'Konsep GDD' }, { label: 'Level Design' }, { label: 'Game Balancing' },
      ]},
      { label: 'Visual & Audio', icon: 'ri-palette-line', items: [
        { label: 'Pixel Art Dasar' }, { label: 'Sound FX' }, { label: 'Animasi Sprite' },
      ]},
    ],
  },
  {
    id: 'programming', label: 'Programming', icon: 'ri-code-s-slash-line',
    color: '#60a5fa', description: 'Skill coding untuk game',
    children: [
      { label: 'GDScript', icon: 'ri-terminal-box-line', items: [
        { label: 'Syntax Dasar' }, { label: 'Nodes & Signals' }, { label: 'State Machine' },
      ]},
      { label: 'Web Dev', icon: 'ri-global-line', items: [
        { label: 'HTML/CSS' }, { label: 'JavaScript' }, { label: 'Next.js Basics' },
      ]},
    ],
  },
  {
    id: 'engine', label: 'Game Engine', icon: 'ri-game-line',
    color: '#4ade80', description: 'Kuasai engine pilihan',
    children: [
      { label: 'Godot 4', icon: 'ri-rocket-2-line', items: [
        { label: 'Scene System' }, { label: 'Physics 2D/3D' }, { label: 'Shader Graph' },
      ]},
      { label: 'Unity', icon: 'ri-settings-4-line', items: [
        { label: 'C# Scripts' }, { label: 'Prefabs & Inspector' }, { label: 'Asset Store' },
      ]},
    ],
  },
  {
    id: 'advanced', label: 'Advanced', icon: 'ri-rocket-line',
    color: '#f97316', description: 'Fitur kompleks & AI',
    children: [
      { label: 'AI Gameplay', icon: 'ri-brain-line', items: [
        { label: 'Pathfinding A*' }, { label: 'Behavior Tree' }, { label: 'NavMesh' },
      ]},
      { label: 'Multiplayer', icon: 'ri-wifi-line', items: [
        { label: 'Netcode Dasar' }, { label: 'Lobby System' }, { label: 'Anti-Cheat' },
      ]},
    ],
  },
  {
    id: 'portfolio', label: 'Portfolio', icon: 'ri-trophy-line',
    color: '#e879f9', description: 'Rilis & pamerkan karya',
    children: [
      { label: 'Game Jam', icon: 'ri-time-line', items: [
        { label: 'Prototype 48h' }, { label: 'Submit ke itch.io' }, { label: 'Review & Feedback' },
      ]},
      { label: 'Publishing', icon: 'ri-store-2-line', items: [
        { label: 'PlayStore / itch.io' }, { label: 'Trailer & Screenshot' }, { label: 'Community Share' },
      ]},
    ],
  },
];

/* ─── Node Components ───────────────────────────────────────────── */
function L3Item({ item }: { item: L3Node }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 10px', borderRadius: 6,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      fontSize: 12, color: 'var(--clr-text-secondary)',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--clr-border)', flexShrink: 0,
        border: '1.5px solid rgba(255,255,255,0.2)',
      }} />
      {item.label}
    </div>
  );
}

function L2Card({ node, accentColor }: { node: L2Node; accentColor: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      {/* Connector dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: accentColor, flexShrink: 0,
          boxShadow: `0 0 8px ${accentColor}60`,
        }} />
        <div style={{ width: 1, flex: 1, background: `${accentColor}30`, minHeight: 20 }} />
      </div>

      <div>
        {/* L2 box */}
        <div style={{
          padding: '7px 14px', borderRadius: 8, marginBottom: 8,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${accentColor}40`,
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 13, color: 'var(--clr-text-primary)', fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          <i className={node.icon} style={{ fontSize: 14, color: accentColor }} />
          {node.label}
        </div>

        {/* L3 items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
          {node.items.map((item, i) => (
            <L3Item key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function PirateMapPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #FDCF41, #f0a500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px #FDCF4160',
          }}>
            <i className="ri-map-2-line" style={{ fontSize: 20, color: '#12121a' }} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-grotesk)', fontSize: 24, fontWeight: 800,
              color: 'var(--clr-text-primary)', letterSpacing: '-0.5px', margin: 0,
            }}>
              🗺️ Pirate Map
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--clr-text-secondary)' }}>
              Peta perjalanan belajar anggota NEWGAME Unand
            </p>
          </div>
        </div>
      </div>

      {/* Diagram Container */}
      <div style={{
        background: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        borderRadius: 20, padding: '32px 24px',
        overflowX: 'auto',
        minHeight: 500,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: 900 }}>

          {/* ROOT NODE */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, flexShrink: 0 }}>
            <div style={{
              padding: '14px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #1e1e2e, #2a2a3e)',
              border: '2px solid var(--clr-gold)',
              boxShadow: '0 0 24px var(--clr-gold-glow)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              cursor: 'default', userSelect: 'none',
            }}>
              <i className="ri-gamepad-line" style={{ fontSize: 24, color: '#FDCF41' }} />
              <span style={{
                fontFamily: 'var(--font-grotesk)', fontWeight: 800,
                fontSize: 13, color: 'var(--clr-text-primary)', letterSpacing: 1,
              }}>NEWGAME</span>
            </div>

            {/* Horizontal line from root */}
            <div style={{ width: 1, height: 0, position: 'relative' }} />
          </div>

          {/* Horizontal connector root → sections */}
          <div style={{
            width: 32, height: 2,
            background: 'linear-gradient(90deg, var(--clr-gold)80, var(--clr-border))',
            marginTop: 108, flexShrink: 0,
          }} />

          {/* VERTICAL SPINE + SECTIONS */}
          <div style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
            {/* Spine line */}
            <div style={{ width: 2, background: 'linear-gradient(180deg, transparent, var(--clr-border) 10%, var(--clr-border) 90%, transparent)', borderRadius: 2, flexShrink: 0 }} />

            {/* Sections column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {MAP.map((section, sIdx) => {
                const isActive = activeId === section.id;
                return (
                  <div key={section.id} style={{ display: 'flex', alignItems: 'flex-start' }}>

                    {/* Horizontal line from spine to L1 */}
                    <div style={{
                      width: 24, height: 2,
                      background: `${section.color}80`,
                      marginTop: 22, flexShrink: 0,
                    }} />

                    {/* L1 + Children row */}
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 0,
                      paddingBottom: sIdx < MAP.length - 1 ? 32 : 0,
                    }}>
                      {/* L1 Section Node */}
                      <div
                        onClick={() => setActiveId(isActive ? null : section.id)}
                        style={{
                          padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                          background: isActive
                            ? `linear-gradient(135deg, ${section.color}25, ${section.color}10)`
                            : 'rgba(255,255,255,0.04)',
                          border: `2px solid ${isActive ? section.color : section.color + '50'}`,
                          boxShadow: isActive ? `0 4px 20px ${section.color}30` : 'none',
                          display: 'flex', alignItems: 'center', gap: 8,
                          transition: 'all 0.25s ease',
                          flexShrink: 0, minWidth: 160,
                          transform: isActive ? 'translateX(2px)' : 'none',
                        }}
                      >
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                          background: `${section.color}20`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className={section.icon} style={{ fontSize: 15, color: section.color }} />
                        </div>
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-grotesk)', fontWeight: 700,
                            fontSize: 13, color: 'var(--clr-text-primary)',
                          }}>{section.label}</div>
                          <div style={{ fontSize: 10, color: 'var(--clr-text-secondary)', marginTop: 1 }}>
                            {section.description}
                          </div>
                        </div>
                        <i
                          className={isActive ? 'ri-arrow-right-s-line' : 'ri-arrow-right-s-line'}
                          style={{
                            fontSize: 14, color: section.color,
                            marginLeft: 'auto', flexShrink: 0,
                            transition: 'transform 0.25s',
                            transform: isActive ? 'rotate(0deg)' : 'rotate(0deg)',
                            opacity: isActive ? 1 : 0.4,
                          }}
                        />
                      </div>

                      {/* Horizontal connector L1 → L2 (only when active) */}
                      {isActive && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', animation: 'fadeInRight 0.25s ease' }}>
                          <div style={{
                            width: 28, height: 2, background: `${section.color}50`,
                            marginTop: 22, flexShrink: 0,
                          }} />

                          {/* L2 + L3 children */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 4 }}>
                            {section.children.map((child, cIdx) => (
                              <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                                <L2Card node={child} accentColor={section.color} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 20,
        padding: '16px 20px',
        background: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        borderRadius: 12,
      }}>
        <span style={{ fontSize: 12, color: 'var(--clr-text-secondary)', marginRight: 8, alignSelf: 'center' }}>
          <i className="ri-information-line" /> Klik kategori untuk expand detail
        </span>
        {MAP.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
            <span style={{ fontSize: 12, color: 'var(--clr-text-secondary)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
