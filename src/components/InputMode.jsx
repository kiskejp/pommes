// components/InputMode.jsx
import { useEffect, useRef } from 'react'
import { AudioButton } from './AudioButton'

const UMLAUTS = ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß']

export function InputMode({ session, speak, speaking }) {
  const { current, checked, feedback, showHint, toggleHint, submitInput, advance, reset } = session
  const inputRef = useRef(null)

  useEffect(() => {
    if (current) {
      const t = setTimeout(() => speak(current.jp, 'ja'), 250)
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

  const inputBorder = !feedback ? '#e8e8e8' : feedback === 'ok' ? '#000000' : '#000000'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* card */}
      <div style={{
        background: '#f8f8f8', border: '1px solid #e8e8e8',
        padding: '36px 32px',
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          textTransform: 'uppercase', letterSpacing: '1.5px',
          color: '#999999', marginBottom: 12,
        }}>
          日本語
        </div>
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(22px, 4.5vw, 32px)', lineHeight: 1.35,
          color: '#000000', letterSpacing: '-0.26px',
        }}>
          {current.jp}
        </div>
        {showHint && (
          <div style={{ fontSize: 13, color: '#999999', fontStyle: 'italic', marginTop: 12 }}>
            {current.hint}
          </div>
        )}
        <AudioButton speaking={speaking} onClick={() => speak(current.jp, 'ja')} label="音声を聞く" />
      </div>

      {/* input row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            defaultValue=""
            disabled={checked}
            autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="ドイツ語で入力..."
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              flex: 1,
              background: '#ffffff',
              border: `1px solid ${inputBorder}`,
              color: '#000000',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 16, padding: '14px 18px',
              outline: 'none', borderRadius: 4,
              caretColor: '#000000',
              letterSpacing: '-0.14px',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={checked}
            style={{
              background: '#000000', border: 'none', color: '#ffffff',
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

        {/* umlauts */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {UMLAUTS.map(c => (
            <button key={c} onClick={() => insertChar(c)} style={{
              background: '#ffffff', border: '1px solid #e8e8e8', color: '#000000',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
              padding: '4px 12px', cursor: 'pointer', borderRadius: 50,
              transition: 'border-color .15s',
            }}>
              {c}
            </button>
          ))}
        </div>

        {/* feedback */}
        {feedback && (
          <div style={{
            padding: '20px 24px',
            background: '#f8f8f8',
            border: '1px solid #e8e8e8',
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              textTransform: 'uppercase', letterSpacing: '1.5px',
              color: '#999999', marginBottom: 8,
            }}>
              {feedback === 'ok' ? '正解' : '不正解'}
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 20,
              fontWeight: 600, color: '#000000', letterSpacing: '-0.26px',
            }}>
              {current.de}
            </div>
            {feedback === 'ng' && (
              <div style={{
                fontSize: 12, color: '#999999', marginTop: 6,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: '-0.14px',
              }}>
                あなたの答え: {inputRef.current?.value}
              </div>
            )}
            <AudioButton speaking={speaking} onClick={() => speak(current.de, 'de')} label="発音を聞く" />
          </div>
        )}
      </div>

      {/* nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={reset} style={ghostBtn}>最初から</button>
        {checked
          ? <button onClick={() => advance(feedback)} style={solidBtn}>次へ →</button>
          : <button onClick={toggleHint} style={ghostBtn}>{showHint ? 'ヒントを隠す' : 'ヒントを見る'}</button>
        }
      </div>
    </div>
  )
}

const ghostBtn = {
  background: 'none', border: '1px solid #e8e8e8', color: '#999999',
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
  padding: '8px 16px', cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.54px',
  borderRadius: 50, transition: 'border-color .15s',
}
const solidBtn = {
  background: '#000000', border: 'none', color: '#ffffff',
  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
  fontSize: 12, padding: '10px 28px', cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.54px',
  borderRadius: 50,
}
