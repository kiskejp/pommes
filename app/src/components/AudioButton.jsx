// components/AudioButton.jsx
import { Volume2 } from 'lucide-react'

export function AudioButton({ onClick, speaking, label = '音声を聞く', style: styleProp }) {
  return (
    <button
      className="audio-btn"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'none',
        border: `2px ${speaking ? 'solid' : 'dashed'} var(--border-strong)`,
        color: 'var(--text)',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10, padding: '5px 14px', cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: '0.54px',
        marginTop: 14, borderRadius: 50, transition: 'opacity .15s',
        opacity: speaking ? 0.4 : 1,
        ...styleProp,
      }}
    >
      <Volume2 size={13} strokeWidth={2} />
      {label}
    </button>
  )
}
