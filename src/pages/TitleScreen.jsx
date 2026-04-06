// pages/TitleScreen.jsx
import { useState } from 'react'
import sentences from '../data/sentences.json'

const LEVELS = ['A1', 'A2', 'B1']
const CATEGORIES = [...new Set(sentences.map(s => s.category))]

export function TitleScreen({ onStart }) {
  const [expanded, setExpanded] = useState(null) // null | 'level' | 'category'

  const toggle = (key) => setExpanded(prev => prev === key ? null : key)

  const start = (filter) => {
    const filtered = filter
      ? sentences.filter(s => s.level === filter.level || s.category === filter.category)
      : sentences
    onStart(filtered)
  }

  return (
    <div style={{
      background: '#ffffff', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: "'Barlow', sans-serif",
      padding: '40px 24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>

        {/* ── Mascot ── */}
        <PotatoMascot />

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 52, letterSpacing: '-1.72px', color: '#000000',
            lineHeight: 1, fontStyle: 'italic',
          }}>
            Pommes
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
            color: '#999999', marginTop: 8,
          }}>
            瞬間Deutsch作文
          </div>
        </div>

        {/* ── Buttons ── */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* すぐはじめる */}
          <button
            onClick={() => start(null)}
            style={solidBtn}
          >
            すぐはじめる
          </button>

          {/* レベルを選ぶ */}
          <div>
            <button
              onClick={() => toggle('level')}
              style={expanded === 'level' ? ghostBtnActive : ghostBtn}
            >
              レベルを選ぶ
              <Chevron open={expanded === 'level'} />
            </button>
            {expanded === 'level' && (
              <div style={subPanelStyle}>
                {LEVELS.map(lv => (
                  <button
                    key={lv}
                    onClick={() => start({ level: lv })}
                    style={subItemBtn}
                  >
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{lv}</span>
                    <span style={{ color: '#999999', fontSize: 11 }}>
                      {sentences.filter(s => s.level === lv).length}問
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* カテゴリを選ぶ */}
          <div>
            <button
              onClick={() => toggle('category')}
              style={expanded === 'category' ? ghostBtnActive : ghostBtn}
            >
              カテゴリを選ぶ
              <Chevron open={expanded === 'category'} />
            </button>
            {expanded === 'category' && (
              <div style={subPanelStyle}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => start({ category: cat })}
                    style={subItemBtn}
                  >
                    <span>{cat}</span>
                    <span style={{ color: '#999999', fontSize: 11 }}>
                      {sentences.filter(s => s.category === cat).length}問
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Footer ── */}
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, color: '#cccccc', letterSpacing: '0.54px',
          textTransform: 'uppercase',
        }}>
          {sentences.length} Sätze · A1–B1
        </div>
      </div>
    </div>
  )
}

/* ── Potato mascot (8-bit SVG) ── */
function PotatoMascot() {
  return (
    <svg
      width={96} height={96} viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* body */}
      <rect x="4" y="3" width="8" height="9" rx="0" fill="#d4a96a" />
      <rect x="3" y="4" width="10" height="7" rx="0" fill="#d4a96a" />
      <rect x="4" y="4" width="8" height="7" rx="0" fill="#e0bc85" />
      {/* shadow/depth */}
      <rect x="4" y="10" width="8" height="2" fill="#b8904f" />
      <rect x="3" y="9"  width="1" height="2" fill="#b8904f" />
      <rect x="12" y="9" width="1" height="2" fill="#b8904f" />
      {/* eyes */}
      <rect x="6"  y="6" width="1" height="2" fill="#000000" />
      <rect x="9"  y="6" width="1" height="2" fill="#000000" />
      {/* mouth */}
      <rect x="6"  y="9" width="4" height="1" fill="#000000" />
      <rect x="7"  y="9" width="2" height="1" fill="#000000" />
      {/* sprout */}
      <rect x="7"  y="1" width="2" height="2" fill="#6db56d" />
      <rect x="6"  y="2" width="1" height="1" fill="#6db56d" />
      <rect x="9"  y="2" width="1" height="1" fill="#6db56d" />
      {/* arms */}
      <rect x="2"  y="6" width="1" height="2" fill="#d4a96a" />
      <rect x="13" y="6" width="1" height="2" fill="#d4a96a" />
      {/* legs */}
      <rect x="5"  y="12" width="2" height="1" fill="#b8904f" />
      <rect x="9"  y="12" width="2" height="1" fill="#b8904f" />
    </svg>
  )
}

/* ── Chevron icon ── */
function Chevron({ open }) {
  return (
    <svg
      width={12} height={12} viewBox="0 0 12 12" fill="none"
      style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Styles ── */
const solidBtn = {
  width: '100%', padding: '15px 24px',
  background: '#000000', border: 'none', color: '#ffffff',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50,
}
const ghostBtn = {
  width: '100%', padding: '13px 24px',
  background: '#ffffff', border: '1px solid #e8e8e8', color: '#000000',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400,
  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}
const ghostBtnActive = {
  ...ghostBtn,
  border: '1px solid #000000',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
}
const subPanelStyle = {
  border: '1px solid #000000', borderTop: 'none',
  borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
  overflow: 'hidden',
}
const subItemBtn = {
  width: '100%', padding: '12px 24px',
  background: '#ffffff', border: 'none', borderBottom: '1px solid #f0f0f0',
  color: '#000000', fontFamily: "'Barlow', sans-serif", fontSize: 14,
  cursor: 'pointer', textAlign: 'left',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
