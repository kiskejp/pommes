// components/Mascot.jsx
export function Mascot({ variant = 'normal', animation = 'none', size = 96 }) {
  const happy    = variant === 'happy'
  const thinking = variant === 'thinking'
  const isBounce = animation === 'bounce'
  const isWave   = animation === 'wave'

  // ── eyes ──
  const eyes = happy ? (
    <>
      <rect x="4"  y="6" width="1" height="1" fill="#000000" />
      <rect x="5"  y="5" width="1" height="1" fill="#000000" />
      <rect x="6"  y="6" width="1" height="1" fill="#000000" />
      <rect x="9"  y="6" width="1" height="1" fill="#000000" />
      <rect x="10" y="5" width="1" height="1" fill="#000000" />
      <rect x="11" y="6" width="1" height="1" fill="#000000" />
    </>
  ) : thinking ? (
    <>
      <rect x="6" y="7" width="1" height="1" fill="#000000" />
      <rect x="9" y="7" width="1" height="1" fill="#000000" />
    </>
  ) : (
    <>
      <rect x="6" y="6" width="1" height="2" fill="#000000" />
      <rect x="9" y="6" width="1" height="2" fill="#000000" />
    </>
  )

  // ── mouth ──
  const mouth = happy ? (
    <>
      <rect x="6" y="8" width="1" height="1" fill="#000000" />
      <rect x="7" y="9" width="2" height="1" fill="#000000" />
      <rect x="9" y="8" width="1" height="1" fill="#000000" />
    </>
  ) : (
    <>
      <rect x="6" y="9" width="4" height="1" fill="#000000" />
      <rect x="7" y="9" width="2" height="1" fill="#000000" />
    </>
  )

  // ── arms ──
  const arms = isWave ? (
    <>
      <rect x="2" y="5" width="1" height="2" fill="#d4a96a">
        <animate attributeName="y" calcMode="discrete"
          values="5;6;7;6;5" keyTimes="0;0.25;0.5;0.75;1"
          dur="1.2s" repeatCount="indefinite" />
      </rect>
      <rect x="13" y="7" width="1" height="2" fill="#d4a96a">
        <animate attributeName="y" calcMode="discrete"
          values="7;6;5;6;7" keyTimes="0;0.25;0.5;0.75;1"
          dur="1.2s" repeatCount="indefinite" />
      </rect>
    </>
  ) : (
    <>
      <rect x="2"  y={happy ? 5 : 6} width="1" height="2" fill="#d4a96a" />
      <rect x="13" y={happy ? 5 : 6} width="1" height="2" fill="#d4a96a" />
    </>
  )

  // ── body (shared across animations) ──
  const bodyParts = (
    <>
      <rect x="4"  y="3"  width="8"  height="9" fill="#d4a96a" />
      <rect x="3"  y="4"  width="10" height="7" fill="#d4a96a" />
      <rect x="4"  y="4"  width="8"  height="7" fill="#e0bc85" />
      <rect x="4"  y="10" width="8"  height="2" fill="#b8904f" />
      <rect x="3"  y="9"  width="1"  height="2" fill="#b8904f" />
      <rect x="12" y="9"  width="1"  height="2" fill="#b8904f" />
      {eyes}
      {mouth}
      <rect x="7" y="1" width="2" height="2" fill="#6db56d" />
      <rect x="6" y="2" width="1" height="1" fill="#6db56d" />
      <rect x="9" y="2" width="1" height="1" fill="#6db56d" />
      {arms}
    </>
  )

  // ── feet (static or bouncing) ──
  const feet = isBounce ? (
    <>
      <rect x="5" y="12" width="2" height="1" fill="#b8904f">
        <animate attributeName="y" calcMode="discrete"
          values="12;11;11;12;12" keyTimes="0;0.15;0.45;0.6;1"
          dur="0.9s" repeatCount="indefinite" />
        <animate attributeName="height" calcMode="discrete"
          values="1;2;2;1;1" keyTimes="0;0.15;0.45;0.6;1"
          dur="0.9s" repeatCount="indefinite" />
      </rect>
      <rect x="9" y="12" width="2" height="1" fill="#b8904f">
        <animate attributeName="y" calcMode="discrete"
          values="12;11;11;12;12" keyTimes="0;0.15;0.45;0.6;1"
          dur="0.9s" repeatCount="indefinite" />
        <animate attributeName="height" calcMode="discrete"
          values="1;2;2;1;1" keyTimes="0;0.15;0.45;0.6;1"
          dur="0.9s" repeatCount="indefinite" />
      </rect>
    </>
  ) : (
    <>
      <rect x="5" y="12" width="2" height="1" fill="#b8904f" />
      <rect x="9" y="12" width="2" height="1" fill="#b8904f" />
    </>
  )

  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {isBounce ? (
        <>
          <g>
            <animateTransform attributeName="transform" type="translate"
              values="0,0;0,-1;0,-1;0,0;0,0" keyTimes="0;0.15;0.45;0.6;1"
              calcMode="discrete" dur="0.9s" repeatCount="indefinite" />
            {bodyParts}
          </g>
          {feet}
        </>
      ) : (
        <>
          {bodyParts}
          {feet}
        </>
      )}
    </svg>
  )
}
