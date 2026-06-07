import { useState, useEffect } from 'react'

const THEMES = {
  '미선': {
    gradient: 'from-rose-50 to-pink-50',
    badge:    'bg-rose-100 text-rose-700',
    btn:      'bg-rose-500 hover:bg-rose-600',
    bar:      'bg-rose-400',
    text:     'text-rose-600',
    elapsed:  'text-rose-500',
  },
  '진욱': {
    gradient: 'from-blue-50 to-indigo-50',
    badge:    'bg-blue-100 text-blue-700',
    btn:      'bg-blue-500 hover:bg-blue-600',
    bar:      'bg-blue-400',
    text:     'text-blue-600',
    elapsed:  'text-blue-500',
  },
}

function formatElapsed(ms) {
  if (ms == null) return null
  const s   = Math.floor(ms / 1000)
  const sec = s % 60
  const m   = Math.floor(s / 60)
  const min = m % 60
  const h   = Math.floor(m / 60)
  const hr  = h % 24
  const days = Math.floor(h / 24)
  if (days > 0) return `${days}일 ${hr}시간 ${min}분`
  if (hr > 0)   return `${hr}시간 ${min}분 ${sec}초`
  return `${min}분 ${sec}초`
}

export default function ParticipantCard({
  name, icon, todayCount, monthTotal, budget, lastSmoked,
  onIncrement, onDecrement,
}) {
  const [elapsed, setElapsed] = useState(
    lastSmoked ? Date.now() - new Date(lastSmoked).getTime() : null
  )

  useEffect(() => {
    if (!lastSmoked) { setElapsed(null); return }
    setElapsed(Date.now() - new Date(lastSmoked).getTime())
    const id = setInterval(() => setElapsed(Date.now() - new Date(lastSmoked).getTime()), 1000)
    return () => clearInterval(id)
  }, [lastSmoked])

  const t    = THEMES[name] || THEMES['진욱']
  const pct  = budget > 0 ? Math.min(100, Math.round((todayCount / budget) * 100)) : 0
  const over = todayCount > budget

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Person header */}
      <div className={`bg-gradient-to-r ${t.gradient} px-5 pt-5 pb-4`}>
        <div className="flex items-center gap-3">
          <span className="text-5xl leading-none">{icon}</span>
          <div>
            <span className={`inline-block text-sm font-bold px-2.5 py-0.5 rounded-full ${t.badge}`}>{name}</span>
            <p className="text-xs text-gray-400 mt-0.5">일일 목표 {budget}개비</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Elapsed time */}
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400 mb-1">마지막 이후 경과 시간</p>
          <p className={`text-2xl font-bold tabular-nums ${elapsed != null ? t.elapsed : 'text-gray-300'}`}>
            {elapsed != null ? formatElapsed(elapsed) : '기록 없음'}
          </p>
        </div>

        {/* Today counter */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-0.5">오늘</p>
            <p className="text-5xl font-bold text-gray-800 leading-none">
              {todayCount}
              <span className="text-base font-normal text-gray-400 ml-1.5">개비</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onDecrement}
              disabled={todayCount === 0}
              className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-25 text-gray-700 text-3xl font-light transition-all active:scale-95 select-none"
            >
              −
            </button>
            <button
              onClick={onIncrement}
              className={`w-14 h-14 rounded-full text-white text-3xl font-light transition-all active:scale-95 select-none ${t.btn}`}
            >
              +
            </button>
          </div>
        </div>

        {/* Daily progress */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-gray-400">오늘 목표</span>
            <span className={`text-sm font-bold ${over ? 'text-red-500' : t.text}`}>
              {todayCount} / {budget}
              <span className="text-xs font-normal text-gray-400 ml-0.5">개비</span>
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : t.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] mt-1.5">
            <span className={over ? 'text-red-500 font-medium' : 'text-gray-400'}>
              {over ? `⚠️ ${todayCount - budget}개비 초과` : `${pct}% 사용`}
            </span>
            {!over && <span className="text-gray-400">남은 한도 {budget - todayCount}개비</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
