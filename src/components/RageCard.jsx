import { useState, useEffect } from 'react'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'

const ICON_COMPONENTS = {
  '미선': MiseonIcon,
  '진욱': JinwookIcon,
}

const THEMES = {
  '미선': {
    header:       'from-rose-500 to-red-600',
    elapsed:      'bg-red-50 text-red-600',
    elapsedLabel: 'text-red-400',
    btn:          'bg-red-500 hover:bg-red-600 shadow-red-200',
    shadow:       'shadow-red-100',
    memo:         'bg-red-50 border border-red-100',
    memoTime:     'text-red-300',
    memoText:     'text-red-800',
    ring:         'focus:ring-red-300',
    saveBtn:      'bg-red-500 hover:bg-red-600 text-white',
  },
  '진욱': {
    header:       'from-amber-500 to-orange-600',
    elapsed:      'bg-orange-50 text-orange-600',
    elapsedLabel: 'text-orange-400',
    btn:          'bg-orange-500 hover:bg-orange-600 shadow-orange-200',
    shadow:       'shadow-orange-100',
    memo:         'bg-orange-50 border border-orange-100',
    memoTime:     'text-orange-300',
    memoText:     'text-orange-800',
    ring:         'focus:ring-orange-300',
    saveBtn:      'bg-orange-500 hover:bg-orange-600 text-white',
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

export default function RageCard({
  name, todayEvents, lastRage,
  onAdd, onRemove,
  adminMode, onEditMemo, onDeleteEntry,
}) {
  const [elapsed, setElapsed]   = useState(
    lastRage ? Date.now() - new Date(lastRage).getTime() : null
  )
  const [showInput, setShowInput] = useState(false)
  const [memo, setMemo]           = useState('')
  const [editingTs, setEditingTs] = useState(null)
  const [editMemo, setEditMemo]   = useState('')

  useEffect(() => {
    if (!lastRage) { setElapsed(null); return }
    setElapsed(Date.now() - new Date(lastRage).getTime())
    const id = setInterval(() => setElapsed(Date.now() - new Date(lastRage).getTime()), 1000)
    return () => clearInterval(id)
  }, [lastRage])

  // Cancel any open edit when admin mode turns off
  useEffect(() => { if (!adminMode) setEditingTs(null) }, [adminMode])

  const t             = THEMES[name] || THEMES['진욱']
  const IconComponent = ICON_COMPONENTS[name]

  function handleSave() {
    onAdd(memo.trim())
    setMemo('')
    setShowInput(false)
  }

  function startEdit(ev) {
    setEditingTs(ev.ts)
    setEditMemo(ev.memo)
  }

  function commitEdit() {
    onEditMemo(editingTs, editMemo.trim())
    setEditingTs(null)
  }

  function cancelEdit() { setEditingTs(null) }

  return (
    <div className={`bg-white rounded-2xl shadow-lg ${t.shadow} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${t.header} px-5 py-4`}>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {IconComponent && <IconComponent active={true} size={44} />}
            <span className="absolute -top-1 -right-1 text-base leading-none">😤</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white leading-none">{name}의 분노</p>
            <p className="text-xs text-white/70 mt-0.5">오늘 {todayEvents.length}번 기록됨</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Elapsed since last rage */}
        <div className={`rounded-xl px-4 py-3 ${t.elapsed}`}>
          <p className={`text-[11px] font-medium mb-0.5 ${t.elapsedLabel}`}>마지막 분노 이후 경과</p>
          <p className="text-2xl font-bold tabular-nums">
            {elapsed != null ? formatElapsed(elapsed) : '—'}
          </p>
        </div>

        {/* Count + +/- buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onRemove}
            disabled={todayEvents.length === 0}
            className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 disabled:opacity-25 text-gray-600 text-3xl font-light transition-all active:scale-95 select-none"
          >
            −
          </button>
          <div className="text-center w-20">
            <p className="text-5xl font-bold tabular-nums leading-none text-gray-800">
              {todayEvents.length}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">분노 횟수</p>
          </div>
          <button
            onClick={() => setShowInput(true)}
            className={`w-14 h-14 rounded-2xl text-white text-3xl font-light transition-all active:scale-95 select-none shadow-lg ${t.btn}`}
          >
            +
          </button>
        </div>

        {/* New memo input sheet */}
        {showInput && (
          <div className={`rounded-2xl p-4 ${t.memo}`}>
            <p className={`text-[11px] font-semibold mb-2 ${t.elapsedLabel}`}>메모 (선택)</p>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="무슨 일이 있었나요?"
              rows={2}
              autoFocus
              className={`w-full text-sm bg-white rounded-xl px-3 py-2 border border-gray-200 resize-none focus:outline-none focus:ring-2 ${t.ring}`}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() } }}
            />
            <div className="flex gap-2 mt-2.5">
              <button onClick={handleSave} className={`flex-1 py-2 rounded-xl text-sm font-bold active:scale-95 shadow-sm ${t.saveBtn}`}>기록</button>
              <button onClick={() => { setMemo(''); setShowInput(false) }} className="flex-1 py-2 rounded-xl bg-white text-gray-500 text-sm font-bold border border-gray-200">취소</button>
            </div>
          </div>
        )}

        {/* Today's event log */}
        {todayEvents.length > 0 && (
          <div className="space-y-2">
            <p className={`text-[11px] font-semibold ${t.elapsedLabel}`}>
              오늘의 기록
              {adminMode && <span className="ml-1.5 text-orange-400">✏️ 관리 모드</span>}
            </p>
            {[...todayEvents].reverse().map((ev) => (
              <div key={ev.ts}>
                {editingTs === ev.ts ? (
                  /* Inline edit */
                  <div className={`rounded-xl p-3 ${t.memo}`}>
                    <textarea
                      value={editMemo}
                      onChange={e => setEditMemo(e.target.value)}
                      rows={2}
                      autoFocus
                      className={`w-full text-sm bg-white rounded-xl px-3 py-2 border border-gray-200 resize-none focus:outline-none focus:ring-2 ${t.ring}`}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() } }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={commitEdit} className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${t.saveBtn}`}>저장</button>
                      <button onClick={cancelEdit} className="flex-1 py-1.5 rounded-xl bg-white text-gray-500 text-xs font-bold border border-gray-200">취소</button>
                    </div>
                  </div>
                ) : (
                  /* Normal row — edit/delete visible in admin mode */
                  <div className={`rounded-xl px-3 py-2 flex items-start gap-2 ${t.memo}`}>
                    <span className={`text-[10px] tabular-nums shrink-0 mt-0.5 ${t.memoTime}`}>
                      {new Date(ev.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-sm flex-1 min-w-0 ${t.memoText}`}>
                      {ev.memo || <span className="opacity-40 italic">메모 없음</span>}
                    </span>
                    {adminMode && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(ev)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/70 hover:bg-white text-sm transition-colors"
                          title="메모 편집"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteEntry(ev.ts)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/70 hover:bg-red-50 text-sm transition-colors"
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
