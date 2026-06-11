import { useState } from 'react'
import { PARTICIPANTS } from '../constants'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const DAY_NAMES   = ['일','월','화','수','목','금','토']
const DAY_KO      = ['일','월','화','수','목','금','토']

const PERSON_STYLE = {
  '미선': { text: 'text-emerald-600' },
  '진욱': { text: 'text-teal-600'    },
}
const ICON_COMPONENTS = { '미선': MiseonIcon, '진욱': JinwookIcon }

function pad(n) { return String(n).padStart(2, '0') }

export default function SnackCalendarPage({ data }) {
  const now = new Date()
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey    = `${year}-${pad(month + 1)}`
  const monthData   = data.snackMonths?.[monthKey] || {}
  const weights     = data.weights || {}

  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month
  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function navigate(dir) { setViewDate(new Date(year, month + dir, 1)) }

  function getCount(day, name) {
    return monthData[name]?.[`${year}-${pad(month + 1)}-${pad(day)}`] ?? 0
  }
  function getWeight(name, dKey) {
    return weights[name]?.[dKey] ?? null
  }

  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  // Build daily summary for the log section
  const dayEntries = []
  for (let d = daysInMonth; d >= 1; d--) {
    const dKey   = `${year}-${pad(month + 1)}-${pad(d)}`
    const counts = PARTICIPANTS.map(p => ({
      name:   p.name,
      count:  getCount(d, p.name),
      weight: getWeight(p.name, dKey),
    }))
    if (counts.some(c => c.count > 0 || c.weight != null)) {
      dayEntries.push({ d, dKey, dow: new Date(year, month, d).getDay(), counts })
    }
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-2xl px-4 py-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-xl transition-colors">‹</button>
        <h2 className="text-base font-bold text-gray-800">{year}년 {MONTH_NAMES[month]}</h2>
        <button onClick={() => navigate(1)} disabled={isCurrentMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-xl disabled:opacity-25 transition-colors">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const isToday = isCurrentMonth && now.getDate() === day
          const counts  = PARTICIPANTS.map(p => ({ p, count: getCount(day, p.name) }))
          const hasAny  = counts.some(c => c.count > 0)
          return (
            <div key={day} className={`rounded-xl p-1.5 min-h-[52px] flex flex-col shadow-sm ${isToday ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200' : 'bg-white border border-gray-100'}`}>
              <span className={`text-[11px] font-semibold text-right leading-none mb-1 ${isToday ? 'text-white/70' : 'text-gray-400'}`}>{day}</span>
              {hasAny && (
                <div className="flex flex-col gap-0.5 mt-auto">
                  {counts.map(({ p, count }) => count > 0 ? (
                    <div key={p.id} className="flex items-center gap-0.5">
                      <span className="text-[10px] leading-none">🍿</span>
                      <span className={`text-[11px] font-bold tabular-nums ${isToday ? 'text-white' : PERSON_STYLE[p.name]?.text}`}>{count}</span>
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-4">
        {PARTICIPANTS.map(p => {
          const IC = ICON_COMPONENTS[p.name]
          return (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-gray-500">
              {IC && <IC active={true} size={16} />}
              <span>{p.name}</span>
            </div>
          )
        })}
      </div>

      {/* Monthly log */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-gray-600 mb-3 px-1">
          {year}년 {MONTH_NAMES[month]} 간식 &amp; 체중 기록
        </h3>

        {dayEntries.length === 0 ? (
          <div className="bg-white rounded-2xl px-5 py-8 text-center shadow-sm">
            <p className="text-3xl mb-2">🌿</p>
            <p className="text-sm text-gray-400">이달의 간식 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayEntries.map(({ d, dKey, dow, counts }) => (
              <div key={dKey} className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <p className="text-xs font-bold text-gray-500 mb-2">
                  {month + 1}월 {d}일 ({DAY_KO[dow]})
                </p>
                <div className="flex gap-5">
                  {counts.map(({ name, count, weight }) => {
                    const IC = ICON_COMPONENTS[name]
                    const st = PERSON_STYLE[name]
                    const hasData = count > 0 || weight != null
                    return (
                      <div key={name} className="flex items-center gap-2">
                        {IC && <IC active={hasData} size={22} />}
                        <div className="flex flex-col gap-0.5">
                          {count > 0 && (
                            <span className={`text-xs font-bold ${st?.text}`}>🍿 {count}개</span>
                          )}
                          {weight != null && (
                            <span className="text-xs text-gray-500 tabular-nums">⚖️ {weight} kg</span>
                          )}
                          {count === 0 && weight == null && (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
