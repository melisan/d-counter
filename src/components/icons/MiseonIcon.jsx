export default function MiseonIcon({ active = true, size = 32 }) {
  return (
    <img
      src={active ? '/husky_happy_icon.png' : '/husky_sleeping_icon.png'}
      alt="미선"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  )
}
