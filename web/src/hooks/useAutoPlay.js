import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Auto-play hook for CardMode.
 * Flow: JP audio → pause → reveal DE + DE audio → pause → advance → repeat
 *
 * Uses refs for session/speak/pauseDuration so callbacks never go stale.
 * Pass a "smartSpeak" that already handles jp/de enabled state.
 */
export function useAutoPlay({ session, speak, pauseDuration }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [countdown, setCountdown]   = useState(0) // 1→0 ratio during pause

  const isPlayingRef  = useRef(false)
  const timerRef      = useRef(null)
  const intervalRef   = useRef(null)
  const sessionRef    = useRef(session)
  const speakRef      = useRef(speak)
  const pauseRef      = useRef(pauseDuration)

  // Keep refs current
  useEffect(() => { sessionRef.current = session })
  useEffect(() => { speakRef.current = speak })
  useEffect(() => { pauseRef.current = pauseDuration })

  const clearTimers = () => {
    clearTimeout(timerRef.current)
    clearInterval(intervalRef.current)
  }

  const stop = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setCountdown(0)
    clearTimers()
    window.speechSynthesis?.cancel()
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { clearTimers(); window.speechSynthesis?.cancel() }, [])

  // Auto-stop when session finishes
  useEffect(() => {
    if (session.done) stop()
  }, [session.done, stop])

  // Animate countdown bar (ratio 1→0 over `duration` seconds)
  const startCountdown = useCallback((duration, cb) => {
    clearTimers()
    const end = Date.now() + duration * 1000
    intervalRef.current = setInterval(() => {
      setCountdown(Math.max(0, (end - Date.now()) / (duration * 1000)))
    }, 40)
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      setCountdown(0)
      if (isPlayingRef.current) cb()
    }, duration * 1000)
  }, [])

  const runCard = useCallback(() => {
    const s       = sessionRef.current
    const current = s.current
    if (!isPlayingRef.current || !current) return

    const jpText = current.jp_yomi ?? current.jp

    // 4. pause → advance
    const afterDe = () => {
      if (!isPlayingRef.current) return
      startCountdown(pauseRef.current, () => {
        if (!isPlayingRef.current) return
        sessionRef.current.advance() // no score in auto-play
      })
    }

    // 3. reveal DE + speak DE
    const afterJpPause = () => {
      if (!isPlayingRef.current) return
      sessionRef.current.revealAnswer()
      speakRef.current(current.de, 'de', afterDe)
    }

    // 2. pause between JP and DE
    const afterJp = () => {
      if (!isPlayingRef.current) return
      startCountdown(pauseRef.current, afterJpPause)
    }

    // 1. speak JP
    speakRef.current(jpText, 'ja', afterJp)
  }, [startCountdown])

  // When card changes (advance was called), continue playback
  useEffect(() => {
    if (isPlayingRef.current && !session.done && session.current) {
      runCard()
    }
  }, [session.current?.id]) // eslint-disable-line

  const start = useCallback(() => {
    if (sessionRef.current.done) return
    isPlayingRef.current = true
    setIsPlaying(true)
    runCard()
  }, [runCard])

  return { isPlaying, countdown, start, stop }
}
