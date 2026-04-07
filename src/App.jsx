// App.jsx
import { useState } from 'react'
import { useTTS }        from './hooks/useTTS'
import { useSession }    from './hooks/useSession'
import { TitleScreen }   from './pages/TitleScreen'
import { ScoreBar }      from './components/ScoreBar'
import { CardMode }      from './components/CardMode'
import { InputMode }     from './components/InputMode'
import { Completion }    from './components/Completion'

export default function App() {
  const [filteredSentences, setFilteredSentences] = useState(null)

  if (!filteredSentences) {
    return <TitleScreen onStart={setFilteredSentences} />
  }

  return (
    <StudySession
      sentences={filteredSentences}
      onExit={() => setFilteredSentences(null)}
    />
  )
}

function StudySession({ sentences, onExit }) {
  const [mode, setMode] = useState('card')
  const { speak, speaking, hasJpVoice, hasDeVoice } = useTTS()
  const session = useSession(sentences)
  const { ok, ng, done, progress, reset } = session

  const handleReset = () => {
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
        padding: '16px 28px',
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
              onClick={() => setMode(m)} style={{
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

      {/* ── Main ── */}
      <main className="app-main" style={{
        width: '100%', maxWidth: 640, padding: '32px 24px 80px',
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
          <Completion ok={ok} total={ok + ng} onReset={handleReset} />
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
              ? <CardMode  session={session} speak={speak} speaking={speaking} />
              : <InputMode session={session} speak={speak} speaking={speaking} />
            }
          </>
        )}
      </main>
    </div>
  )
}
