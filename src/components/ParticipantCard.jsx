import { useState, useEffect } from 'react'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'

const ICON_COMPONENTS = {
  '미선': MiseonIcon,
  '진욱': JinwookIcon,
}

const THEMES = {
  '미선': {
    header:   'from-rose-400 to-pink-500',
    elapsed:  'bg-rose-50 text-rose-500',
    elapsedLabel: 'text-rose-400',
    btn:      'bg-rose-500 hover:bg-rose-600 shadow-rose-200',
    bar:      'bg-rose-400',
    text:     'text-rose-500',
    badge:    'bg-white/25 text-white',
    shadow:   'shadow-rose-100',
  },
  '진욱': {
    header:   'from-blue-400 to-indigo-500',
    elapsed:  'bg-blue-50 text-blue-500',
    elapsedLabel: 'text-blue-400',
    btn:      'bg-blue-500 hover:bg-blue-600 shadow-blue-200',
    bar:      'bg-blue-400',
    text:     'text-blue-500',
    badge:    'bg-white/25 text-white',
    shadow:   'shadow-blue-100',
  },
}

function formatElapsed(ms) {
  if (ms == null) return null
  const s    = Math.floor(ms / 1000)
  const sec  = s % 60
  const m    = Math.floor(s / 60)
  const min  = m % 60
  const h    = Math.floor(m / 60)
  const hr   = h % 24
  const days = Math.floor(h / 24)
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
    const id = setInterval(() => setElapsed(Date.now() - new Date(lastSmoked).getTime()), 1000)
    return () => clearInterval(id)
  }, [lastSmoked])

  const t           = THEMES[name] || THEMES['진욱']
  const IconComponent = ICON_COMPONENTS[name]
  const remaining = budget - todayCount
  const pct       = budget > 0 ? Math.max(0, Math.round((remaining / budget) * 100)) : 0
  const over      = todayCount > budget

  return (
    <div className={`bg-white rounded-2xl shadow-lg ${t.shadow} overflow-hidden`}>
      {/* Vibrant gradient header */}
      <div className={`bg-gradient-to-r ${t.header} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {IconComponent && <IconComponent active={true} size={44} />}
            <div>
              <p className="text-lg font-bold text-white leading-none">{name}</p>
              <p className="text-xs text-white/70 mt-0.5">일일 목표 {budget}개비</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Elapsed time */}
        <div className={`rounded-xl px-4 py-3 ${t.elapsed}`}>
          <p className={`text-[11px] font-medium mb-0.5 ${t.elapsedLabel}`}>마지막 이후 경과 시간</p>
          <p className="text-2xl font-bold tabular-nums">
            {elapsed != null ? formatElapsed(elapsed) : '—'}
          </p>
        </div>

        {/* Remaining countdown + +/- buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onDecrement}
            disabled={todayCount === 0}
            className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 disabled:opacity-25 text-gray-600 text-3xl font-light transition-all active:scale-95 select-none"
          >
            −
          </button>
          <div className="text-center w-20">
            <p className={`text-5xl font-bold tabular-nums leading-none ${over ? 'text-red-500' : 'text-gray-800'}`}>
              {todayCount}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">피운 개비</p>
          </div>
          <button
            onClick={onIncrement}
            className={`w-14 h-14 rounded-2xl text-white text-3xl font-light transition-all active:scale-95 select-none shadow-lg ${t.btn}`}
          >
            +
          </button>
        </div>

        {/* Draining progress bar */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-gray-400">오늘 남은 한도</span>
            <span className={`text-sm font-bold ${over ? 'text-red-500' : t.text}`}>
              {over ? `${Math.abs(remaining)}개비 초과` : `${remaining} / ${budget}개비`}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : t.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className={`text-[11px] mt-1.5 ${over ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            {over ? `⚠️ 한도 초과` : remaining === 0 ? '🚫 한도 소진' : `${pct}% 남음`}
          </p>
        </div>
      </div>
    </div>
  )
}
