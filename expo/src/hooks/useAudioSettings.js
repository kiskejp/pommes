import { useState, useCallback, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'pommes-audio-settings'

export function useAudioSettings() {
  const [jpEnabled, setJpEnabled]   = useState(true)
  const [deEnabled, setDeEnabled]   = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      try {
        const s = JSON.parse(val ?? '{}')
        if (s.jpEnabled !== undefined) setJpEnabled(s.jpEnabled)
        if (s.deEnabled !== undefined) setDeEnabled(s.deEnabled)
      } catch {}
    })
  }, [])

  const persist = (patch) => {
    AsyncStorage.getItem(KEY).then(val => {
      const prev = (() => { try { return JSON.parse(val ?? '{}') } catch { return {} } })()
      AsyncStorage.setItem(KEY, JSON.stringify({ ...prev, ...patch }))
    })
  }

  const toggleJp = useCallback(() => {
    setJpEnabled(prev => { persist({ jpEnabled: !prev }); return !prev })
  }, [])

  const toggleDe = useCallback(() => {
    setDeEnabled(prev => { persist({ deEnabled: !prev }); return !prev })
  }, [])

  return { jpEnabled, deEnabled, toggleJp, toggleDe }
}
