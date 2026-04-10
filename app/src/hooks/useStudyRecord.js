// hooks/useStudyRecord.js
import { useState, useCallback } from 'react'

const KEY = 'pommes-study-record'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? null }
  catch { return null }
}

function daysDiff(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

function loadWithDateCheck() {
  const rec = load()
  if (!rec) return null
  if (rec.lastStudyDate !== today()) return { ...rec, todaySolved: 0 }
  return rec
}

export function useStudyRecord() {
  const [record, setRecord] = useState(loadWithDateCheck)

  const save = (next) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    setRecord(next)
  }

  const addResult = useCallback((isCorrect) => {
    const rec = load() ?? {}
    const t = today()
    const last = rec.lastStudyDate

    let streak
    if (!last) {
      streak = 1
    } else {
      const diff = daysDiff(last, t)
      if (diff === 0) streak = rec.streak ?? 1
      else if (diff === 1) streak = (rec.streak ?? 1) + 1
      else streak = 1
    }

    save({
      totalSolved:  (rec.totalSolved  ?? 0) + 1,
      totalCorrect: (rec.totalCorrect ?? 0) + (isCorrect ? 1 : 0),
      lastStudyDate: t,
      streak,
      todaySolved: last === t ? (rec.todaySolved ?? 0) + 1 : 1,
    })
  }, []) // eslint-disable-line

  // デバッグ用リセット
  const reset = useCallback(() => {
    localStorage.removeItem(KEY)
    setRecord(null)
  }, [])

  return { record, addResult, reset }
}
