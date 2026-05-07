// components/AppHeader.jsx
import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { themes } from '../themes'
import { useTheme } from '../context/ThemeContext'
import { HowToModal } from './HowToModal'

export function AppHeader() {
  const { themeId, setTheme } = useTheme()
  const [showHelp, setShowHelp] = useState(false)

  return (
    <header className="app-header-top" style={{
      position: 'sticky', top: 0, zIndex: 100,
      width: '100%',
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(16px, 4vw, 28px)',
      height: 52,
      boxSizing: 'border-box',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: "'Paytone One', sans-serif",
        fontSize: 22, letterSpacing: '-0.5px',
        color: 'var(--text)',
        userSelect: 'none',
      }}>
        Pommes
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* Theme picker */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {Object.entries(themes).map(([id, t]) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              title={t.name}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: t.swatch,
                border: themeId === id
                  ? '2px solid var(--border-strong)'
                  : '2px solid var(--border)',
                cursor: 'pointer', padding: 0,
                boxShadow: themeId === id ? '0 0 0 2px var(--bg)' : 'none',
                transition: 'all .15s',
              }}
            />
          ))}
        </div>

        {/* Help button */}
        <button
          onClick={() => setShowHelp(true)}
          title="使い方"
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-sub)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '50%',
            padding: 0,
          }}
        >
          <HelpCircle size={18} strokeWidth={2} />
        </button>
      </div>

      {showHelp && <HowToModal onClose={() => setShowHelp(false)} />}
    </header>
  )
}
