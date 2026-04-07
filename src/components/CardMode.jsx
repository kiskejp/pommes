// components/CardMode.jsx
import { useEffect } from 'react'
import { RotateCcw, Lightbulb, Play, Pause } from 'lucide-react'
import { AudioButton } from './AudioButton'

export function CardMode({ session, speak, speaking, autoPlay, pauseDuration, onPauseDurationChange }) {
  const { current, revealed, showHint, revealAnswer, toggleHint, advance, reset } = session
  const playing = autoPlay?.isPlaying ?? false

  useEffect(() => {
    if (current && !playing) {
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

      {/* ── JP card ── */}
      <div className="card" style={cardStyle}>
        <Label>日本語</Label>
        <div className="card-jp" style={jpStyle}>{current.jp}</div>
        {showHint && <div className="card-hint" style={hintStyle}>{current.hint}</div>}
        {!playing && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <AudioButton speaking={speaking} onClick={() => speak(current.jp_yomi ?? current.jp, 'ja')} label="音声を聞く" style={{ marginTop: 0 }} />
            <button
              className={`btn-hint ${showHint ? 'btn-hint--active' : ''}`}
              onClick={toggleHint}
              style={{ ...subBtn, color: showHint ? 'var(--text)' : 'var(--text-sub)', display: 'flex', alignItems: 'center' }}
            >
              <Lightbulb size={12} strokeWidth={2} style={{ marginRight: 5 }} />
              {showHint ? 'ヒントを隠す' : 'ヒント'}
            </button>
          </div>
        )}

        {revealed && (
          <div className="card-de-section" style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
            <Label>Deutsch</Label>
            <div className="card-de" style={deStyle}>{current.de}</div>
            {!playing && (
              <AudioButton speaking={speaking} onClick={() => speak(current.de, 'de')} label="Anhören" />
            )}
          </div>
        )}
      </div>

      {/* ── Countdown bar (auto-play pause indicator) ── */}
      <div className="countdown-track" style={{
        height: 3, background: 'var(--surface)', borderRadius: 2,
        overflow: 'hidden',
        opacity: playing && autoPlay.countdown > 0 ? 1 : 0,
        transition: 'opacity .2s',
      }}>
        <div className="countdown-fill" style={{
          height: '100%',
          width: `${(autoPlay?.countdown ?? 0) * 100}%`,
          background: 'var(--solid-bg)',
          transition: 'width 0.04s linear',
        }} />
      </div>

      {/* ── Controls ── */}
      {playing ? (
        /* Auto-playing: show only stop button */
        <button
          className="btn-stop"
          onClick={autoPlay.stop}
          style={{ ...revealBtnStyle, background: 'var(--surface)', color: 'var(--text)', border: '2px solid var(--border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Pause size={14} strokeWidth={2} />
          停止
        </button>
      ) : !revealed ? (
        /* Not revealed */
        <>
          {/* 1段目: メインアクション */}
          <button className="btn-reveal" style={revealBtnStyle} onClick={onReveal}>ドイツ語を見る</button>

          {/* 2段目: 自動再生（中央寄せ） */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button className="btn-autoplay" onClick={autoPlay?.start} style={{ ...secondaryBtn, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Play size={13} strokeWidth={2} />
              自動再生
            </button>
          </div>

          {/* 3段目: ポーズ設定（中央寄せ） */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PauseStepper value={pauseDuration} onChange={onPauseDurationChange} />
          </div>

          {/* 4段目: 最初から（左） */}
          <div>
            <button className="btn-reset" onClick={reset} style={{ ...subBtn, display: 'inline-flex', alignItems: 'center' }}>
              <RotateCcw size={12} strokeWidth={2} style={{ marginRight: 5 }} />
              最初から
            </button>
          </div>
        </>
      ) : (
        /* Revealed: rate buttons */
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

/* ── Sub-components ── */

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

function Nav({ onReset }) {
  return (
    <div className="card-nav" style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <button className="btn-reset" onClick={onReset} style={{ ...subBtn, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <RotateCcw size={12} strokeWidth={2} />
        最初から
      </button>
    </div>
  )
}

function PauseStepper({ value, onChange }) {
  return (
    <div className="pause-stepper" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <button onClick={() => onChange(Math.max(1, value - 1))} style={subBtn}>－</button>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: 'var(--text-sub)', minWidth: 26, textAlign: 'center',
      }}>
        {value}s
      </span>
      <button onClick={() => onChange(Math.min(5, value + 1))} style={subBtn}>＋</button>
    </div>
  )
}

/* ── Styles ── */

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
  fontFamily: "'Barlow', sans-serif", fontWeight: 600,
  fontSize: 'clamp(22px, 4.5vw, 32px)',
  color: 'var(--text)', lineHeight: 1.4, letterSpacing: '-0.26px',
}
const revealBtnStyle = {
  width: '100%', padding: 18,
  background: 'var(--solid-bg)', border: 'none', color: 'var(--solid-text)',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50,
}
const secondaryBtn = {
  padding: '12px 32px',
  background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text)',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', borderRadius: 50, transition: 'all .15s',
}
const subBtn = {
  background: 'none', border: 'none', color: 'var(--text-sub)',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.54px',
  cursor: 'pointer', padding: '4px 8px',
}
