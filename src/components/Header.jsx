const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function Header({ today, onSettings }) {
  const month = MONTHS[today.getMonth()]
  const date = today.getDate()
  const day = DAYS[today.getDay()]

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-800">🚬 담배 카운터</h1>
          <p className="text-xs text-gray-400">{month} {date}일 ({day})</p>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-lg transition-colors"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}
