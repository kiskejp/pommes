import { useState, useCallback } from 'react'

const KEY = 'pommes-weak-ids'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') }
  catch { return [] }
}

function save(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids))
}

export function useWeakIds() {
  const [weakIds, setWeakIds] = useState(load)

  const add = useCallback((id) => {
    setWeakIds(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((id) => {
    setWeakIds(prev => {
      const next = prev.filter(x => x !== id)
      save(next)
      return next
    })
  }, [])

  const toggle = useCallback((id) => {
    setWeakIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      save(next)
      return next
    })
  }, [])

  const isWeak = useCallback((id) => weakIds.includes(id), [weakIds])

  return { weakIds, add, remove, toggle, isWeak }
}
