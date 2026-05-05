import { useState, useCallback, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'pommes-study-record'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysDiff(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

export function useStudyRecord() {
  const [record, setRecord] = useState(null)

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      try {
        const rec = JSON.parse(val)
        if (!rec) { setRecord(null); return }
        if (rec.lastStudyDate !== today()) {
          setRecord({ ...rec, todaySolved: 0 })
        } else {
          setRecord(rec)
        }
      } catch {
        setRecord(null)
      }
    })
  }, [])

  const save = (next) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next))
    setRecord(next)
  }

  const addResult = useCallback((isCorrect) => {
    AsyncStorage.getItem(KEY).then(val => {
      const rec = (() => { try { return JSON.parse(val) ?? {} } catch { return {} } })()
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
    })
  }, [])

  const reset = useCallback(() => {
    AsyncStorage.removeItem(KEY)
    setRecord(null)
  }, [])

  return { record, addResult, reset }
}
