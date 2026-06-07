const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function Header({ viewMonth, isCurrentMonth, onPrev, onNext, onSettings }) {
  const [year, month] = viewMonth.split('-')

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-xl transition-colors"
        >
          ‹
        </button>

        <div className="text-center">
          <h1 className="text-base font-bold text-gray-800">🚬 담배 카운터</h1>
          <p className="text-xs text-gray-400">{year}년 {MONTH_NAMES[parseInt(month) - 1]}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onNext}
            disabled={isCurrentMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-xl disabled:opacity-25 transition-colors"
          >
            ›
          </button>
          <button
            onClick={onSettings}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-lg transition-colors"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  )
}
