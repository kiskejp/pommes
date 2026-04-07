// components/CardMode.jsx
import { useEffect } from 'react'
import { AudioButton } from './AudioButton'

export function CardMode({ session, speak, speaking }) {
  const { current, revealed, showHint, revealAnswer, toggleHint, advance, reset } = session

  useEffect(() => {
    if (current) {
      const t = setTimeout(() => speak(current.jp_yomi ?? current.jp, 'ja'), 250)
      return () => clearTimeout(t)
    }
  }, [current?.id]) // eslint-disable-line

  const onReveal = () => {
    revealAnswer()
    setTimeout(() => speak(current.de, 'de'), 300)
  }

  return (
    <div className="card-mode" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card" style={cardStyle}>
        <Label>日本語</Label>
        <div className="card-jp" style={jpStyle}>{current.jp}</div>
        {showHint && <div className="card-hint" style={hintStyle}>{current.hint}</div>}
        <AudioButton speaking={speaking} onClick={() => speak(current.jp_yomi ?? current.jp, 'ja')} label="音声を聞く" />

        {revealed && (
          <div className="card-de-section" style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
            <Label>Deutsch</Label>
            <div className="card-de" style={deStyle}>{current.de}</div>
            <AudioButton speaking={speaking} onClick={() => speak(current.de, 'de')} label="Anhören" />
          </div>
        )}
      </div>

      {!revealed ? (
        <>
          <button className="btn-reveal" style={revealBtnStyle} onClick={onReveal}>ドイツ語を見る</button>
          <Nav onReset={reset} rightLabel="ヒントを見る" onRight={toggleHint} rightActive={showHint} />
        </>
      ) : (
        <>
          <div className="rate-buttons" style={{ display: 'flex', gap: 8 }}>
            <RateBtn variant="ghost" onClick={() => advance('ng')}>わからなかった</RateBtn>
            <RateBtn variant="solid" onClick={() => advance('ok')}>わかった</RateBtn>
          </div>
          <Nav onReset={reset} />
        </>
      )}
    </div>
  )
}

function Label({ children }) {
  return (
    <div className="card-label" style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
      textTransform: 'uppercase', letterSpacing: '1.5px',
      color: 'var(--text-sub)', marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function RateBtn({ variant, onClick, children }) {
  const solid = variant === 'solid'
  return (
    <button className={`btn-rate btn-rate--${variant}`} onClick={onClick} style={{
      flex: 1, padding: '14px 10px',
      background: solid ? 'var(--solid-bg)' : 'var(--bg)',
      border: '2px solid var(--border-strong)',
      color: solid ? 'var(--solid-text)' : 'var(--text)',
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
    border: `2px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
    color: active ? 'var(--text)' : 'var(--text-sub)',
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
    padding: '8px 16px', cursor: 'pointer',
    textTransform: 'uppercase', letterSpacing: '0.54px',
    borderRadius: 50, transition: 'all .15s',
  })
  return (
    <div className="card-nav" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <button className="btn-reset" onClick={onReset} style={ghostStyle(false)}>最初から</button>
      {rightLabel && (
        <button className={`btn-hint ${rightActive ? 'btn-hint--active' : ''}`} onClick={onRight} style={ghostStyle(rightActive)}>
          {rightActive ? 'ヒントを隠す' : rightLabel}
        </button>
      )}
    </div>
  )
}

const cardStyle = {
  background: 'var(--surface)', borderRadius: 16,
  padding: '36px 32px', minHeight: 180,
}
const jpStyle = {
  fontFamily: "'Barlow', sans-serif", fontWeight: 600,
  fontSize: 'clamp(22px, 4.5vw, 32px)', lineHeight: 1.4,
  color: 'var(--text)', letterSpacing: '-0.26px',
}
const hintStyle = {
  fontSize: 13, color: 'var(--text-sub)', fontStyle: 'italic',
  marginTop: 12, letterSpacing: '-0.14px',
}
const deStyle = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 'clamp(22px, 4.5vw, 32px)', fontWeight: 600,
  color: 'var(--text)', lineHeight: 1.4, letterSpacing: '-0.26px',
}
const revealBtnStyle = {
  width: '100%', padding: 18,
  background: 'var(--solid-bg)', border: 'none', color: 'var(--solid-text)',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50,
}
