import { useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'
import Svg, { Rect } from 'react-native-svg'

/**
 * PotatoMascot — React Native版
 * variant: 'normal' | 'happy' | 'happy-no-mouth' | 'blink-no-mouth' | 'thinking'
 * animation: 'none' | 'bounce' | 'float'
 */
export function Mascot({ size = 96, variant = 'blink-no-mouth', animation = 'float' }) {
  const happy        = variant === 'happy' || variant === 'happy-no-mouth'
  const happyNoMouth = variant === 'happy-no-mouth'
  const blinkNoMouth = variant === 'blink-no-mouth'
  const thinking     = variant === 'thinking'

  // まばたき状態（blink-no-mouth用）
  const [eyeOpen, setEyeOpen] = useState(true)
  useEffect(() => {
    if (!blinkNoMouth) return
    const schedule = () => {
      const openTime  = 3200 + Math.random() * 1000
      const closeTime = 100
      const t1 = setTimeout(() => {
        setEyeOpen(false)
        const t2 = setTimeout(() => {
          setEyeOpen(true)
          schedule()
        }, closeTime)
        return () => clearTimeout(t2)
      }, openTime)
      return () => clearTimeout(t1)
    }
    const cleanup = schedule()
    return cleanup
  }, [blinkNoMouth])

  // float アニメーション（ゆっくり上下）
  const floatY = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (animation !== 'float') { floatY.setValue(0); return }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -6, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatY, { toValue:  0, duration: 1800, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [animation, floatY])

  // bounce アニメーション（完了画面など）
  const bounceY = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (animation !== 'bounce') { bounceY.setValue(0); return }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, { toValue: -12, duration: 300, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue:   0, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [animation, bounceY])

  const translateY = animation === 'bounce' ? bounceY : floatY

  const eyeH = blinkNoMouth ? (eyeOpen ? 2 : 0) : 2
  const eyeY = blinkNoMouth ? (eyeOpen ? 6 : 7) : 6

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <Svg width={size} height={size} viewBox="0 0 16 16">
        {/* body */}
        <Rect x="4" y="3" width="8" height="9" fill="#d4a96a" />
        <Rect x="3" y="4" width="10" height="7" fill="#d4a96a" />
        <Rect x="4" y="4" width="8" height="7" fill="#e0bc85" />
        {/* shadow */}
        <Rect x="4" y="10" width="8" height="2" fill="#b8904f" />
        <Rect x="3" y="9"  width="1" height="2" fill="#b8904f" />
        <Rect x="12" y="9" width="1" height="2" fill="#b8904f" />
        {/* eyes */}
        {happy ? (
          <>
            <Rect x="4"  y="6" width="1" height="1" fill="#000" />
            <Rect x="5"  y="5" width="1" height="1" fill="#000" />
            <Rect x="6"  y="6" width="1" height="1" fill="#000" />
            <Rect x="9"  y="6" width="1" height="1" fill="#000" />
            <Rect x="10" y="5" width="1" height="1" fill="#000" />
            <Rect x="11" y="6" width="1" height="1" fill="#000" />
          </>
        ) : thinking ? (
          <>
            <Rect x="6" y="7" width="1" height="1" fill="#000" />
            <Rect x="9" y="7" width="1" height="1" fill="#000" />
          </>
        ) : (
          // normal / blink-no-mouth
          <>
            <Rect x="6" y={eyeY} width="1" height={eyeH} fill="#000" />
            <Rect x="9" y={eyeY} width="1" height={eyeH} fill="#000" />
          </>
        )}
        {/* mouth */}
        {happy && !happyNoMouth ? (
          <>
            <Rect x="6" y="8" width="1" height="1" fill="#000" />
            <Rect x="7" y="9" width="2" height="1" fill="#000" />
            <Rect x="9" y="8" width="1" height="1" fill="#000" />
          </>
        ) : blinkNoMouth || thinking || happyNoMouth ? null : (
          <>
            <Rect x="6" y="9" width="4" height="1" fill="#000" />
            <Rect x="7" y="9" width="2" height="1" fill="#000" />
          </>
        )}
        {/* sprout */}
        <Rect x="7" y="1" width="2" height="2" fill="#6db56d" />
        <Rect x="6" y="2" width="1" height="1" fill="#6db56d" />
        <Rect x="9" y="2" width="1" height="1" fill="#6db56d" />
        {/* arms */}
        {happy ? (
          <>
            <Rect x="2"  y="5" width="1" height="2" fill="#d4a96a" />
            <Rect x="13" y="5" width="1" height="2" fill="#d4a96a" />
          </>
        ) : (
          <>
            <Rect x="2"  y="6" width="1" height="2" fill="#d4a96a" />
            <Rect x="13" y="6" width="1" height="2" fill="#d4a96a" />
          </>
        )}
        {/* legs */}
        <Rect x="5"  y="12" width="2" height="1" fill="#b8904f" />
        <Rect x="9"  y="12" width="2" height="1" fill="#b8904f" />
      </Svg>
    </Animated.View>
  )
}
