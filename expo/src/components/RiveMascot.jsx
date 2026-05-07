import { useRef, useEffect } from 'react'
import { View } from 'react-native'
import Rive, { Fit } from 'rive-react-native'

const RIVE_URL = 'https://kiskejp.github.io/pommes/pommes.riv'

/**
 * Rive mascot — Expo版
 * scene: 0=idle/arms_flap, 1=jump, 2=arms_wiggle(TitleScreenホバー専用), 3=bad
 */
export function RiveMascot({ size = 96, scene = 0 }) {
  const riveRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => {
      riveRef.current?.setInputState('Main', 'scene', scene)
    }, 300)
    return () => clearTimeout(t)
  }, [scene])

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Rive
        ref={riveRef}
        url={RIVE_URL}
        stateMachineName="Main"
        autoplay={true}
        fit={Fit.Contain}
        style={{
          width: size,
          height: size + 16,
          backgroundColor: 'transparent',
        }}
      />
    </View>
  )
}
