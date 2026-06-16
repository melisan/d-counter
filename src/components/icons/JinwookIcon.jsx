export default function JinwookIcon({ active = true, size = 32 }) {
  return (
    <img
      src={active ? '/White_happy_icon.png' : '/White_sleeping_icon.png'}
      alt="진욱"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  )
}
