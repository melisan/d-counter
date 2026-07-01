import { useState } from 'react'

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const DAY_NAMES   = ['일','월','화','수','목','금','토']

const PERSON_STYLE = {
  '미선': { dot: 'bg-rose-400',  text: 'text-rose-600'  },
  '진욱': { dot: 'bg-blue-400',  text: 'text-blue-600'  },
}

function pad(n) { return String(n).padStart(2, '0') }

export default function CalendarPage({ data, participants }) {
  const now = new Date()
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey = `${year}-${pad(month + 1)}`
  const monthData = data.months?.[monthKey] || {}

  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month
  const firstDow   = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function navigate(dir) {
    setViewDate(new Date(year, month + dir, 1))
  }

  function getCount(day, name) {
    return monthData[name]?.[`${year}-${pad(month + 1)}-${pad(day)}`] ?? 0
  }

  // Build cells: leading empty slots + day numbers
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-2xl px-4 py-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-xl transition-colors"
        >
          ‹
        </button>
        <h2 className="text-base font-bold text-gray-800">{year}년 {MONTH_NAMES[month]}</h2>
        <button
          onClick={() => navigate(1)}
          disabled={isCurrentMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-xl disabled:opacity-25 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />

          const isToday = isCurrentMonth && now.getDate() === day
          const counts  = participants.map(p => ({ p, count: getCount(day, p.name) }))
          const hasAny  = counts.some(c => c.count > 0)

          return (
            <div
              key={day}
              className={`rounded-xl p-1.5 min-h-[52px] flex flex-col shadow-sm ${
                isToday
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-200'
                  : 'bg-white border border-gray-100'
              }`}
            >
              <span className={`text-[11px] font-semibold text-right leading-none mb-1 ${
                isToday ? 'text-gray-300' : 'text-gray-400'
              }`}>
                {day}
              </span>
              {hasAny && (
                <div className="flex flex-col gap-0.5 mt-auto">
                  {counts.map(({ p, count }) =>
                    count > 0 ? (
                      <div key={p.id} className="flex items-center gap-0.5">
                        <span className="text-[10px] leading-none">{p.icon}</span>
                        <span className={`text-[11px] font-bold tabular-nums ${isToday ? 'text-white' : PERSON_STYLE[p.name]?.text}`}>
                          {count}
                        </span>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-4">
        {participants.map(p => (
          <div key={p.id} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
