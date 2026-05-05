import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const globalStyle = document.createElement('style')
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; overflow-x: hidden; }
`
document.head.appendChild(globalStyle)
import '@fontsource/dm-serif-display'
import '@fontsource/paytone-one'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => registrations.forEach(registration => registration.unregister()))
    .catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
