// components/Completion.jsx
import { PotatoMascot } from './PotatoMascot'

export function Completion({ ok, total, onReset, isWeakMode }) {
  const pct = total ? Math.round(ok / total * 100) : 0
  const msg = isWeakMode
    ? '苦手問題を全部クリア！Alle Schwächen behoben!'
    : pct === 100 ? 'Perfekt!' : pct >= 70 ? 'Gut gemacht. よくできました。' : 'Nochmal. もう一度。'

  return (
    <div className="completion" style={{
      textAlign: 'center', padding: '72px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    }}>
      <div className="completion-mascot" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="speech-bubble" style={{
          background: 'var(--surface)', color: 'var(--text)',
          fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
          fontSize: 13, padding: '7px 16px',
          borderRadius: 50, marginBottom: 10,
          whiteSpace: 'nowrap', position: 'relative',
        }}>
          {msg}
          <span className="speech-bubble__tail" style={{
            position: 'absolute', bottom: -7, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '7px solid var(--surface)',
          }} />
        </div>
        <PotatoMascot size={96} variant={pct === 100 ? 'happy' : 'normal'} />
      </div>

      <div className="completion-title" style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 56, color: 'var(--text)', letterSpacing: '-1.72px',
        fontStyle: 'italic',
      }}>
        Fertig.
      </div>
      <div className="completion-score" style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 48, fontWeight: 600, color: 'var(--text)',
        letterSpacing: '-0.4px',
      }}>
        {ok} / {total}
      </div>
      <button className="btn-retry" onClick={onReset} style={{
        marginTop: 12,
        background: 'var(--solid-bg)', border: 'none', color: 'var(--solid-text)',
        fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
        fontSize: 12, padding: '14px 36px', cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: '0.54px',
        borderRadius: 50,
      }}>
        もう一度
      </button>
    </div>
  )
}
