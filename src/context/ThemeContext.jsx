// src/context/ThemeContext.jsx
import { createContext, useContext, useState } from 'react'
import { themes, defaultThemeId } from '../themes'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem('pommes-theme') ?? defaultThemeId
  )

  const setTheme = (id) => {
    setThemeId(id)
    localStorage.setItem('pommes-theme', id)
  }

  const theme = themes[themeId] ?? themes[defaultThemeId]

  const cssVars = {
    '--bg':           theme.bg,
    '--surface':      theme.surface,
    '--tab-bg':       theme.tabBg,
    '--border':       theme.border,
    '--border-strong':theme.borderStrong,
    '--text':         theme.text,
    '--text-sub':     theme.textSub,
    '--text-muted':   theme.textMuted,
    '--solid-bg':     theme.solidBg,
    '--solid-text':   theme.solidText,
  }

  return (
    <ThemeContext.Provider value={{ themeId, setTheme }}>
      <div style={{ ...cssVars, minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
