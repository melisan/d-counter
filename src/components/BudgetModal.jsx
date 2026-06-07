import { useState } from 'react'

const DEFAULT_DAILY = 10

export default function BudgetModal({ budgets, participants, onSave, onClose }) {
  // Store as strings so the input can be freely edited (empty, partial, etc.)
  const [values, setValues] = useState(
    Object.fromEntries(participants.map(p => [p.name, String(budgets[p.name] ?? DEFAULT_DAILY)]))
  )

  function handleChange(name, raw) {
    // Allow any string while typing; validate only on save
    if (raw === '' || /^\d+$/.test(raw)) {
      setValues(v => ({ ...v, [name]: raw }))
    }
  }

  function handleSave() {
    const parsed = Object.fromEntries(
      participants.map(({ name }) => [name, Math.max(1, parseInt(values[name]) || 1)])
    )
    onSave(parsed)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">일일 목표 설정</h2>
              <p className="text-xs text-violet-200 mt-0.5">하루에 피울 개비 수</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {participants.map(({ name, icon }) => (
            <div key={name}>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>{name}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={values[name]}
                  onChange={e => handleChange(name, e.target.value)}
                  onFocus={e => e.target.select()}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 focus:border-violet-400 rounded-xl px-4 py-3 text-center text-2xl font-bold text-gray-800 focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">개비/일</span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-md shadow-violet-200"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
