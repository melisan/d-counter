import { useState, useEffect } from 'react'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'

const ICON_COMPONENTS = { '미선': MiseonIcon, '진욱': JinwookIcon }

export const RAGE_SECTIONS = [
  { key: '기록',    icon: '📝', placeholder: '무슨 일이 있었나요?' },
  { key: '느낌',    icon: '💭', placeholder: '어떤 감정이 들었나요?' },
  { key: '생각',    icon: '🧠', placeholder: '어떤 생각이 들었나요?' },
  { key: '인지왜곡', icon: '🔍', placeholder: '어떤 인지왜곡이 있었나요?' },
  { key: '개선',    icon: '✨', placeholder: '어떻게 개선할 수 있을까요?' },
]

const THEMES = {
  '미선': {
    header:    'from-rose-500 to-red-600',
    chip:      'bg-rose-50 text-rose-600',
    addBtn:    'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200',
    shadow:    'shadow-rose-100',
    border:    'border-rose-100',
    secLabel:  'text-rose-600',
    secTs:     'text-rose-300',
    addSec:    'text-rose-400 hover:text-rose-600 hover:bg-rose-50',
    ring:      'focus:ring-rose-300',
    saveBtn:   'bg-rose-500 hover:bg-rose-600 text-white',
  },
  '진욱': {
    header:    'from-amber-500 to-orange-600',
    chip:      'bg-orange-50 text-orange-600',
    addBtn:    'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200',
    shadow:    'shadow-orange-100',
    border:    'border-orange-100',
    secLabel:  'text-orange-600',
    secTs:     'text-orange-300',
    addSec:    'text-orange-400 hover:text-orange-600 hover:bg-orange-50',
    ring:      'focus:ring-orange-300',
    saveBtn:   'bg-orange-500 hover:bg-orange-600 text-white',
  },
}

function formatElapsed(ms) {
  if (ms == null) return null
  const s = Math.floor(ms / 1000); const m = Math.floor(s / 60)
  const min = m % 60; const h = Math.floor(m / 60); const hr = h % 24
  const days = Math.floor(h / 24)
  if (days > 0) return `${days}일 ${hr}시간 ${min}분`
  if (hr > 0)   return `${hr}시간 ${min}분 ${s % 60}초`
  return `${min}분 ${s % 60}초`
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

// Returns section data handling both new { key: {text,ts} } and old { memo } formats
function getSection(ev, key) {
  if (ev[key] != null) return ev[key]
  if (key === '기록' && ev.memo) return { text: ev.memo, ts: ev.ts }
  return null
}

const EMPTY = Object.fromEntries(RAGE_SECTIONS.map(s => [s.key, '']))

export default function RageCard({ name, todayEvents, lastRage, onAdd, onDeleteEntry, onEditSection }) {
  const [elapsed, setElapsed]     = useState(lastRage ? Date.now() - new Date(lastRage).getTime() : null)
  const [showNew, setShowNew]     = useState(false)
  const [newSec, setNewSec]       = useState(EMPTY)
  const [editState, setEditState] = useState(null) // { entryTs, key, text }

  useEffect(() => {
    if (!lastRage) { setElapsed(null); return }
    setElapsed(Date.now() - new Date(lastRage).getTime())
    const id = setInterval(() => setElapsed(Date.now() - new Date(lastRage).getTime()), 1000)
    return () => clearInterval(id)
  }, [lastRage])

  const t             = THEMES[name] || THEMES['진욱']
  const IconComponent = ICON_COMPONENTS[name]
  const hasAny        = Object.values(newSec).some(v => v.trim())

  function handleAdd() {
    if (!hasAny) return
    onAdd(newSec)
    setNewSec(EMPTY)
    setShowNew(false)
  }

  function startEdit(entryTs, key, text) { setEditState({ entryTs, key, text: text || '' }) }
  function commitEdit() {
    if (!editState) return
    onEditSection(editState.entryTs, editState.key, editState.text.trim())
    setEditState(null)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg ${t.shadow} overflow-hidden`}>
      {/* Compact gradient header */}
      <div className={`bg-gradient-to-r ${t.header} px-4 py-3 flex items-center gap-2.5`}>
        <div className="relative shrink-0">
          {IconComponent && <IconComponent active={true} size={34} />}
          <span className="absolute -top-1 -right-1 text-xs leading-none">😤</span>
        </div>
        <p className="text-sm font-bold text-white">{name}의 분노</p>
      </div>

      {/* Stats bar + add button */}
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full tabular-nums ${t.chip}`}>
          ⏱ {elapsed != null ? formatElapsed(elapsed) : '—'}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.chip}`}>
          😤 {todayEvents.length}회
        </span>
        <button
          onClick={() => { setShowNew(true); setNewSec(EMPTY) }}
          className={`ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 ${t.addBtn}`}
        >
          <span className="text-sm leading-none">+</span> 새 기록
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* ── New entry form ─────────────────────────────────────────────── */}
        {showNew && (
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-700">새 분노 기록</span>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="divide-y divide-gray-100">
              {RAGE_SECTIONS.map(sec => (
                <div key={sec.key} className="px-4 py-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
                    <span>{sec.icon}</span>{sec.key}
                  </label>
                  <textarea
                    value={newSec[sec.key]}
                    onChange={e => setNewSec(p => ({ ...p, [sec.key]: e.target.value }))}
                    placeholder={sec.placeholder}
                    rows={2}
                    className={`w-full text-sm bg-white rounded-xl px-3 py-2 border border-gray-200 resize-none focus:outline-none focus:ring-2 ${t.ring}`}
                  />
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-gray-50 flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!hasAny}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30 ${t.saveBtn}`}
              >
                기록하기
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-2 rounded-xl bg-white text-gray-500 text-sm font-bold border border-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* ── Entry list ─────────────────────────────────────────────────── */}
        {todayEvents.length > 0 ? (
          <>
            <p className="text-[11px] font-semibold text-gray-400">오늘의 기록</p>
            {[...todayEvents].reverse().map(ev => (
              <div key={ev.ts} className={`rounded-2xl border ${t.border} overflow-hidden`}>
                {/* Entry header row */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500">{fmtTime(ev.ts)}</span>
                  <button
                    onClick={() => onDeleteEntry(ev.ts)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-sm transition-colors"
                  >
                    🗑️
                  </button>
                </div>

                {/* Sections */}
                <div className="divide-y divide-gray-50">
                  {RAGE_SECTIONS.map(sec => {
                    const secData = getSection(ev, sec.key)
                    const isEditing = editState?.entryTs === ev.ts && editState?.key === sec.key

                    return (
                      <div key={sec.key} className="px-4 py-2.5">
                        {/* Section label row */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm leading-none">{sec.icon}</span>
                          <span className={`text-xs font-semibold ${t.secLabel}`}>{sec.key}</span>
                          {secData && (
                            <span className={`text-[10px] tabular-nums ${t.secTs}`}>
                              · {fmtTime(secData.ts)}
                            </span>
                          )}
                        </div>

                        {isEditing ? (
                          <div>
                            <textarea
                              value={editState.text}
                              onChange={e => setEditState(s => ({ ...s, text: e.target.value }))}
                              rows={2}
                              autoFocus
                              className={`w-full text-sm bg-white rounded-xl px-3 py-2 border border-gray-200 resize-none focus:outline-none focus:ring-2 ${t.ring}`}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() } }}
                            />
                            <div className="flex gap-1.5 mt-1.5">
                              <button onClick={commitEdit} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${t.saveBtn}`}>저장</button>
                              <button onClick={() => setEditState(null)} className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold">취소</button>
                            </div>
                          </div>
                        ) : secData ? (
                          <div className="flex items-start gap-2">
                            <p className="flex-1 text-sm text-gray-700 leading-relaxed">{secData.text}</p>
                            <button
                              onClick={() => startEdit(ev.ts, sec.key, secData.text)}
                              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-xs transition-colors mt-0.5"
                            >
                              ✏️
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(ev.ts, sec.key, '')}
                            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${t.addSec}`}
                          >
                            + 추가
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        ) : !showNew && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">😌</p>
            <p className="text-sm text-gray-400">오늘은 아직 분노 기록이 없어요</p>
          </div>
        )}
      </div>
    </div>
  )
}
