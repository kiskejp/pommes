// components/RiveMascot.jsx
import { useRive } from '@rive-app/react-canvas'

export function RiveMascot({ size = 96, animations = ['idle'] }) {
  const { RiveComponent } = useRive({
    src: `${import.meta.env.BASE_URL}pommes.riv`,
    animations,
    autoplay: true,
    background: 'transparent',
  })
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <RiveComponent style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }} />
    </div>
  )
}
