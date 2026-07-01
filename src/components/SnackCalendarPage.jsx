import { useState } from 'react'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const DAY_NAMES   = ['일','월','화','수','목','금','토']
const DAY_KO      = ['일','월','화','수','목','금','토']

const PERSON_STYLE = {
  '미선': { text: 'text-emerald-600', line: '#10b981' },
  '진욱': { text: 'text-teal-600',    line: '#0d9488' },
}
const ICON_COMPONENTS = { '미선': MiseonIcon, '진욱': JinwookIcon }

function pad(n) { return String(n).padStart(2, '0') }

// ── Weight line graph ────────────────────────────────────────────────────────
function WeightGraph({ year, month, daysInMonth, weights, participants }) {
  const series = participants.map(p => {
    const pts = []
    for (let d = 1; d <= daysInMonth; d++) {
      const w = weights[p.name]?.[`${year}-${pad(month + 1)}-${pad(d)}`]
      if (w != null) pts.push({ d, w })
    }
    return { name: p.name, color: PERSON_STYLE[p.name].line, pts }
  })

  const allW = series.flatMap(s => s.pts.map(p => p.w))
  if (allW.length === 0) return null

  const rawMin = Math.min(...allW)
  const rawMax = Math.max(...allW)
  const padding = rawMax === rawMin ? 1 : (rawMax - rawMin) * 0.15
  const minW = rawMin - padding
  const maxW = rawMax + padding

  // SVG coordinate system
  const VW = 300, VH = 130
  const pL = 36, pR = 10, pT = 10, pB = 22
  const cW = VW - pL - pR
  const cH = VH - pT - pB

  const xOf = d  => pL + ((d - 1) / Math.max(daysInMonth - 1, 1)) * cW
  const yOf = w  => pT + (1 - (w - minW) / (maxW - minW)) * cH
  const fmtW = w => Number.isInteger(w * 10) && w.toFixed(1).endsWith('.0') ? w.toFixed(0) : w.toFixed(1)

  // Y axis: 3 evenly spaced ticks
  const yTicks = [minW, (minW + maxW) / 2, maxW]

  // X axis ticks: 1, every 5, last day
  const xTicks = new Set([1])
  for (let d = 5; d <= daysInMonth - 1; d += 5) xTicks.add(d)
  xTicks.add(daysInMonth)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
      <p className="text-xs font-bold text-gray-500 mb-3">⚖️ 체중 변화</p>

      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ height: 140 }}>
        {/* Horizontal grid lines */}
        {yTicks.map((w, i) => (
          <line key={i} x1={pL} y1={yOf(w)} x2={VW - pR} y2={yOf(w)}
            stroke="#f1f5f9" strokeWidth="1" />
        ))}

        {/* Y axis labels */}
        {yTicks.map((w, i) => (
          <text key={i} x={pL - 4} y={yOf(w) + 3.5}
            textAnchor="end" fontSize="8" fill="#94a3b8">
            {fmtW(w)}
          </text>
        ))}

        {/* X axis labels */}
        {[...xTicks].map(d => (
          <text key={d} x={xOf(d)} y={VH - pB + 13}
            textAnchor="middle" fontSize="8" fill="#94a3b8">
            {d}
          </text>
        ))}

        {/* Lines */}
        {series.map(s => s.pts.length > 1 && (
          <polyline key={s.name}
            points={s.pts.map(p => `${xOf(p.d).toFixed(1)},${yOf(p.w).toFixed(1)}`).join(' ')}
            stroke={s.color} strokeWidth="2" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Dots */}
        {series.map(s => s.pts.map(p => (
          <circle key={`${s.name}-${p.d}`}
            cx={xOf(p.d)} cy={yOf(p.w)} r="3"
            fill={s.color} stroke="white" strokeWidth="1.5">
            <title>{s.name}: {p.w} kg ({month + 1}/{p.d})</title>
          </circle>
        )))}

        {/* Last-point value labels */}
        {series.map(s => {
          const last = s.pts[s.pts.length - 1]
          if (!last) return null
          const lx   = xOf(last.d)
          const right = lx > VW * 0.72
          return (
            <text key={s.name}
              x={right ? lx - 5 : lx + 5}
              y={yOf(last.w) - 5}
              textAnchor={right ? 'end' : 'start'}
              fontSize="9" fontWeight="700" fill={s.color}>
              {last.w}
            </text>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-1">
        {series.map(s => (
          <div key={s.name} className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-5 h-0.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SnackCalendarPage({ data, participants }) {
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

  // Daily summary for the log section (most recent first)
  const dayEntries = []
  for (let d = daysInMonth; d >= 1; d--) {
    const dKey   = `${year}-${pad(month + 1)}-${pad(d)}`
    const counts = participants.map(p => ({
      name: p.name, count: getCount(d, p.name), weight: getWeight(p.name, dKey),
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
      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const isToday = isCurrentMonth && now.getDate() === day
          const counts  = participants.map(p => ({ p, count: getCount(day, p.name) }))
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
      <div className="flex gap-4 justify-center mb-6">
        {participants.map(p => {
          const IC = ICON_COMPONENTS[p.name]
          return (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-gray-500">
              {IC && <IC active={true} size={16} />}
              <span>{p.name}</span>
            </div>
          )
        })}
      </div>

      {/* Weight graph */}
      <WeightGraph
        year={year} month={month} daysInMonth={daysInMonth}
        weights={weights} participants={participants}
      />

      {/* Monthly log */}
      <div>
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
                    const IC     = ICON_COMPONENTS[name]
                    const st     = PERSON_STYLE[name]
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
