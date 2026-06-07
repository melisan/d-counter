import { useState } from 'react'

export default function BudgetModal({ budgets, participants, onSave, onClose }) {
  const [values, setValues] = useState({ ...budgets })

  function handleChange(person, raw) {
    const n = parseInt(raw)
    setValues(v => ({ ...v, [person]: isNaN(n) || n < 1 ? 1 : n }))
  }

  function handleSave() {
    onSave(values)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-sm px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">월간 한도 설정</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {participants.map(person => (
            <div key={person}>
              <label className="text-sm font-medium text-gray-600 block mb-2">{person}</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChange(person, (values[person] ?? 150) - 10)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={values[person] ?? 150}
                  onChange={e => handleChange(person, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={() => handleChange(person, (values[person] ?? 150) + 10)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-gray-400 w-12">개비/월</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
