// App.jsx
import { useState, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useTTS }            from './hooks/useTTS'
import { useSession }        from './hooks/useSession'
import { useAudioSettings }  from './hooks/useAudioSettings'
import { useAutoPlay }       from './hooks/useAutoPlay'
import { useWeakIds }        from './hooks/useWeakIds'
import { TitleScreen }       from './pages/TitleScreen'
import { ScoreBar }          from './components/ScoreBar'
import { CardMode }          from './components/CardMode'
import { InputMode }         from './components/InputMode'
import { Completion }        from './components/Completion'

export default function App() {
  const [filteredSentences, setFilteredSentences] = useState(null)
  const [isWeakMode, setIsWeakMode] = useState(false)
  const weakIds = useWeakIds()

  const handleStart = useCallback((sentences, weak = false) => {
    setFilteredSentences(sentences)
    setIsWeakMode(weak)
  }, [])

  const handleExit = useCallback(() => {
    setFilteredSentences(null)
    setIsWeakMode(false)
  }, [])

  if (!filteredSentences) {
    return <TitleScreen onStart={handleStart} weakIds={weakIds} />
  }

  return (
    <StudySession
      sentences={filteredSentences}
      onExit={handleExit}
      weakIds={weakIds}
      isWeakMode={isWeakMode}
    />
  )
}

function StudySession({ sentences, onExit, weakIds, isWeakMode }) {
  const [mode, setMode] = useState('card')
  const { speak, speaking, hasJpVoice, hasDeVoice } = useTTS()
  const session = useSession(sentences)
  const { ok, ng, done, progress, reset } = session
  const { jpEnabled, deEnabled, pauseDuration, update } = useAudioSettings()

  // speak() wrapper that respects jp/de on/off toggles.
  // When disabled, onEnd fires immediately so auto-play flow continues.
  const smartSpeak = useCallback((text, lang, onEnd) => {
    if (lang === 'ja' && !jpEnabled) { onEnd?.(); return }
    if (lang === 'de' && !deEnabled) { onEnd?.(); return }
    speak(text, lang, onEnd)
  }, [speak, jpEnabled, deEnabled])

  const autoPlay = useAutoPlay({ session, speak: smartSpeak, pauseDuration })

  const switchMode = (m) => {
    autoPlay.stop()
    setMode(m)
  }

  const handleReset = () => {
    autoPlay.stop()
    reset()
    onExit()
  }

  return (
    <div className="app" style={{
      background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Barlow', sans-serif",
    }}>

      {/* ── Header ── */}
      <header className="app-header" style={{
        width: '100%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px clamp(16px, 4vw, 28px)',
      }}>
        <button className="logo-btn" onClick={handleReset} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: "'Paytone One', sans-serif",
          fontSize: 18, letterSpacing: '-0.3px', color: 'var(--text)',
        }}>
          Pommes
        </button>

        <div className="mode-tabs" style={{
          display: 'flex', background: 'var(--tab-bg)',
          borderRadius: 50, padding: 3, gap: 2,
        }}>
          {[['card', 'カード'], ['input', '入力']].map(([m, label]) => (
            <button key={m} className={`mode-tab ${mode === m ? 'mode-tab--active' : ''}`}
              onClick={() => switchMode(m)} style={{
                background: mode === m ? 'var(--solid-bg)' : 'transparent',
                border: 'none',
                color: mode === m ? 'var(--solid-text)' : 'var(--text-sub)',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, fontWeight: mode === m ? 600 : 400,
                padding: '6px 18px', cursor: 'pointer',
                borderRadius: 50, letterSpacing: '0.54px',
                textTransform: 'uppercase', transition: 'all .15s',
              }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="progress-track" style={{ width: '100%', height: 5, background: 'var(--surface)' }}>
        <div className="progress-fill" style={{
          height: 5, width: `${progress}%`, background: 'var(--solid-bg)',
          transition: 'width .4s ease',
        }} />
      </div>

      {/* ── Audio settings row ── */}
      <div className="audio-settings" style={{
        width: '100%', maxWidth: 640,
        display: 'flex', justifyContent: 'flex-end', gap: 6,
        padding: '10px 24px 0',
      }}>
        {[['jp', 'JP', jpEnabled], ['de', 'DE', deEnabled]].map(([key, label, enabled]) => (
          <button
            key={key}
            className={`audio-toggle audio-toggle--${key}`}
            onClick={() => update({ [`${key}Enabled`]: !enabled })}
            title={`${label}音声 ${enabled ? 'OFF' : 'ON'}にする`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: enabled ? 'var(--solid-bg)' : 'var(--surface)',
              color: enabled ? 'var(--solid-text)' : 'var(--text-muted)',
              border: '2px solid var(--border)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10, padding: '3px 10px',
              borderRadius: 50, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.54px',
              transition: 'all .15s',
            }}
          >
            {enabled ? <Volume2 size={12} strokeWidth={2} /> : <VolumeX size={12} strokeWidth={2} />}
            {label}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <main className="app-main" style={{
        width: '100%', maxWidth: 640, padding: '24px 24px 80px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {!hasJpVoice && !hasDeVoice && (
          <div className="voice-warning" style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            color: 'var(--text-muted)', border: '1px dashed var(--border)',
            padding: '8px 16px', textAlign: 'center', borderRadius: 4,
          }}>
            音声が利用できません。Chrome を推奨します。
          </div>
        )}

        <ScoreBar ok={ok} ng={ng} />

        {done ? (
          <Completion ok={ok} total={ok + ng} onReset={handleReset} isWeakMode={isWeakMode} ngByCategory={session.ngByCategory} />
        ) : (
          <>
            <div className="session-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="meta-badge" style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '1.5px',
                border: '1px solid var(--border)', padding: '3px 12px',
                color: 'var(--text-sub)', borderRadius: 50,
              }}>
                {session.current?.level} · {session.current?.category}
              </span>
              <span className="meta-counter" style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                color: 'var(--text-sub)', letterSpacing: '-0.14px',
              }}>
                <b style={{ color: 'var(--text)', fontWeight: 600 }}>{session.idx + 1}</b>
                {' '}/ {sentences.length}
              </span>
            </div>

            {mode === 'card'
              ? <CardMode
                  session={session}
                  speak={smartSpeak}
                  speaking={speaking}
                  autoPlay={autoPlay}
                  pauseDuration={pauseDuration}
                  onPauseDurationChange={d => update({ pauseDuration: d })}
                  weakIds={weakIds}
                />
              : <InputMode session={session} speak={smartSpeak} speaking={speaking} />
            }
          </>
        )}
      </main>
    </div>
  )
}

