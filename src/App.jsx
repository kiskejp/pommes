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
    <div style={{
      background: '#ffffff', color: '#000000', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Barlow', sans-serif",
    }}>

      {/* ── Header ── */}
      <header style={{
        width: '100%', borderBottom: '1px solid #e8e8e8',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 28px',
      }}>
        <button
          onClick={handleReset}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: "'DM Serif Display', serif",
            fontSize: 18, letterSpacing: '-0.4px', color: '#000000',
            fontStyle: 'italic',
          }}
        >
          Pommes
        </button>

        <div style={{
          display: 'flex', background: '#f0f0f0',
          borderRadius: 50, padding: 3, gap: 2,
        }}>
          {[['card', 'カード'], ['input', '入力']].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? '#000000' : 'transparent',
              border: 'none',
              color: mode === m ? '#ffffff' : '#666666',
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
      <div style={{ width: '100%', height: 1, background: '#f0f0f0' }}>
        <div style={{
          height: 1, width: `${progress}%`, background: '#000000',
          transition: 'width .4s ease',
        }} />
      </div>

      {/* ── Main ── */}
      <main style={{
        width: '100%', maxWidth: 640, padding: '32px 24px 80px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {!hasJpVoice && !hasDeVoice && (
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            color: '#999999', border: '1px dashed #e0e0e0',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '1.5px',
                border: '1px solid #e8e8e8', padding: '3px 12px', color: '#999999',
                borderRadius: 50,
              }}>
                {session.current?.level} · {session.current?.category}
              </span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                color: '#999999', letterSpacing: '-0.14px',
              }}>
                <b style={{ color: '#000000', fontWeight: 600 }}>{session.idx + 1}</b>
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
