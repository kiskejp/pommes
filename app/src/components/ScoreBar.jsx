// components/ScoreBar.jsx
export function ScoreBar({ ok, ng }) {
  const total = ok + ng
  const pct = total ? Math.round(ok / total * 100) : null

  return (
    <div className="score-bar" style={{
      display: 'flex', justifyContent: 'center', gap: 40,
      padding: '16px 0',
    }}>
      {[
        { n: ok,                             label: '正解'  },
        { n: ng,                             label: '不正解' },
        { n: pct != null ? `${pct}%` : '—', label: '正答率' },
      ].map(({ n, label }) => (
        <div key={label} className="score-item" style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 24, fontWeight: 600, color: 'var(--text)',
            letterSpacing: '-0.4px',
          }}>
            {n}
          </div>
          <div style={{
            fontSize: 10, textTransform: 'uppercase',
            letterSpacing: '1.5px', color: 'var(--text-sub)', marginTop: 4,
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
