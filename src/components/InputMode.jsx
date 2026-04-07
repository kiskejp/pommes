// components/InputMode.jsx
import { useEffect, useRef } from 'react'
import { AudioButton } from './AudioButton'

const UMLAUTS = ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß']

export function InputMode({ session, speak, speaking }) {
  const { current, checked, feedback, showHint, toggleHint, submitInput, advance, reset } = session
  const inputRef = useRef(null)

  useEffect(() => {
    if (current) {
      const t = setTimeout(() => speak(current.jp_yomi ?? current.jp, 'ja'), 250)
      return () => clearTimeout(t)
    }
  }, [current?.id]) // eslint-disable-line

  useEffect(() => {
    if (!checked) inputRef.current?.focus()
  }, [checked, current?.id])

  const handleSubmit = () => {
    const val = inputRef.current?.value?.trim() ?? ''
    if (!val || checked) return
    submitInput(val)
    setTimeout(() => speak(current.de, 'de'), 200)
  }

  const insertChar = (c) => {
    const el = inputRef.current
    if (!el || checked) return
    const s = el.selectionStart, e = el.selectionEnd
    el.value = el.value.slice(0, s) + c + el.value.slice(e)
    el.selectionStart = el.selectionEnd = s + c.length
    el.focus()
  }

  return (
    <div className="input-mode" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card" style={{
        background: 'var(--surface)', borderRadius: 16,
        padding: '36px 32px',
      }}>
        <div className="card-label" style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          textTransform: 'uppercase', letterSpacing: '1.5px',
          color: 'var(--text-sub)', marginBottom: 12,
        }}>
          日本語
        </div>
        <div className="card-jp" style={{
          fontFamily: "'Barlow', sans-serif", fontWeight: 600,
          fontSize: 'clamp(22px, 4.5vw, 32px)', lineHeight: 1.4,
          color: 'var(--text)', letterSpacing: '-0.26px',
        }}>
          {current.jp}
        </div>
        {showHint && (
          <div className="card-hint" style={{ fontSize: 13, color: 'var(--text-sub)', fontStyle: 'italic', marginTop: 12 }}>
            {current.hint}
          </div>
        )}
        <AudioButton speaking={speaking} onClick={() => speak(current.jp_yomi ?? current.jp, 'ja')} label="音声を聞く" />
      </div>

      <div className="input-area" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="input-row" style={{ display: 'flex', gap: 8 }}>
          <input
            className="de-input"
            ref={inputRef}
            type="text"
            defaultValue=""
            disabled={checked}
            autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="ドイツ語で入力..."
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              flex: 1,
              background: 'var(--bg)',
              border: `2px solid ${feedback ? 'var(--border-strong)' : 'var(--border)'}`,
              color: 'var(--text)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 16, padding: '14px 18px',
              outline: 'none', borderRadius: 4,
              caretColor: 'var(--text)',
              letterSpacing: '-0.14px',
            }}
          />
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={checked}
            style={{
              background: 'var(--solid-bg)', border: 'none', color: 'var(--solid-text)',
              fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
              fontSize: 12, padding: '14px 24px', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.54px',
              borderRadius: 50, opacity: checked ? 0.3 : 1,
              transition: 'opacity .15s',
            }}
          >
            確認
          </button>
        </div>

        <div className="umlaut-keys" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {UMLAUTS.map(c => (
            <button key={c} className="btn-umlaut" onClick={() => insertChar(c)} style={{
              background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text)',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
              padding: '4px 12px', cursor: 'pointer', borderRadius: 50,
            }}>
              {c}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`feedback feedback--${feedback}`} style={{
            padding: '20px 24px',
            background: 'var(--surface)',
            borderRadius: 16,
          }}>
            <div className="feedback-label" style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              textTransform: 'uppercase', letterSpacing: '1.5px',
              color: 'var(--text-sub)', marginBottom: 8,
            }}>
              {feedback === 'ok' ? '正解' : '不正解'}
            </div>
            <div className="feedback-de" style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 20,
              fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.26px',
            }}>
              {current.de}
            </div>
            {feedback === 'ng' && (
              <div className="feedback-answer" style={{
                fontSize: 12, color: 'var(--text-sub)', marginTop: 6,
                fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '-0.14px',
              }}>
                あなたの答え: {inputRef.current?.value}
              </div>
            )}
            <AudioButton speaking={speaking} onClick={() => speak(current.de, 'de')} label="発音を聞く" />
          </div>
        )}
      </div>

      <div className="input-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-reset" onClick={reset} style={ghostBtn}>最初から</button>
        {checked
          ? <button className="btn-next" onClick={() => advance(feedback)} style={solidBtn}>次へ →</button>
          : <button className={`btn-hint ${showHint ? 'btn-hint--active' : ''}`} onClick={toggleHint} style={ghostBtn}>{showHint ? 'ヒントを隠す' : 'ヒントを見る'}</button>
        }
      </div>
    </div>
  )
}

const ghostBtn = {
  background: 'none', border: '2px solid var(--border)', color: 'var(--text-sub)',
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
  padding: '8px 16px', cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.54px', borderRadius: 50,
}
const solidBtn = {
  background: 'var(--solid-bg)', border: 'none', color: 'var(--solid-text)',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 12, padding: '10px 28px', cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.54px', borderRadius: 50,
}
