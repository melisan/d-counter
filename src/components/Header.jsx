const DAYS   = ['일','월','화','수','목','금','토']
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function Header({ today, onSettings, mode, onModeChange, adminMode, onAdminToggle }) {
  const showAdmin = mode === 'grace'

  return (
    <header className="bg-gradient-to-r from-violet-600 to-purple-700 sticky top-0 z-10 shadow-lg shadow-purple-200">
      <div className="max-w-lg mx-auto px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">D- 카운터</h1>
            <p className="text-xs text-violet-300">
              {MONTHS[today.getMonth()]} {today.getDate()}일 ({DAYS[today.getDay()]})
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showAdmin && (
              <button
                onClick={onAdminToggle}
                title={adminMode ? '관리 모드 끄기' : '관리 모드 켜기'}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-colors ${
                  adminMode
                    ? 'bg-white/25 text-white ring-1 ring-white/40'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                {adminMode ? '🔓' : '🔐'}
              </button>
            )}
            <button
              onClick={onSettings}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white text-lg transition-colors"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Mode toggle — 4 options */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => onModeChange('smoke')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'smoke' ? 'bg-white text-violet-700 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            D
          </button>
          <button
            onClick={() => onModeChange('rage')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'rage' ? 'bg-white text-orange-600 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            😤 분노
          </button>
          <button
            onClick={() => onModeChange('grace')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'grace' ? 'bg-white text-amber-600 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            🙏 감사
          </button>
          <button
            onClick={() => onModeChange('snack')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'snack' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            🍿 간식
          </button>
        </div>
      </div>
    </header>
  )
}
