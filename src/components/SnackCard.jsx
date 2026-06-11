import { useState } from 'react'
import MiseonIcon from './icons/MiseonIcon'
import JinwookIcon from './icons/JinwookIcon'

const ICON_COMPONENTS = { '미선': MiseonIcon, '진욱': JinwookIcon }

const THEMES = {
  '미선': {
    header:      'from-emerald-400 to-green-500',
    btn:         'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200',
    bar:         'bg-emerald-400',
    text:        'text-emerald-600',
    shadow:      'shadow-emerald-100',
    ring:        'focus:ring-emerald-300',
    saveBtn:     'bg-emerald-500 hover:bg-emerald-600',
    weightBg:    'bg-emerald-50',
    weightLabel: 'text-emerald-400',
    weightValue: 'text-emerald-700',
  },
  '진욱': {
    header:      'from-teal-400 to-cyan-500',
    btn:         'bg-teal-500 hover:bg-teal-600 shadow-teal-200',
    bar:         'bg-teal-400',
    text:        'text-teal-600',
    shadow:      'shadow-teal-100',
    ring:        'focus:ring-teal-300',
    saveBtn:     'bg-teal-500 hover:bg-teal-600',
    weightBg:    'bg-teal-50',
    weightLabel: 'text-teal-400',
    weightValue: 'text-teal-700',
  },
}

export default function SnackCard({
  name, todayCount, budget, todayWeight,
  onIncrement, onDecrement, onLogWeight,
}) {
  const [weightInput, setWeightInput]     = useState('')
  const [editingWeight, setEditingWeight] = useState(false)

  const t             = THEMES[name] || THEMES['진욱']
  const IconComponent = ICON_COMPONENTS[name]
  const remaining     = budget - todayCount
  const pct           = budget > 0 ? Math.max(0, Math.round((remaining / budget) * 100)) : 0
  const over          = todayCount > budget

  function handleWeightSave() {
    const w = parseFloat(weightInput.replace(',', '.'))
    if (!isNaN(w) && w > 0 && w < 300) {
      onLogWeight(w)
      setWeightInput('')
      setEditingWeight(false)
    }
  }

  function startWeightEdit() {
    setWeightInput(todayWeight != null ? String(todayWeight) : '')
    setEditingWeight(true)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg ${t.shadow} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${t.header} px-5 py-4`}>
        <div className="flex items-center gap-3">
          {IconComponent && <IconComponent active={true} size={44} />}
          <div>
            <p className="text-lg font-bold text-white leading-none">{name}</p>
            <p className="text-xs text-white/70 mt-0.5">일일 간식 목표 {budget}개</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Count +/- */}
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
            <p className="text-[11px] text-gray-400 mt-1">오늘 간식</p>
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
              {over ? `${Math.abs(remaining)}개 초과` : `${remaining} / ${budget}개`}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : t.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className={`text-[11px] mt-1.5 ${over ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            {over ? '⚠️ 한도 초과' : remaining === 0 ? '🚫 한도 소진' : `${pct}% 남음`}
          </p>
        </div>

        {/* Daily weight log */}
        <div className={`rounded-xl px-4 py-3 ${t.weightBg}`}>
          <p className={`text-[11px] font-medium mb-2 ${t.weightLabel}`}>오늘 체중</p>

          {editingWeight || todayWeight == null ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="00.0"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleWeightSave() }}
                className={`flex-1 text-sm bg-white rounded-xl px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 ${t.ring} tabular-nums`}
              />
              <span className="text-sm text-gray-400">kg</span>
              <button
                onClick={handleWeightSave}
                className={`px-3 py-2 rounded-xl text-white text-xs font-bold ${t.saveBtn} transition-colors`}
              >
                저장
              </button>
              {todayWeight != null && (
                <button onClick={() => setEditingWeight(false)} className="text-gray-400 text-xs">취소</button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold tabular-nums ${t.weightValue}`}>{todayWeight}</span>
              <span className={`text-sm ${t.weightLabel}`}>kg</span>
              <button
                onClick={startWeightEdit}
                className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/70 text-sm transition-colors"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
