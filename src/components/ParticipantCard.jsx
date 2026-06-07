import { useState } from 'react'

const THEMES = {
  '미선': {
    gradient: 'from-rose-50 to-pink-50',
    badge: 'bg-rose-100 text-rose-700',
    btn: 'bg-rose-500 hover:bg-rose-600',
    bar: 'bg-rose-400',
    barOver: 'bg-red-400',
    text: 'text-rose-600',
    ring: 'focus:ring-rose-300',
  },
  '진욱': {
    gradient: 'from-blue-50 to-indigo-50',
    badge: 'bg-blue-100 text-blue-700',
    btn: 'bg-blue-500 hover:bg-blue-600',
    bar: 'bg-blue-400',
    barOver: 'bg-red-400',
    text: 'text-blue-600',
    ring: 'focus:ring-blue-300',
  },
}

const DEFAULT_THEME = THEMES['진욱']

export default function ParticipantCard({
  name,
  todayCount,
  monthTotal,
  budget,
  dailyLog,
  isCurrentMonth,
  onIncrement,
  onDecrement,
}) {
  const [showLog, setShowLog] = useState(false)
  const t = THEMES[name] ?? DEFAULT_THEME
  const pct = budget > 0 ? Math.min(100, Math.round((monthTotal / budget) * 100)) : 0
  const over = monthTotal > budget
  const remaining = budget - monthTotal

  const sortedDays = Object.entries(dailyLog)
    .filter(([, v]) => v > 0)
    .sort(([a], [b]) => b.localeCompare(a))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Card header */}
      <div className={`bg-gradient-to-r ${t.gradient} px-5 pt-4 pb-3`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1 ${t.badge}`}>
              {name}
            </span>
            <p className="text-xs text-gray-400">월간 한도 {budget}개비</p>
          </div>
          <span className="text-3xl select-none">🚬</span>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Today counter — only show in current month */}
        {isCurrentMonth && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-0.5">오늘</p>
              <p className="text-4xl font-bold text-gray-800 leading-none">
                {todayCount}
                <span className="text-sm font-normal text-gray-400 ml-1">개비</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onDecrement}
                disabled={todayCount === 0}
                className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-25 text-gray-700 text-2xl font-light transition-all active:scale-95 select-none"
              >
                −
              </button>
              <button
                onClick={onIncrement}
                className={`w-11 h-11 rounded-full text-white text-2xl font-light transition-all active:scale-95 select-none ${t.btn}`}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Monthly progress */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-gray-400">이번 달 합계</span>
            <span className={`text-sm font-bold ${over ? 'text-red-500' : t.text}`}>
              {monthTotal} / {budget}
              <span className="text-xs font-normal text-gray-400 ml-0.5">개비</span>
            </span>
          </div>

          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${over ? t.barOver : t.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] mt-1.5">
            <span className={over ? 'text-red-500 font-medium' : 'text-gray-400'}>
              {over ? `⚠️ ${monthTotal - budget}개비 초과` : `${pct}% 사용`}
            </span>
            {!over && (
              <span className="text-gray-400">남은 한도 {remaining}개비</span>
            )}
          </div>
        </div>

        {/* Daily log toggle */}
        {sortedDays.length > 0 && (
          <>
            <button
              onClick={() => setShowLog(v => !v)}
              className="mt-4 w-full text-[11px] text-gray-400 hover:text-gray-500 transition-colors py-1"
            >
              {showLog ? '▲ 기록 접기' : `▼ 일별 기록 (${sortedDays.length}일)`}
            </button>

            {showLog && (
              <div className="mt-2 max-h-44 overflow-y-auto rounded-xl bg-gray-50 px-3 py-2 space-y-0.5">
                {sortedDays.map(([day, count]) => {
                  const [, mm, dd] = day.split('-')
                  return (
                    <div key={day} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <span className="text-xs text-gray-500">{parseInt(mm)}월 {parseInt(dd)}일</span>
                      <span className="text-xs font-semibold text-gray-700">{count}개비</span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {!isCurrentMonth && sortedDays.length === 0 && (
          <p className="text-center text-xs text-gray-300 mt-3">기록 없음</p>
        )}
      </div>
    </div>
  )
}
