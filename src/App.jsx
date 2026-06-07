import { useState } from 'react'
import Header from './components/Header'
import ParticipantCard from './components/ParticipantCard'
import BudgetModal from './components/BudgetModal'

const PARTICIPANTS = ['미선', '진욱']
const STORAGE_KEY = 'cigarette_counter_v1'
const DEFAULT_BUDGET = 150

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getDayKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  const now = new Date()
  const today = getDayKey(now)
  const monthKey = getMonthKey(now)

  const budgets = data.budgets || Object.fromEntries(PARTICIPANTS.map(p => [p, DEFAULT_BUDGET]))
  const monthDays = data.months?.[monthKey] || {}
  const lastSmoked = data.lastSmoked || {}

  function getTodayCount(person) {
    return monthDays[person]?.[today] ?? 0
  }

  function getMonthTotal(person) {
    return Object.values(monthDays[person] || {}).reduce((s, n) => s + n, 0)
  }

  function updateCount(person, delta) {
    setData(prev => {
      const next = structuredClone(prev)
      next.months ??= {}
      next.months[monthKey] ??= {}
      next.months[monthKey][person] ??= {}
      const cur = next.months[monthKey][person][today] ?? 0
      const newCount = Math.max(0, cur + delta)
      next.months[monthKey][person][today] = newCount
      if (delta > 0) {
        next.lastSmoked ??= {}
        next.lastSmoked[person] = new Date().toISOString()
      }
      saveData(next)
      return next
    })
  }

  function saveBudgets(newBudgets) {
    setData(prev => {
      const next = { ...prev, budgets: newBudgets }
      saveData(next)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header today={now} onSettings={() => setShowBudgetModal(true)} />

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {PARTICIPANTS.map(person => (
          <ParticipantCard
            key={person}
            name={person}
            todayCount={getTodayCount(person)}
            monthTotal={getMonthTotal(person)}
            budget={budgets[person] ?? DEFAULT_BUDGET}
            lastSmoked={lastSmoked[person] || null}
            onIncrement={() => updateCount(person, 1)}
            onDecrement={() => updateCount(person, -1)}
          />
        ))}
      </main>

      {showBudgetModal && (
        <BudgetModal
          budgets={budgets}
          participants={PARTICIPANTS}
          onSave={saveBudgets}
          onClose={() => setShowBudgetModal(false)}
        />
      )}
    </div>
  )
}
