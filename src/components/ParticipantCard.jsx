import { useState, useEffect } from 'react'

const THEMES = {
  '미선': {
    gradient: 'from-rose-50 to-pink-50',
    badge: 'bg-rose-100 text-rose-700',
    btn: 'bg-rose-500 hover:bg-rose-600',
    bar: 'bg-rose-400',
    text: 'text-rose-600',
  },
  '진욱': {
    gradient: 'from-blue-50 to-indigo-50',
    badge: 'bg-blue-100 text-blue-700',
    btn: 'bg-blue-500 hover:bg-blue-600',
    bar: 'bg-blue-400',
    text: 'text-blue-600',
  },
}

const DEFAULT_THEME = THEMES['진욱']

function formatElapsed(ms) {
  if (ms == null) return null
  const totalSec = Math.floor(ms / 1000)
  const sec = totalSec % 60
  const totalMin = Math.floor(totalSec / 60)
  const min = totalMin % 60
  const totalHr = Math.floor(totalMin / 60)
  const hr = totalHr % 24
  const days = Math.floor(totalHr / 24)

  if (days > 0) return `${days}일 ${hr}시간 ${min}분`
  if (hr > 0)   return `${hr}시간 ${min}분 ${sec}초`
  return `${min}분 ${sec}초`
}

export default function ParticipantCard({
  name, todayCount, monthTotal, budget, lastSmoked,
  onIncrement, onDecrement,
}) {
  const [elapsed, setElapsed] = useState(
    lastSmoked ? Date.now() - new Date(lastSmoked).getTime() : null
  )

  useEffect(() => {
    if (!lastSmoked) { setElapsed(null); return }
    setElapsed(Date.now() - new Date(lastSmoked).getTime())
    const id = setInterval(() => {
      setElapsed(Date.now() - new Date(lastSmoked).getTime())
    }, 1000)
    return () => clearInterval(id)
  }, [lastSmoked])

  const t = THEMES[name] ?? DEFAULT_THEME
  const pct = budget > 0 ? Math.min(100, Math.round((monthTotal / budget) * 100)) : 0
  const over = monthTotal > budget

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Name badge */}
      <div className={`bg-gradient-to-r ${t.gradient} px-5 pt-4 pb-3 flex items-center justify-between`}>
        <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${t.badge}`}>
          {name}
        </span>
        <span className="text-2xl select-none">🚬</span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Elapsed time */}
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400 mb-1">마지막 이후 경과 시간</p>
          <p className={`text-2xl font-bold tabular-nums ${elapsed != null ? t.text : 'text-gray-300'}`}>
            {elapsed != null ? formatElapsed(elapsed) : '기록 없음'}
          </p>
        </div>

        {/* Today counter */}
        <div className="flex items-center justify-between">
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
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-25 text-gray-700 text-2xl font-light transition-all active:scale-95 select-none"
            >
              −
            </button>
            <button
              onClick={onIncrement}
              className={`w-12 h-12 rounded-full text-white text-2xl font-light transition-all active:scale-95 select-none ${t.btn}`}
            >
              +
            </button>
          </div>
        </div>

        {/* Monthly progress */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-gray-400">이번 달 합계</span>
            <span className={`text-sm font-bold ${over ? 'text-red-500' : t.text}`}>
              {monthTotal} / {budget}
              <span className="text-xs font-normal text-gray-400 ml-0.5">개비</span>
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : t.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] mt-1">
            <span className={over ? 'text-red-500 font-medium' : 'text-gray-400'}>
              {over ? `⚠️ ${monthTotal - budget}개비 초과` : `${pct}% 사용`}
            </span>
            {!over && <span className="text-gray-400">남은 한도 {budget - monthTotal}개비</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
