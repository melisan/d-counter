import { useState } from 'react'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'
import { RAGE_SECTIONS } from './RageCard'

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const DAY_NAMES   = ['일','월','화','수','목','금','토']

const PERSON_STYLE = {
  '미선': { text: 'text-rose-600',   ring: 'focus:ring-rose-300',   saveBtn: 'bg-rose-500 hover:bg-rose-600 text-white'   },
  '진욱': { text: 'text-orange-600', ring: 'focus:ring-orange-300', saveBtn: 'bg-orange-500 hover:bg-orange-600 text-white' },
}
const ICON_COMPONENTS = { '미선': MiseonIcon, '진욱': JinwookIcon }

function pad(n) { return String(n).padStart(2, '0') }

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function getSection(ev, key) {
  if (ev[key] != null) return ev[key]
  if (key === '기록' && ev.memo) return { text: ev.memo, ts: ev.ts }
  return null
}

export default function RageCalendarPage({ data, participants, onEditSection, onDeleteEntry }) {
  const now = new Date()
  const [viewDate, setViewDate]   = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [editState, setEditState] = useState(null) // { name, entryTs, key, text }

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey   = `${year}-${pad(month + 1)}`
  const monthRage  = data.rageMonths?.[monthKey] || {}

  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month
  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function navigate(dir) { setViewDate(new Date(year, month + dir, 1)) }

  function getDayCount(day, name) {
    return (monthRage[name]?.[`${year}-${pad(month + 1)}-${pad(day)}`] ?? []).length
  }

  function startEdit(name, entryTs, key, text) {
    setEditState({ name, entryTs, key, text: text || '' })
  }
  function commitEdit() {
    if (!editState) return
    onEditSection(editState.name, editState.entryTs, editState.key, editState.text.trim())
    setEditState(null)
  }

  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const allEntries = []
  participants.forEach(p => {
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
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-xl">‹</button>
        <h2 className="text-base font-bold text-gray-800">{year}년 {MONTH_NAMES[month]}</h2>
        <button onClick={() => navigate(1)} disabled={isCurrentMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-xl disabled:opacity-25">›</button>
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
          const counts  = participants.map(p => ({ p, count: getDayCount(day, p.name) }))
          const hasAny  = counts.some(c => c.count > 0)
          return (
            <div key={day} className={`rounded-xl p-1.5 min-h-[52px] flex flex-col shadow-sm ${isToday ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-200' : 'bg-white border border-gray-100'}`}>
              <span className={`text-[11px] font-semibold text-right leading-none mb-1 ${isToday ? 'text-white/70' : 'text-gray-400'}`}>{day}</span>
              {hasAny && (
                <div className="flex flex-col gap-0.5 mt-auto">
                  {counts.map(({ p, count }) => count > 0 ? (
                    <div key={p.id} className="flex items-center gap-0.5">
                      <span className="text-[10px] leading-none">😤</span>
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

      {/* Monthly log */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-gray-600 mb-3 px-1">
          {year}년 {MONTH_NAMES[month]} 분노 기록
          {allEntries.length > 0 && <span className="ml-2 text-[11px] font-normal text-gray-400">{allEntries.length}건</span>}
        </h3>

        {allEntries.length === 0 ? (
          <div className="bg-white rounded-2xl px-5 py-8 text-center shadow-sm">
            <p className="text-3xl mb-2">🕊️</p>
            <p className="text-sm text-gray-400">이달의 분노 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allEntries.map((ev) => {
              const IC = ICON_COMPONENTS[ev.name]
              const st = PERSON_STYLE[ev.name]
              const d  = new Date(ev.ts)
              const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${fmtTime(ev.ts)}`

              return (
                <div key={ev.ts} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                  {/* Entry header */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    {IC && <IC active={true} size={20} />}
                    <span className={`text-xs font-bold ${st?.text}`}>{ev.name}</span>
                    <span className="text-[11px] text-gray-400 tabular-nums">{dateStr}</span>
                    <button
                      onClick={() => onDeleteEntry(ev.name, ev.ts)}
                      className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-sm transition-colors"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Sections */}
                  <div className="divide-y divide-gray-50">
                    {RAGE_SECTIONS.map(sec => {
                      const secData  = getSection(ev, sec.key)
                      const isEditing = editState?.name === ev.name && editState?.entryTs === ev.ts && editState?.key === sec.key

                      return (
                        <div key={sec.key} className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm leading-none">{sec.icon}</span>
                            <span className={`text-xs font-semibold ${st?.text}`}>{sec.key}</span>
                            {secData && (
                              <span className="text-[10px] text-gray-300 tabular-nums">· {fmtTime(secData.ts)}</span>
                            )}
                          </div>

                          {isEditing ? (
                            <div>
                              <textarea
                                value={editState.text}
                                onChange={e => setEditState(s => ({ ...s, text: e.target.value }))}
                                rows={2}
                                autoFocus
                                className={`w-full text-sm bg-white rounded-xl px-3 py-2 border border-gray-200 resize-none focus:outline-none focus:ring-2 ${st?.ring}`}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() } }}
                              />
                              <div className="flex gap-1.5 mt-1.5">
                                <button onClick={commitEdit} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${st?.saveBtn}`}>저장</button>
                                <button onClick={() => setEditState(null)} className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold">취소</button>
                              </div>
                            </div>
                          ) : secData ? (
                            <div className="flex items-start gap-2">
                              <p className="flex-1 text-sm text-gray-700 leading-relaxed">{secData.text}</p>
                              <button
                                onClick={() => startEdit(ev.name, ev.ts, sec.key, secData.text)}
                                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-xs transition-colors"
                              >
                                ✏️
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(ev.name, ev.ts, sec.key, '')}
                              className="text-xs px-2.5 py-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              + 추가
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
