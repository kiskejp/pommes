// components/RiveMascot.jsx
import { useEffect } from 'react'
import { useRive } from '@rive-app/react-canvas'

export function RiveMascot({ size = 96, scene = 0 }) {
  const { RiveComponent, rive } = useRive({
    src: `${import.meta.env.BASE_URL}pommes.riv`,
    stateMachines: 'Main',
    autoplay: true,
    background: 'transparent',
  })

  useEffect(() => {
    if (!rive) return
    const inputs = rive.stateMachineInputs('Main')
    const sceneInput = inputs?.find(i => i.name === 'scene')
    if (sceneInput) sceneInput.value = scene
  }, [rive, scene])

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <RiveComponent style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }} />
    </div>
  )
}
