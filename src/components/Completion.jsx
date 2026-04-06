// components/Completion.jsx
export function Completion({ ok, total, onReset }) {
  const pct = total ? Math.round(ok / total * 100) : 0
  const msg = pct === 100 ? 'Perfekt. 完璧です。' : pct >= 70 ? 'Gut gemacht. よくできました。' : 'Nochmal. もう一度。'

  return (
    <div style={{
      textAlign: 'center', padding: '72px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 56, color: '#000000', letterSpacing: '-1.72px',
        fontStyle: 'italic',
      }}>
        Fertig.
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 48, fontWeight: 600, color: '#000000',
        letterSpacing: '-0.4px',
      }}>
        {ok} / {total}
      </div>
      <div style={{
        fontSize: 14, color: '#999999', letterSpacing: '-0.14px',
        fontFamily: "'Barlow', sans-serif",
      }}>
        {msg}
      </div>
      <button
        onClick={onReset}
        style={{
          marginTop: 28,
          background: '#000000', border: 'none', color: '#ffffff',
          fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
          fontSize: 12, padding: '14px 36px', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.54px',
          borderRadius: 50,
        }}
      >
        もう一度
      </button>
    </div>
  )
}
