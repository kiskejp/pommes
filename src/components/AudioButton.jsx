// components/AudioButton.jsx
export function AudioButton({ onClick, speaking, label = '音声を聞く' }) {
  return (
    <button
      className="audio-btn"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 0,
        background: 'none',
        border: `2px ${speaking ? 'solid' : 'dashed'} var(--border-strong)`,
        color: 'var(--text)',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10, padding: '5px 14px', cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: '0.54px',
        marginTop: 14, borderRadius: 50, transition: 'opacity .15s',
        opacity: speaking ? 0.4 : 1,
      }}
    >
      <SpeakerIcon /> {label}
    </button>
  )
}

function SpeakerIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
    </svg>
  )
}
