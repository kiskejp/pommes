// components/CardMode.jsx
import { useEffect } from 'react'
import { AudioButton } from './AudioButton'

export function CardMode({ session, speak, speaking }) {
  const { current, revealed, showHint, revealAnswer, toggleHint, advance, reset } = session

  useEffect(() => {
    if (current) {
      const t = setTimeout(() => speak(current.jp, 'ja'), 250)
      return () => clearTimeout(t)
    }
  }, [current?.id]) // eslint-disable-line

  const onReveal = () => {
    revealAnswer()
    setTimeout(() => speak(current.de, 'de'), 300)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* card */}
      <div style={cardStyle}>
        <Label>日本語</Label>
        <div style={jpStyle}>{current.jp}</div>
        {showHint && (
          <div style={hintStyle}>{current.hint}</div>
        )}
        <AudioButton speaking={speaking} onClick={() => speak(current.jp, 'ja')} label="音声を聞く" />

        {revealed && (
          <div style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid #e8e8e8' }}>
            <Label>Deutsch</Label>
            <div style={deStyle}>{current.de}</div>
            <AudioButton speaking={speaking} onClick={() => speak(current.de, 'de')} label="Anhören" />
          </div>
        )}
      </div>

      {!revealed ? (
        <>
          <button style={revealBtnStyle} onClick={onReveal}>ドイツ語を見る</button>
          <Nav onReset={reset} rightLabel="ヒントを見る" onRight={toggleHint} rightActive={showHint} />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <RateBtn variant="ghost" onClick={() => advance('ng')}>わからなかった</RateBtn>
            <RateBtn variant="solid" onClick={() => advance('ok')}>わかった</RateBtn>
          </div>
          <Nav onReset={reset} />
        </>
      )}
    </div>
  )
}

/* ── helpers ── */
function Label({ children }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
      textTransform: 'uppercase', letterSpacing: '1.5px',
      color: '#999999', marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function RateBtn({ variant, onClick, children }) {
  const solid = variant === 'solid'
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '14px 10px',
      background: solid ? '#000000' : '#ffffff',
      border: '1px solid #000000',
      color: solid ? '#ffffff' : '#000000',
      fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
      fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.54px',
      cursor: 'pointer', borderRadius: 50, transition: 'all .15s',
    }}>
      {children}
    </button>
  )
}

function Nav({ onReset, rightLabel, onRight, rightActive }) {
  const ghostStyle = (active) => ({
    background: 'none',
    border: `1px solid ${active ? '#000000' : '#e8e8e8'}`,
    color: active ? '#000000' : '#999999',
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
    padding: '8px 16px', cursor: 'pointer',
    textTransform: 'uppercase', letterSpacing: '0.54px',
    borderRadius: 50, transition: 'all .15s',
  })
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <button onClick={onReset} style={ghostStyle(false)}>最初から</button>
      {rightLabel && (
        <button onClick={onRight} style={ghostStyle(rightActive)}>
          {rightActive ? 'ヒントを隠す' : rightLabel}
        </button>
      )}
    </div>
  )
}

/* ── styles ── */
const cardStyle = {
  background: '#f8f8f8', border: '1px solid #e8e8e8',
  padding: '36px 32px', minHeight: 180,
}
const jpStyle = {
  fontFamily: "'DM Serif Display', serif",
  fontSize: 'clamp(22px, 4.5vw, 32px)', lineHeight: 1.35,
  color: '#000000', letterSpacing: '-0.26px',
}
const hintStyle = {
  fontSize: 13, color: '#999999', fontStyle: 'italic',
  marginTop: 12, letterSpacing: '-0.14px',
}
const deStyle = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 'clamp(18px, 3.5vw, 26px)', fontWeight: 600,
  color: '#000000', lineHeight: 1.4, letterSpacing: '-0.26px',
}
const revealBtnStyle = {
  width: '100%', padding: 18,
  background: '#000000', border: 'none', color: '#ffffff',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50, transition: 'opacity .15s',
}
