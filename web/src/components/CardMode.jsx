// components/CardMode.jsx
import { useEffect, useState, useRef, useCallback } from 'react'
import { RotateCcw, Lightbulb, Play, Pause, Bookmark } from 'lucide-react'
import { AudioButton } from './AudioButton'
import { RiveMascot } from './RiveMascot'

const MILESTONES = {
  10: 'Gut gemacht!',
  20: 'Weiter so!',
  30: 'Super!',
  50: 'Fantastisch!',
  100: 'Unglaublich!',
}

export function CardMode({ session, speak, speaking, autoPlay, pauseDuration, onPauseDurationChange, weakIds, addResult }) {
  const { current, revealed, showHint, revealAnswer, toggleHint, advance, reset, ok } = session
  const playing = autoPlay?.isPlaying ?? false
  const isWeak = weakIds?.isWeak(current?.id) ?? false

  const [toast, setToast] = useState(null) // { msg, variant, phase: 'enter'|'exit' }
  const toastTimers    = useRef([])
  const prevOkRef      = useRef(ok)
  const prevWasWrong   = useRef(false)

  const showToast = useCallback((msg, variant) => {
    toastTimers.current.forEach(fn => typeof fn === 'function' ? fn() : clearTimeout(fn))
    setToast({ msg, variant, phase: 'exit' })
    const rafId = { current: null }
    rafId.current = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setToast(t => t ? { ...t, phase: 'enter' } : null)
      )
    )
    const t2 = setTimeout(() => setToast(t => t ? { ...t, phase: 'exit' } : null), 3500)
    const t3 = setTimeout(() => setToast(null), 3900)
    toastTimers.current = [t2, t3, () => cancelAnimationFrame(rafId.current)]
  }, [])

  // Keyboard shortcuts (desktop)
  useEffect(() => {
    const onKey = (e) => {
      if (playing) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === ' ') {
        e.preventDefault()
        if (!revealed) onReveal()
        else { weakIds?.remove(current?.id); advance('ok'); addResult?.(true); prevWasWrong.current = false }
      } else if (e.key === 'ArrowRight' && revealed) {
        weakIds?.remove(current?.id); advance('ok'); addResult?.(true); prevWasWrong.current = false
      } else if (e.key === 'ArrowLeft' && revealed) {
        onWrong()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing, revealed, current]) // eslint-disable-line

  // JP audio on card change
  useEffect(() => {
    if (current && !playing) {
      const t = setTimeout(() => speak(current.jp_yomi ?? current.jp, 'ja'), 250)
      return () => clearTimeout(t)
    }
  }, [current?.id]) // eslint-disable-line

  // Milestone toast
  useEffect(() => {
    if (ok === prevOkRef.current) return
    prevOkRef.current = ok
    const msg = MILESTONES[ok]
    if (msg) showToast(msg, 'happy')
  }, [ok, showToast])

  // Cleanup on unmount
  useEffect(() => () => {
    toastTimers.current.forEach(fn => typeof fn === 'function' ? fn() : clearTimeout(fn))
  }, [])

  const onReveal = () => {
    revealAnswer()
    setTimeout(() => speak(current.de, 'de'), 300)
  }

  const onWrong = () => {
    weakIds?.add(current.id)
    advance('ng')
    addResult?.(false)
    if (!prevWasWrong.current) showToast('Schade...', 'thinking')
    prevWasWrong.current = true
  }

  return (
    <div className="card-mode" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── JP card ── */}
      <div className="card" style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Label noMargin>日本語</Label>
          {weakIds && (
            <button
              className="btn-bookmark"
              onClick={() => weakIds.toggle(current.id)}
              title={isWeak ? '苦手から外す' : '苦手に登録'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-sub)', lineHeight: 0, width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Bookmark size={18} strokeWidth={1.8} fill={isWeak ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <div className="card-jp" style={jpStyle}>{current.jp}</div>
        {showHint && <div className="card-hint" style={hintStyle}>{current.hint}</div>}
        {!playing && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <AudioButton speaking={speaking} onClick={() => speak(current.jp_yomi ?? current.jp, 'ja')} label="音声を聞く" style={{ marginTop: 0 }} />
            <button
              className={`btn-hint ${showHint ? 'btn-hint--active' : ''}`}
              onClick={toggleHint}
              title={showHint ? 'ヒントを隠す' : 'ヒントを表示'}
              style={{
                ...subBtn,
                color: 'var(--text-sub)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: '50%', padding: 0,
              }}
            >
              <Lightbulb size={18} strokeWidth={2} fill={showHint ? 'currentColor' : 'none'} />
            </button>
          </div>
        )}

        {revealed && (
          <div className="card-de-section" style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
            <Label>Deutsch</Label>
            <div className="card-de" style={deStyle}>{current.de}</div>
            {!playing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <AudioButton speaking={speaking} onClick={() => speak(current.de, 'de')} label="Anhören" style={{ marginTop: 0 }} />
                <button
                  onClick={() => speak(current.de, 'de', undefined, 0.5)}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    color: 'var(--text-sub)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.54px', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: 50, cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  Slow
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Countdown bar ── */}
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
        <button
          className="btn-stop"
          onClick={autoPlay.stop}
          style={{ ...revealBtnStyle, background: 'var(--surface)', color: 'var(--text)', border: '2px solid var(--border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Pause size={14} strokeWidth={2} />
          停止
        </button>
      ) : !revealed ? (
        <>
          <button className="btn-reveal" style={revealBtnStyle} onClick={onReveal}>ドイツ語を見る</button>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button className="btn-autoplay" onClick={autoPlay?.start} style={{ ...secondaryBtn, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Play size={13} strokeWidth={2} />
              自動再生
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PauseStepper value={pauseDuration} onChange={onPauseDurationChange} />
          </div>


          <div>
            <button className="btn-reset" onClick={reset} style={{ ...subBtn, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <RotateCcw size={12} strokeWidth={2} style={{ display: 'block' }} />
              最初から
            </button>
          </div>

          <KeyboardHint keys={[['Space', '答えを見る']]} />
        </>
      ) : (
        <>
          <div className="rate-buttons" style={{ display: 'flex', gap: 8 }}>
            <RateBtn variant="ghost" onClick={onWrong}>わからなかった</RateBtn>
            <RateBtn variant="solid" onClick={() => { weakIds?.remove(current.id); advance('ok'); addResult?.(true); prevWasWrong.current = false }}>わかった</RateBtn>
          </div>
          <Nav onReset={reset} />
          <KeyboardHint keys={[['←', 'わからなかった'], ['Space / →', 'わかった']]} />
        </>
      )}

      {/* ── Milestone toast ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: -60,  /* マスコットの足60px分を画面外へ */
          left: '50%',
          transform: `translateX(-50%) translateY(${toast.phase === 'enter' ? 0 : '100%'})`,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          {/* 吹き出し */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 50,
            padding: '8px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600, fontSize: 13,
            color: 'var(--text)', letterSpacing: '0.54px',
            whiteSpace: 'nowrap',
            position: 'relative',
            marginBottom: 10,
          }}>
            {toast.msg}
            <span style={{
              position: 'absolute', bottom: -7, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '7px solid var(--surface)',
            }} />
          </div>
          {/* マスコット（足は画面外にはみ出す） */}
          <RiveMascot size={160} scene={toast.variant === 'happy' ? 0 : 3} />
        </div>
      )}

    </div>
  )
}

/* ── Sub-components ── */

function Label({ children, noMargin }) {
  return (
    <div className="card-label" style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
      textTransform: 'uppercase', letterSpacing: '1.5px',
      color: 'var(--text-sub)', marginBottom: noMargin ? 0 : 12,
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
      border: solid ? 'none' : '2px solid var(--border)',
      color: solid ? 'var(--solid-text)' : 'var(--text)',
      fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
      fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.54px',
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

function KeyboardHint({ keys }) {
  // デスクトップ（ポインターデバイス）のみ表示
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
      {keys.map(([key, label]) => (
        <span key={key} style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          color: 'var(--text-muted)', letterSpacing: '0.3px',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <kbd style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '1px 6px', fontSize: 10,
            fontFamily: 'inherit',
          }}>{key}</kbd>
          {label}
        </span>
      ))}
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
  background: 'var(--surface)', borderRadius: 20,
  padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)', minHeight: 180,
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
  fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.54px',
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
