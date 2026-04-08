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

export function useStudyRecord() {
  const [record, setRecord] = useState(load)

  const save = (next) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    setRecord(next)
  }

  // アプリ起動時に呼ぶ。連続学習日数を更新する
  const checkStreak = useCallback(() => {
    const rec = load()
    if (!rec?.lastStudyDate) return
    const t = today()
    const diff = daysDiff(rec.lastStudyDate, t)
    if (diff === 0) return // 今日すでに処理済み
    if (diff === 1) {
      save({ ...rec, streak: (rec.streak ?? 1) + 1, todaySolved: 0 })
    } else {
      save({ ...rec, streak: 1, todaySolved: 0 })
    }
  }, []) // eslint-disable-line

  // 回答時に呼ぶ
  const addResult = useCallback((isCorrect) => {
    const rec = load() ?? {}
    const t = today()
    const streak = rec.lastStudyDate ? (rec.streak ?? 1) : 1
    save({
      totalSolved:  (rec.totalSolved  ?? 0) + 1,
      totalCorrect: (rec.totalCorrect ?? 0) + (isCorrect ? 1 : 0),
      lastStudyDate: t,
      streak,
      todaySolved: (rec.todaySolved ?? 0) + 1,
    })
  }, []) // eslint-disable-line

  // デバッグ用リセット
  const reset = useCallback(() => {
    localStorage.removeItem(KEY)
    setRecord(null)
  }, [])

  return { record, addResult, checkStreak, reset }
}
