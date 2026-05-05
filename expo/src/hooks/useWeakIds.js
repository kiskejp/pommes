import { useState, useCallback, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'pommes-weak-ids'

export function useWeakIds() {
  const [weakIds, setWeakIds] = useState([])

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      try { setWeakIds(JSON.parse(val ?? '[]')) }
      catch { setWeakIds([]) }
    })
  }, [])

  const persist = (ids) => {
    AsyncStorage.setItem(KEY, JSON.stringify(ids))
  }

  const add = useCallback((id) => {
    setWeakIds(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      persist(next)
      return next
    })
  }, [])

  const remove = useCallback((id) => {
    setWeakIds(prev => {
      const next = prev.filter(x => x !== id)
      persist(next)
      return next
    })
  }, [])

  const toggle = useCallback((id) => {
    setWeakIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      persist(next)
      return next
    })
  }, [])

  const isWeak = useCallback((id) => weakIds.includes(id), [weakIds])

  return { weakIds, add, remove, toggle, isWeak }
}
