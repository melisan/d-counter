const DAYS   = ['일','월','화','수','목','금','토']
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function Header({ today, onSettings }) {
  return (
    <header className="bg-gradient-to-r from-violet-600 to-purple-700 sticky top-0 z-10 shadow-lg shadow-purple-200">
      <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">D- 카운터</h1>
          <p className="text-xs text-violet-300">
            {MONTHS[today.getMonth()]} {today.getDate()}일 ({DAYS[today.getDay()]})
          </p>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white text-lg transition-colors"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}
