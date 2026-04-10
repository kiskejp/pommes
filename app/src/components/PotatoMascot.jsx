// components/PotatoMascot.jsx
export function PotatoMascot({ size = 96, variant = 'normal' }) {
  const happy = variant === 'happy' || variant === 'happy-no-mouth'
  const happyNoMouth = variant === 'happy-no-mouth'
  const blinkNoMouth = variant === 'blink-no-mouth'
  const thinking = variant === 'thinking'

  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* body */}
      <rect x="4" y="3" width="8" height="9" rx="0" fill="#d4a96a" />
      <rect x="3" y="4" width="10" height="7" rx="0" fill="#d4a96a" />
      <rect x="4" y="4" width="8" height="7" rx="0" fill="#e0bc85" />
      {/* shadow/depth */}
      <rect x="4" y="10" width="8" height="2" fill="#b8904f" />
      <rect x="3" y="9"  width="1" height="2" fill="#b8904f" />
      <rect x="12" y="9" width="1" height="2" fill="#b8904f" />
      {/* eyes */}
      {happy ? (
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
      ) : blinkNoMouth ? (
        <>
          <rect x="6" y="6" width="1" height="2" fill="#000000">
            <animate attributeName="height" calcMode="discrete"
              values="2;1;0;1;2" keyTimes="0;0.88;0.92;0.96;1"
              dur="4s" repeatCount="indefinite" />
            <animate attributeName="y" calcMode="discrete"
              values="6;7;7;7;6" keyTimes="0;0.88;0.92;0.96;1"
              dur="4s" repeatCount="indefinite" />
          </rect>
          <rect x="9" y="6" width="1" height="2" fill="#000000">
            <animate attributeName="height" calcMode="discrete"
              values="2;1;0;1;2" keyTimes="0;0.88;0.92;0.96;1"
              dur="4s" repeatCount="indefinite" />
            <animate attributeName="y" calcMode="discrete"
              values="6;7;7;7;6" keyTimes="0;0.88;0.92;0.96;1"
              dur="4s" repeatCount="indefinite" />
          </rect>
        </>
      ) : (
        <>
          <rect x="6" y="6" width="1" height="2" fill="#000000" />
          <rect x="9" y="6" width="1" height="2" fill="#000000" />
        </>
      )}
      {/* mouth */}
      {happy && !happyNoMouth ? (
        <>
          <rect x="6" y="8" width="1" height="1" fill="#000000" />
          <rect x="7" y="9" width="2" height="1" fill="#000000" />
          <rect x="9" y="8" width="1" height="1" fill="#000000" />
        </>
      ) : blinkNoMouth || thinking || happyNoMouth ? null : (
        <>
          <rect x="6" y="9" width="4" height="1" fill="#000000" />
          <rect x="7" y="9" width="2" height="1" fill="#000000" />
        </>
      )}
      {/* sprout */}
      <rect x="7"  y="1" width="2" height="2" fill="#6db56d" />
      <rect x="6"  y="2" width="1" height="1" fill="#6db56d" />
      <rect x="9"  y="2" width="1" height="1" fill="#6db56d" />
      {/* arms */}
      {happy ? (
        <>
          <rect x="2" y="5" width="1" height="2" fill="#d4a96a" />
          <rect x="13" y="5" width="1" height="2" fill="#d4a96a" />
        </>
      ) : (
        <>
          <rect x="2"  y="6" width="1" height="2" fill="#d4a96a" />
          <rect x="13" y="6" width="1" height="2" fill="#d4a96a" />
        </>
      )}
      {/* legs */}
      <rect x="5"  y="12" width="2" height="1" fill="#b8904f" />
      <rect x="9"  y="12" width="2" height="1" fill="#b8904f" />
    </svg>
  )
}
