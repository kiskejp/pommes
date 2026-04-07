import { useState, useCallback, useRef } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Manages drill session: shuffled order, score, card state
 */
export function useSession(sentences) {
  const makeOrder = useCallback(
    () => shuffle([...Array(sentences.length).keys()]),
    [sentences]
  )

  const [order,    setOrder]    = useState(() => makeOrder())
  const [idx,      setIdx]      = useState(0)
  const [ok,       setOk]       = useState(0)
  const [ng,       setNg]       = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [checked,  setChecked]  = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'ok' | 'ng' | null

  const ngByCat = useRef({})

  const current = idx < sentences.length ? sentences[order[idx]] : null
  const done    = idx >= sentences.length
  const progress = sentences.length ? (idx / sentences.length) * 100 : 0

  const reset = useCallback(() => {
    setOrder(makeOrder())
    setIdx(0); setOk(0); setNg(0)
    setRevealed(false); setChecked(false)
    setShowHint(false); setFeedback(null)
    ngByCat.current = {}
  }, [makeOrder])

  const revealAnswer = () => setRevealed(true)
  const toggleHint   = () => setShowHint(h => !h)

  const advance = (result) => {
    if (result === 'ok') setOk(n => n + 1)
    if (result === 'ng') {
      setNg(n => n + 1)
      if (current) ngByCat.current[current.category] = (ngByCat.current[current.category] ?? 0) + 1
    }
    setIdx(i => i + 1)
    setRevealed(false); setChecked(false)
    setShowHint(false); setFeedback(null)
  }

  const normalize = (s) =>
    s.trim().toLowerCase().replace(/[.!?。！？]+$/, '').trim()

  const submitInput = (userText) => {
    if (checked || !current) return null
    const correct = normalize(userText) === normalize(current.de)
    setFeedback(correct ? 'ok' : 'ng')
    if (correct) {
      setOk(n => n + 1)
    } else {
      setNg(n => n + 1)
      ngByCat.current[current.category] = (ngByCat.current[current.category] ?? 0) + 1
    }
    setChecked(true)
    return correct
  }

  return {
    current, idx, ok, ng, done, progress, revealed, checked,
    showHint, feedback,
    ngByCategory: ngByCat.current,
    revealAnswer, toggleHint, advance, reset, submitInput,
  }
}
