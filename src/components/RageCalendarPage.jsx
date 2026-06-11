import { useState, useEffect } from 'react'
import { PARTICIPANTS } from '../constants'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const DAY_NAMES   = ['일','월','화','수','목','금','토']

const PERSON_STYLE = {
  '미선': { text: 'text-rose-600',   ring: 'focus:ring-red-300',    saveBtn: 'bg-red-500 hover:bg-red-600 text-white'    },
  '진욱': { text: 'text-orange-600', ring: 'focus:ring-orange-300', saveBtn: 'bg-orange-500 hover:bg-orange-600 text-white' },
}

const ICON_COMPONENTS = {
  '미선': MiseonIcon,
  '진욱': JinwookIcon,
}

function pad(n) { return String(n).padStart(2, '0') }

export default function RageCalendarPage({ data, adminMode, onEditMemo, onDeleteEntry }) {
  const now = new Date()
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [editingTs, setEditingTs] = useState(null)
  const [editMemo, setEditMemo]   = useState('')

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey   = `${year}-${pad(month + 1)}`
  const monthRage  = data.rageMonths?.[monthKey] || {}

  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month
  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Cancel any open edit when admin mode turns off
  useEffect(() => { if (!adminMode) setEditingTs(null) }, [adminMode])

  function navigate(dir) { setViewDate(new Date(year, month + dir, 1)) }

  function getDayCount(day, name) {
    return (monthRage[name]?.[`${year}-${pad(month + 1)}-${pad(day)}`] ?? []).length
  }

  function startEdit(ev) { setEditingTs(ev.ts); setEditMemo(ev.memo) }
  function commitEdit(name) { onEditMemo(name, editingTs, editMemo.trim()); setEditingTs(null) }
  function cancelEdit() { setEditingTs(null) }

  // Build calendar cells
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  // Collect all rage entries for this month for the log
  const allEntries = []
  PARTICIPANTS.forEach(p => {
    const personDays = monthRage[p.name] || {}
    Object.entries(personDays).forEach(([, events]) => {
      events.forEach(ev => allEntries.push({ ...ev, name: p.name }))
    })
  })
  allEntries.sort((a, b) => new Date(b.ts) - new Date(a.ts))

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
          const counts  = PARTICIPANTS.map(p => ({ p, count: getDayCount(day, p.name) }))
          const hasAny  = counts.some(c => c.count > 0)
          return (
            <div
              key={day}
              className={`rounded-xl p-1.5 min-h-[52px] flex flex-col shadow-sm ${
                isToday
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-orange-200'
                  : 'bg-white border border-gray-100'
              }`}
            >
              <span className={`text-[11px] font-semibold text-right leading-none mb-1 ${isToday ? 'text-white/70' : 'text-gray-400'}`}>{day}</span>
              {hasAny && (
                <div className="flex flex-col gap-0.5 mt-auto">
                  {counts.map(({ p, count }) =>
                    count > 0 ? (
                      <div key={p.id} className="flex items-center gap-0.5">
                        <span className="text-[10px] leading-none">😤</span>
                        <span className={`text-[11px] font-bold tabular-nums ${isToday ? 'text-white' : PERSON_STYLE[p.name]?.text}`}>{count}</span>
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
          {year}년 {MONTH_NAMES[month]} 분노 기록
          {allEntries.length > 0 && <span className="ml-2 text-[11px] font-normal text-gray-400">{allEntries.length}건</span>}
          {adminMode && <span className="ml-2 text-[11px] text-orange-400">✏️ 관리 모드</span>}
        </h3>

        {allEntries.length === 0 ? (
          <div className="bg-white rounded-2xl px-5 py-8 text-center shadow-sm">
            <p className="text-3xl mb-2">🕊️</p>
            <p className="text-sm text-gray-400">이달의 분노 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allEntries.map((ev) => {
              const IC  = ICON_COMPONENTS[ev.name]
              const st  = PERSON_STYLE[ev.name]
              const d   = new Date(ev.ts)
              const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
              const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

              if (editingTs === ev.ts) {
                return (
                  <div key={ev.ts} className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {IC && <IC active={true} size={20} />}
                      <span className={`text-xs font-bold ${st?.text}`}>{ev.name}</span>
                      <span className="text-[11px] text-gray-400 tabular-nums">{dateStr} {timeStr}</span>
                    </div>
                    <textarea
                      value={editMemo}
                      onChange={e => setEditMemo(e.target.value)}
                      rows={2}
                      autoFocus
                      className={`w-full text-sm bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 resize-none focus:outline-none focus:ring-2 ${st?.ring}`}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(ev.name) } }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => commitEdit(ev.name)} className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${st?.saveBtn}`}>저장</button>
                      <button onClick={cancelEdit} className="flex-1 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold">취소</button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={ev.ts} className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {IC ? <IC active={true} size={28} /> : <span>😤</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className={`text-xs font-bold ${st?.text}`}>{ev.name}</span>
                      <span className="text-[11px] text-gray-400 tabular-nums">{dateStr} {timeStr}</span>
                    </div>
                    <p className={`text-sm ${ev.memo ? 'text-gray-700' : 'text-gray-300 italic'}`}>
                      {ev.memo || '메모 없음'}
                    </p>
                  </div>
                  {adminMode ? (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(ev)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-sm transition-colors"
                        title="메모 편집"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteEntry(ev.name, ev.ts)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-red-50 text-sm transition-colors"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <span className="text-xl shrink-0 mt-0.5">😤</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
