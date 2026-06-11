import { useState, useEffect } from 'react'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'

const ICON_COMPONENTS = {
  '미선': MiseonIcon,
  '진욱': JinwookIcon,
}

const THEMES = {
  '미선': {
    header:       'from-yellow-400 to-amber-500',
    elapsed:      'bg-amber-50 text-amber-700',
    elapsedLabel: 'text-amber-500',
    btn:          'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    shadow:       'shadow-amber-100',
    memo:         'bg-amber-50 border border-amber-100',
    memoTime:     'text-amber-400',
    memoText:     'text-amber-900',
    ring:         'focus:ring-amber-300',
    saveBtn:      'bg-amber-500 hover:bg-amber-600 text-white',
  },
  '진욱': {
    header:       'from-emerald-400 to-teal-500',
    elapsed:      'bg-teal-50 text-teal-700',
    elapsedLabel: 'text-teal-500',
    btn:          'bg-teal-500 hover:bg-teal-600 shadow-teal-200',
    shadow:       'shadow-teal-100',
    memo:         'bg-teal-50 border border-teal-100',
    memoTime:     'text-teal-400',
    memoText:     'text-teal-900',
    ring:         'focus:ring-teal-300',
    saveBtn:      'bg-teal-500 hover:bg-teal-600 text-white',
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

export default function GraceCard({
  name, todayEvents, lastGrace,
  onAdd, onRemove,
  adminMode, onEditMemo, onDeleteEntry,
}) {
  const [elapsed, setElapsed]     = useState(
    lastGrace ? Date.now() - new Date(lastGrace).getTime() : null
  )
  const [showInput, setShowInput] = useState(false)
  const [memo, setMemo]           = useState('')
  const [editingTs, setEditingTs] = useState(null)
  const [editMemo, setEditMemo]   = useState('')

  useEffect(() => {
    if (!lastGrace) { setElapsed(null); return }
    setElapsed(Date.now() - new Date(lastGrace).getTime())
    const id = setInterval(() => setElapsed(Date.now() - new Date(lastGrace).getTime()), 1000)
    return () => clearInterval(id)
  }, [lastGrace])

  useEffect(() => { if (!adminMode) setEditingTs(null) }, [adminMode])

  const t             = THEMES[name] || THEMES['진욱']
  const IconComponent = ICON_COMPONENTS[name]

  function handleSave() {
    onAdd(memo.trim())
    setMemo('')
    setShowInput(false)
  }

  function startEdit(ev) { setEditingTs(ev.ts); setEditMemo(ev.memo) }
  function commitEdit()  { onEditMemo(editingTs, editMemo.trim()); setEditingTs(null) }
  function cancelEdit()  { setEditingTs(null) }

  return (
    <div className={`bg-white rounded-2xl shadow-lg ${t.shadow} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${t.header} px-5 py-4`}>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {IconComponent && <IconComponent active={true} size={44} />}
            <span className="absolute -top-1 -right-1 text-base leading-none">🙏</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white leading-none">{name}의 감사</p>
            <p className="text-xs text-white/70 mt-0.5">오늘 {todayEvents.length}번 감사했어요</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Elapsed since last grace */}
        <div className={`rounded-xl px-4 py-3 ${t.elapsed}`}>
          <p className={`text-[11px] font-medium mb-0.5 ${t.elapsedLabel}`}>마지막 감사 이후 경과</p>
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
            <p className="text-[11px] text-gray-400 mt-1">감사 횟수</p>
          </div>
          <button
            onClick={() => setShowInput(true)}
            className={`w-14 h-14 rounded-2xl text-white text-3xl font-light transition-all active:scale-95 select-none shadow-lg ${t.btn}`}
          >
            +
          </button>
        </div>

        {/* New memo input */}
        {showInput && (
          <div className={`rounded-2xl p-4 ${t.memo}`}>
            <p className={`text-[11px] font-semibold mb-2 ${t.elapsedLabel}`}>메모 (선택)</p>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="무엇에 감사한가요?"
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

        {/* Today's log */}
        {todayEvents.length > 0 && (
          <div className="space-y-2">
            <p className={`text-[11px] font-semibold ${t.elapsedLabel}`}>
              오늘의 감사
              {adminMode && <span className="ml-1.5 text-amber-400">✏️ 관리 모드</span>}
            </p>
            {[...todayEvents].reverse().map((ev) => (
              <div key={ev.ts}>
                {editingTs === ev.ts ? (
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
                  <div className={`rounded-xl px-3 py-2 flex items-start gap-2 ${t.memo}`}>
                    <span className={`text-[10px] tabular-nums shrink-0 mt-0.5 ${t.memoTime}`}>
                      {new Date(ev.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-sm flex-1 min-w-0 ${t.memoText}`}>
                      {ev.memo || <span className="opacity-40 italic">메모 없음</span>}
                    </span>
                    {adminMode && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => startEdit(ev)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/70 hover:bg-white text-sm transition-colors">✏️</button>
                        <button onClick={() => onDeleteEntry(ev.ts)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/70 hover:bg-red-50 text-sm transition-colors">🗑️</button>
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
