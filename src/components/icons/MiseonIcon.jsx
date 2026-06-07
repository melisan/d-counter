export default function MiseonIcon({ active = true, size = 32 }) {
  const c = active ? {
    outer:    '#3E3D5C',
    face:     '#EDE8DE',
    earInner: '#F5A0C0',
    eyeRing:  '#FFFFFF',
    iris:     '#5BAEE8',
    pupil:    '#1A2535',
    shine:    '#FFFFFF',
    snout:    '#F5F0E8',
    nose:     '#1A1A1A',
    mouth:    '#4A4A4A',
  } : {
    outer:    '#606060',
    face:     '#D8D8D8',
    earInner: '#B5A8B0',
    eyeRing:  '#FFFFFF',
    iris:     '#909090',
    pupil:    '#3A3A3A',
    shine:    '#FFFFFF',
    snout:    '#E0E0E0',
    nose:     '#3A3A3A',
    mouth:    '#808080',
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pointed husky ears */}
      <polygon points="6,32 15,5 27,32" fill={c.outer}/>
      <polygon points="37,32 49,5 58,32" fill={c.outer}/>
      {/* Pink inner ears */}
      <polygon points="10,30 15,9 24,30" fill={c.earInner}/>
      <polygon points="40,30 49,9 54,30" fill={c.earInner}/>
      {/* Outer face — dark husky mask */}
      <circle cx="32" cy="36" r="21" fill={c.outer}/>
      {/* Inner face — cream blaze */}
      <ellipse cx="32" cy="38" rx="14" ry="17" fill={c.face}/>
      {/* Eyes */}
      <circle cx="22" cy="31" r="5.5" fill={c.eyeRing}/>
      <circle cx="42" cy="31" r="5.5" fill={c.eyeRing}/>
      <circle cx="22" cy="31" r="4" fill={c.iris}/>
      <circle cx="42" cy="31" r="4" fill={c.iris}/>
      <circle cx="22" cy="31" r="2.5" fill={c.pupil}/>
      <circle cx="42" cy="31" r="2.5" fill={c.pupil}/>
      <circle cx="23.5" cy="29.5" r="1.2" fill={c.shine}/>
      <circle cx="43.5" cy="29.5" r="1.2" fill={c.shine}/>
      {/* Snout */}
      <ellipse cx="32" cy="43" rx="9" ry="7" fill={c.snout}/>
      {/* Nose */}
      <ellipse cx="32" cy="39" rx="4" ry="3" fill={c.nose}/>
      {/* Mouth */}
      <path d="M29 44 Q32 47.5 35 44" stroke={c.mouth} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
