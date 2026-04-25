// components/AudioButton.jsx
import { Volume2 } from 'lucide-react'

export function AudioButton({ onClick, speaking, label = '音声を聞く', style: styleProp }) {
  return (
    <button
      className="audio-btn"
      onClick={onClick}
      title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none',
        color: 'var(--text-sub)',
        width: 36, height: 36,
        cursor: 'pointer', borderRadius: '50%',
        marginTop: 14, transition: 'opacity .15s',
        opacity: speaking ? 0.4 : 1,
        flexShrink: 0,
        ...styleProp,
      }}
    >
      <Volume2 size={18} strokeWidth={2} />
    </button>
  )
}
