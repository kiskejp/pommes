import { useState, useRef, useCallback, useEffect } from 'react'
import * as Speech from 'expo-speech'

/**
 * Auto-play hook for StudyScreen (Expo版)
 * Flow: JP audio → pause → reveal DE + DE audio → pause → advance → repeat
 */
export function useAutoPlay({ session, speak, pauseDuration }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [countdown, setCountdown]  = useState(0)

  const isPlayingRef = useRef(false)
  const timerRef     = useRef(null)
  const intervalRef  = useRef(null)
  const sessionRef   = useRef(session)
  const speakRef     = useRef(speak)
  const pauseRef     = useRef(pauseDuration)

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
    Speech.stop()
  }, [])

  useEffect(() => () => { clearTimers(); Speech.stop() }, [])

  useEffect(() => {
    if (session.done) stop()
  }, [session.done, stop])

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

    const afterDe = () => {
      if (!isPlayingRef.current) return
      startCountdown(pauseRef.current, () => {
        if (!isPlayingRef.current) return
        sessionRef.current.advance()
      })
    }

    const afterJpPause = () => {
      if (!isPlayingRef.current) return
      sessionRef.current.revealAnswer()
      speakRef.current(current.de, 'de', afterDe)
    }

    const afterJp = () => {
      if (!isPlayingRef.current) return
      startCountdown(pauseRef.current, afterJpPause)
    }

    speakRef.current(jpText, 'ja', afterJp)
  }, [startCountdown])

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
