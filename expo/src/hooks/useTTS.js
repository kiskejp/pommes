import { useState } from 'react'
import * as Speech from 'expo-speech'

/**
 * expo-speech wrapper for Japanese + German TTS
 * Usage:
 *   const { speak, speaking } = useTTS()
 *   speak('Ich bin Student.', 'de')
 *   speak('私は学生です。', 'ja')
 *   speak(sentence.de, 'de')
 *   speak(sentence.jp_yomi ?? sentence.jp, 'ja')
 */
export function useTTS() {
  const [speaking, setSpeaking] = useState(false)

  const speak = async (text, lang = 'de', onEnd) => {
    if (!text) return
    try {
      const isSpeaking = await Speech.isSpeakingAsync()
      if (isSpeaking) Speech.stop()
    } catch (_) {}

    const language = lang === 'ja' ? 'ja-JP' : 'de-DE'

    setSpeaking(true)
    Speech.speak(text, {
      language,
      rate: 0.9,
      onDone: () => { setSpeaking(false); onEnd?.() },
      onError: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    })
  }

  const cancel = () => {
    Speech.stop()
    setSpeaking(false)
  }

  return { speak, cancel, speaking, hasJpVoice: true, hasDeVoice: true }
}
