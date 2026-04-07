// pages/TitleScreen.jsx
import { useState, useEffect, useRef } from 'react'
import sentences from '../data/sentences.json'
import { PotatoMascot } from '../components/PotatoMascot'
import { useTheme } from '../context/ThemeContext'
import { themes } from '../themes'

const LEVELS = ['A1', 'A2', 'B1']
const CATEGORIES = [...new Set(sentences.map(s => s.category))]
const SCENES = [...new Set(sentences.filter(s => s.scene).map(s => s.scene))]

export function TitleScreen({ onStart }) {
  const [expanded, setExpanded] = useState(null)
  const { themeId, setTheme } = useTheme()

  const toggle = (key) => setExpanded(prev => prev === key ? null : key)

  const start = (filter) => {
    let filtered
    if (!filter) {
      filtered = sentences
    } else if (filter.level) {
      filtered = sentences.filter(s => s.level === filter.level)
    } else if (filter.category) {
      filtered = sentences.filter(s => s.category === filter.category)
    } else {
      filtered = sentences.filter(s => s.scene === filter.scene)
    }
    onStart(filtered)
  }

  return (
    <div className="title-screen" style={{
      background: 'var(--bg)', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: "'Barlow', sans-serif",
      padding: '40px 24px',
    }}>
      <div className="title-content" style={{
        width: '100%', maxWidth: 400,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>

        {/* ── Mascot ── */}
        <MascotWithBubble />

        {/* ── Logo ── */}
        <div className="logo" style={{ textAlign: 'center' }}>
          <div className="logo-title" style={{
            fontFamily: "'Paytone One', sans-serif",
            fontSize: 56, letterSpacing: '-1px', color: 'var(--text)',
            lineHeight: 1,
          }}>
            Pommes
          </div>
          <div className="logo-subtitle" style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase',
            color: 'var(--text-sub)', marginTop: 8,
          }}>
            瞬間ドイツ語作文
          </div>
        </div>

        {/* ── Buttons ── */}
        <div className="start-buttons" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>

          <button onClick={() => start(null)} style={solidBtn}>
            すぐはじめる
          </button>

          <div>
            <button onClick={() => toggle('level')} style={expanded === 'level' ? ghostBtnActive : ghostBtn}>
              レベルから選ぶ
              <Chevron open={expanded === 'level'} />
            </button>
            {expanded === 'level' && (
              <div style={subPanelStyle}>
                {LEVELS.map(lv => (
                  <button key={lv} onClick={() => start({ level: lv })} style={subItemBtn}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{lv}</span>
                    <span style={{ color: 'var(--text-sub)', fontSize: 11 }}>
                      {sentences.filter(s => s.level === lv).length}問
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <button onClick={() => toggle('category')} style={expanded === 'category' ? ghostBtnActive : ghostBtn}>
              カテゴリから選ぶ
              <Chevron open={expanded === 'category'} />
            </button>
            {expanded === 'category' && (
              <div style={subPanelStyle}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => start({ category: cat })} style={subItemBtn}>
                    <span>{cat}</span>
                    <span style={{ color: 'var(--text-sub)', fontSize: 11 }}>
                      {sentences.filter(s => s.category === cat).length}問
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <button onClick={() => toggle('scene')} style={expanded === 'scene' ? ghostBtnActive : ghostBtn}>
              シーンから選ぶ
              <Chevron open={expanded === 'scene'} />
            </button>
            {expanded === 'scene' && (
              <div style={subPanelStyle}>
                {SCENES.map(sc => {
                  const count = sentences.filter(s => s.scene === sc).length
                  if (count === 0) return null
                  return (
                    <button key={sc} onClick={() => start({ scene: sc })} style={subItemBtn}>
                      <span>{sc}</span>
                      <span style={{ color: 'var(--text-sub)', fontSize: 11 }}>{count}問</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── Theme picker ── */}
        <div className="theme-picker" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '1.5px',
            color: 'var(--text-muted)',
          }}>
            テーマ
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {Object.entries(themes).map(([id, t]) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                title={t.name}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: t.swatch,
                  border: themeId === id
                    ? '3px solid var(--border-strong)'
                    : '2px solid var(--border)',
                  cursor: 'pointer', padding: 0,
                  boxShadow: themeId === id ? '0 0 0 2px var(--bg)' : 'none',
                  transition: 'all .15s',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.54px',
          textTransform: 'uppercase',
        }}>
          {sentences.length} Sätze · A1–B1
        </div>
      </div>
    </div>
  )
}

/* ── Speech bubble + mascot ── */
const GREETINGS = [
  'Hallo!',
  "Wie geht's?",
  'Guten Tag!',
  'Servus!',
  'Moin!',
  'Na?',
  'Willkommen!',
  "Los geht's!",
]

function MascotWithBubble() {
  const [text, setText] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setText(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div className="mascot-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="speech-bubble" style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity .25s ease',
        background: 'var(--surface)', color: 'var(--text)',
        fontFamily: "'Paytone One', sans-serif",
        fontSize: 14, padding: '7px 16px',
        borderRadius: 50, marginBottom: 10,
        whiteSpace: 'nowrap', position: 'relative',
      }}>
        {text}
        <span className="speech-bubble__tail" style={{
          position: 'absolute', bottom: -7, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '7px solid var(--surface)',
        }} />
      </div>
      <PotatoMascot />
    </div>
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
  background: 'var(--solid-bg)', border: 'none', color: 'var(--solid-text)',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50,
}
const ghostBtn = {
  width: '100%', padding: '13px 24px',
  background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text)',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400,
  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}
const ghostBtnActive = {
  ...ghostBtn,
  border: '2px solid var(--border-strong)',
}
const subPanelStyle = {
  marginTop: 6,
  border: '1px solid var(--border)',
  borderRadius: 12,
  overflow: 'hidden',
}
const subItemBtn = {
  width: '100%', padding: '12px 24px',
  background: 'var(--bg)', border: 'none', borderBottom: '1px solid var(--border)',
  color: 'var(--text)', fontFamily: "'Barlow', sans-serif", fontSize: 14,
  cursor: 'pointer', textAlign: 'left',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
