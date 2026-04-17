// components/Completion.jsx
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Mascot } from './Mascot'

export function Completion({ ok, total, onReset, isWeakMode, ngByCategory, ngIds, sentences, onRetryWrong }) {
  const pct = total ? Math.round(ok / total * 100) : 0
  const msg = isWeakMode && pct === 100
    ? '苦手問題を全部クリア！Alle Schwächen behoben!'
    : pct === 100 ? 'Perfekt! 完璧です。' : pct >= 70 ? 'Gut gemacht. よくできました。' : 'Nochmal. もう一度。'

  const worstCat = ngByCategory && Object.keys(ngByCategory).length > 1
    ? Object.entries(ngByCategory).sort((a, b) => b[1] - a[1])[0][0]
    : null

  const wrongSentences = sentences && ngIds
    ? sentences.filter(s => ngIds.includes(s.id))
    : []
  const visibleList = wrongSentences.slice(0, 5)
  const hiddenCount = wrongSentences.length - visibleList.length

  const handleRetry = () => onRetryWrong(wrongSentences)

  const btnBase = {
    width: '100%', padding: '15px 24px',
    fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
    fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.54px',
    cursor: 'pointer', borderRadius: 50,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }

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
          borderRadius: 50, marginBottom: 18,
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
        <Mascot size={96}
          variant={pct >= 80 ? 'happy-no-mouth' : pct >= 50 ? 'normal' : 'thinking'}
          animation={pct >= 80 ? 'bounce' : 'none'}
        />
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

      {/* 要復習：テキスト表示 */}
      {worstCat && (
        <div className="completion-worst" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          <AlertCircle size={13} strokeWidth={2} style={{ color: 'var(--text-sub)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-sub)' }}>
            要復習:
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {worstCat}
          </span>
        </div>
      )}

      {/* わからなかった問題一覧（常時表示） */}
      {wrongSentences.length > 0 && (
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'left' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.54px',
            color: 'var(--text-sub)', marginBottom: 8,
          }}>
            わからなかった問題 {wrongSentences.length}件
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {visibleList.map((s, i) => (
              <div key={s.id} style={{
                padding: '10px 16px',
                borderBottom: i < visibleList.length - 1 || hiddenCount > 0 ? '1px solid var(--border)' : 'none',
                fontFamily: "'Barlow', sans-serif", fontSize: 14, color: 'var(--text)',
              }}>
                {s.jp}
              </div>
            ))}
            {hiddenCount > 0 && (
              <div style={{
                padding: '10px 16px',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                color: 'var(--text-sub)',
              }}>
                他 {hiddenCount} 問
              </div>
            )}
          </div>
        </div>
      )}

      {/* ボタン群 */}
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
        {wrongSentences.length > 0 && (
          <button className="btn-retry-wrong" onClick={handleRetry} style={{
            ...btnBase,
            background: 'var(--bg)', border: '2px solid var(--border-strong)', color: 'var(--text)',
          }}>
            <RotateCcw size={12} strokeWidth={2} />
            わからなかった問題をもう一度
          </button>
        )}
        <button className="btn-retry" onClick={onReset} style={{
          ...btnBase,
          background: 'var(--solid-bg)', border: '2px solid transparent', color: 'var(--solid-text)',
        }}>
          <RotateCcw size={12} strokeWidth={2} />
          もう一度
        </button>
      </div>
    </div>
  )
}
