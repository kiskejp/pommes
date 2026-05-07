// components/RiveMascot.jsx
import { useEffect, useRef } from 'react'
import { Alignment, Fit, Layout, useRive, EventType } from '@rive-app/react-canvas'

export function RiveMascot({
  size = 96,
  scene = 0,
  onLoop,
  stateMachine = 'Main',
  inputName = 'scene',
}) {
  const onLoopRef = useRef(onLoop)
  onLoopRef.current = onLoop
  const { RiveComponent, rive } = useRive({
    src: `${import.meta.env.BASE_URL}pommes.riv?v=15`,
    stateMachines: stateMachine,
    animations: 'arms_flap',
    autoplay: true,
    background: 'transparent',
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.BottomCenter,
    }),
  })

  useEffect(() => {
    if (!rive) return
    // State machine input にそのまま渡す（scene=2 も含めて）
    // Body層はscene==2の遷移が未定義なのでidleのまま
    // Arms層はscene==2でarms_wiggle、scene==0でarms_flapに遷移
    const sceneInput = rive.stateMachineInputs(stateMachine)?.find(input => input.name === inputName)
    if (sceneInput) sceneInput.value = scene
  }, [rive, scene, stateMachine, inputName])

  useEffect(() => {
    if (!rive) return
    const handler = (e) => onLoopRef.current?.(e)
    rive.on(EventType.Loop, handler)
    return () => rive.off(EventType.Loop, handler)
  }, [rive])

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      flexShrink: 0,
    }}>
      <RiveComponent style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }} />
    </div>
  )
}
