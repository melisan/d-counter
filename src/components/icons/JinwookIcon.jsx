export default function JinwookIcon({ active = true, size = 32 }) {
  const c = active ? {
    face:     '#C4843C',
    earInner: '#E8A87A',
    snout:    '#DDA872',
    eyes:     '#1A1010',
    shine:    '#FFFFFF',
    nose:     '#1A1010',
    mouth:    '#1A1010',
  } : {
    face:     '#989898',
    earInner: '#BEB0A8',
    snout:    '#B4B4B4',
    eyes:     '#444444',
    shine:    '#FFFFFF',
    nose:     '#444444',
    mouth:    '#444444',
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <circle cx="14" cy="18" r="11" fill={c.face}/>
      <circle cx="50" cy="18" r="11" fill={c.face}/>
      {/* Inner ears */}
      <circle cx="14" cy="18" r="7" fill={c.earInner}/>
      <circle cx="50" cy="18" r="7" fill={c.earInner}/>
      {/* Main face */}
      <circle cx="32" cy="37" r="22" fill={c.face}/>
      {/* Snout */}
      <ellipse cx="32" cy="44" rx="12" ry="9" fill={c.snout}/>
      {/* Eyes */}
      <circle cx="22" cy="31" r="5" fill={c.eyes}/>
      <circle cx="42" cy="31" r="5" fill={c.eyes}/>
      {/* Eye shine */}
      <circle cx="23.5" cy="29.5" r="1.8" fill={c.shine}/>
      <circle cx="43.5" cy="29.5" r="1.8" fill={c.shine}/>
      {/* Nose */}
      <ellipse cx="32" cy="40" rx="4" ry="3" fill={c.nose}/>
      {/* Mouth */}
      <path d="M29 45 Q32 49 35 45" stroke={c.mouth} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
