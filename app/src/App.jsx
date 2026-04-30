// App.jsx
import { useState, useCallback } from 'react'
import { Volume2, VolumeX, X, WifiOff } from 'lucide-react'
import { useTTS }            from './hooks/useTTS'
import { useSession }        from './hooks/useSession'
import { useAudioSettings }  from './hooks/useAudioSettings'
import { useAutoPlay }       from './hooks/useAutoPlay'
import { useWeakIds }        from './hooks/useWeakIds'
import { useOnlineStatus }   from './hooks/useOnlineStatus'
import { useStudyRecord }    from './hooks/useStudyRecord'
import { TitleScreen }       from './pages/TitleScreen'
import { AppHeader }         from './components/AppHeader'
import { ScoreBar }          from './components/ScoreBar'
import { CardMode }          from './components/CardMode'
import { InputMode }         from './components/InputMode'
import { Completion }        from './components/Completion'
import allSentences          from './data/sentences.json'

// ── Debug mode (localhost only) ──
const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname)
const debugParam  = isLocalhost ? new URLSearchParams(location.search).get('debug') : null

if (debugParam === 'weak') {
  const ids = allSentences.slice(0, 5).map(s => s.id)
  localStorage.setItem('pommes-weak-ids', JSON.stringify(ids))
}

function computeDebugInit() {
  if (debugParam === 'completion-pass') {
    const sents = allSentences.slice(0, 10)
    return { sentences: sents, sessionState: { idx: 10, ok: 10, ng: 0, ngIds: [], ngByCat: {} } }
  }
  if (debugParam === 'completion-fail') {
    const sents = allSentences.slice(0, 10)
    const ngIds = sents.slice(0, 3).map(s => s.id)
    const ngByCat = {}
    sents.slice(0, 3).forEach(s => { ngByCat[s.category] = (ngByCat[s.category] ?? 0) + 1 })
    return { sentences: sents, sessionState: { idx: 10, ok: 7, ng: 3, ngIds, ngByCat } }
  }
  return null
}
const debugInit = computeDebugInit()

export default function App() {
  const [filteredSentences, setFilteredSentences] = useState(debugInit?.sentences ?? null)
  const [isWeakMode, setIsWeakMode] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const weakIds = useWeakIds()
  const online  = useOnlineStatus()
  const { record, addResult } = useStudyRecord()

  const handleStart = useCallback((sentences, weak = false) => {
    setFilteredSentences(sentences)
    setIsWeakMode(weak)
    setSessionKey(k => k + 1)
  }, [])

  const handleExit = useCallback(() => {
    window.scrollTo(0, 0)
    setFilteredSentences(null)
    setIsWeakMode(false)
  }, [])

  const offlineBanner = !online && (
    <div style={{
      width: '100%',
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '10px 16px',
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
      color: 'var(--text-sub)', letterSpacing: '0.3px',
    }}>
      <WifiOff size={13} strokeWidth={2} />
      オフラインです。キャッシュされたデータで動作しています。
    </div>
  )

  if (!filteredSentences) {
    return (
      <>
        {offlineBanner}
        <AppHeader />
        <TitleScreen onStart={handleStart} weakIds={weakIds} studyRecord={record} />
      </>
    )
  }

  return (
    <>
      {offlineBanner}
      <StudySession
        key={sessionKey}
        sentences={filteredSentences}
        onExit={handleExit}
        onRetryWrong={handleStart}
        weakIds={weakIds}
        isWeakMode={isWeakMode}
        initialSessionState={debugInit?.sessionState}
        addResult={addResult}
      />
    </>
  )
}

function StudySession({ sentences, onExit, onRetryWrong, weakIds, isWeakMode, initialSessionState, addResult }) {
  const [mode, setMode] = useState('card')
  const { speak, speaking, hasJpVoice, hasDeVoice } = useTTS()
  const session = useSession(sentences, initialSessionState)
  const { ok, ng, done, progress, reset } = session
  const { jpEnabled, deEnabled, pauseDuration, update } = useAudioSettings()

  // speak() wrapper that respects jp/de on/off toggles.
  // When disabled, onEnd fires immediately so auto-play flow continues.
  const smartSpeak = useCallback((text, lang, onEnd, rate) => {
    if (lang === 'ja' && !jpEnabled) { onEnd?.(); return }
    if (lang === 'de' && !deEnabled) { onEnd?.(); return }
    speak(text, lang, onEnd, rate)
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
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: '16px clamp(16px, 4vw, 28px)',
      }}>
        <div />

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
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
              {autoPlay.isPlaying && m === 'card' && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: mode === 'card' ? 'var(--solid-text)' : 'var(--text-sub)',
                  flexShrink: 0,
                }} />
              )}
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-exit" onClick={handleReset} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 6,
            color: 'var(--text-sub)', lineHeight: 0,
          }}>
            <X size={24} strokeWidth={2} />
          </button>
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
      {!done && <div className="audio-settings" style={{
        width: '100%', maxWidth: 640,
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6,
        padding: '10px 24px 0',
      }}>
        {/* JP / DE */}
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
              border: 'none',
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
      </div>}

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
          <Completion
            ok={ok} total={ok + ng}
            onReset={handleReset}
            isWeakMode={isWeakMode}
            ngByCategory={session.ngByCategory}
            ngIds={session.ngIds}
            sentences={sentences}
            onRetryWrong={(wrong) => { autoPlay.stop(); onRetryWrong(wrong) }}
          />
        ) : (
          <>
            <div className="session-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="meta-badge" style={{
                display: 'inline-flex', alignItems: 'center',
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
                  addResult={addResult}
                />
              : <InputMode session={session} speak={smartSpeak} speaking={speaking} addResult={addResult} />
            }
          </>
        )}
      </main>
    </div>
  )
}

