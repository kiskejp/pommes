import { useState, useEffect, useRef } from 'react'

/**
 * Web Speech API wrapper for Japanese + German TTS
 * Usage:
 *   const { speak, speaking, hasVoice } = useTTS()
 *   speak('Ich bin Student.', 'de')
 *   speak('私は学生です。', 'ja')
 */
export function useTTS() {
  const [speaking, setSpeaking] = useState(false)
  const [hasJpVoice, setHasJpVoice] = useState(false)
  const [hasDeVoice, setHasDeVoice] = useState(false)
  const voices = useRef({ jp: null, de: null })

  useEffect(() => {
    if (!window.speechSynthesis) return

    const load = () => {
      const all = speechSynthesis.getVoices()
      voices.current.jp = all.find(v => v.lang.startsWith('ja')) ?? null
      voices.current.de = all.find(v => v.lang.startsWith('de')) ?? null
      setHasJpVoice(!!voices.current.jp)
      setHasDeVoice(!!voices.current.de)
    }

    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  const speak = (text, lang = 'de', onEnd) => {
    if (!window.speechSynthesis || !text) return
    speechSynthesis.cancel()

    const utt = new SpeechSynthesisUtterance(text)
    utt.voice  = lang === 'ja' ? voices.current.jp : voices.current.de
    utt.lang   = lang === 'ja' ? 'ja-JP' : 'de-DE'
    utt.rate   = 0.9

    setSpeaking(true)
    utt.onend   = () => { setSpeaking(false); onEnd?.() }
    utt.onerror = () => { setSpeaking(false) }
    speechSynthesis.speak(utt)
  }

  const cancel = () => {
    speechSynthesis?.cancel()
    setSpeaking(false)
  }

  return { speak, cancel, speaking, hasJpVoice, hasDeVoice }
}
