import { useState, useCallback } from 'react'

const KEY = 'pommes-audio-settings'

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return {
      jpEnabled:     s.jpEnabled     !== false,
      deEnabled:     s.deEnabled     !== false,
      pauseDuration: typeof s.pauseDuration === 'number' ? s.pauseDuration : 2,
    }
  } catch {
    return { jpEnabled: true, deEnabled: true, pauseDuration: 2 }
  }
}

export function useAudioSettings() {
  const [settings, setSettings] = useState(load)

  const update = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { ...settings, update }
}
