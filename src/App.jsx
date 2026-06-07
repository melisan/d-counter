import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import ParticipantCard from './components/ParticipantCard'
import CalendarPage from './components/CalendarPage'
import BudgetModal from './components/BudgetModal'

export const PARTICIPANTS = [
  { id: 'miseon',  name: '미선', icon: '🥰' },
  { id: 'jinwook', name: '진욱', icon: '🐻' },
]

const STORAGE_KEY = 'cigarette_counter_v1'
const PAGE_KEY    = 'cigarette_counter_page'
const DEFAULT_BUDGET = 150
const POLL_MS = 5000

function getMonthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function getDayKey(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}
function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
function saveLocal(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

async function fetchRemote() {
  const r = await fetch('/api/data')
  if (!r.ok) throw new Error('fetch failed')
  return r.json()
}
async function pushRemote(data) {
  await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export default function App() {
  const [page, setPage] = useState(() => localStorage.getItem(PAGE_KEY) || 'miseon')
  const [data, setData] = useState(loadLocal)
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  const handlePageChange = (p) => {
    setPage(p)
    localStorage.setItem(PAGE_KEY, p)
  }

  const sync = useCallback((remote) => {
    if (remote && Object.keys(remote).length > 0) {
      setData(remote)
      saveLocal(remote)
    }
  }, [])

  useEffect(() => { fetchRemote().then(sync).catch(() => {}) }, [sync])
  useEffect(() => {
    const id = setInterval(() => fetchRemote().then(sync).catch(() => {}), POLL_MS)
    return () => clearInterval(id)
  }, [sync])

  const now      = new Date()
  const today    = getDayKey(now)
  const monthKey = getMonthKey(now)

  const budgets    = data.budgets    || Object.fromEntries(PARTICIPANTS.map(p => [p.name, DEFAULT_BUDGET]))
  const monthDays  = data.months?.[monthKey] || {}
  const lastSmoked = data.lastSmoked || {}

  function getTodayCount(name) { return monthDays[name]?.[today] ?? 0 }
  function getMonthTotal(name) { return Object.values(monthDays[name] || {}).reduce((s, n) => s + n, 0) }

  function updateCount(name, delta) {
    setData(prev => {
      const next = structuredClone(prev)
      next.months ??= {}
      next.months[monthKey] ??= {}
      next.months[monthKey][name] ??= {}
      const cur = next.months[monthKey][name][today] ?? 0
      next.months[monthKey][name][today] = Math.max(0, cur + delta)
      if (delta > 0) { next.lastSmoked ??= {}; next.lastSmoked[name] = new Date().toISOString() }
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  function saveBudgets(newBudgets) {
    setData(prev => {
      const next = { ...prev, budgets: newBudgets }
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  const activePerson = PARTICIPANTS.find(p => p.id === page)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header today={now} onSettings={() => setShowBudgetModal(true)} />

      <main className="max-w-lg mx-auto px-4 py-5">
        {page === 'calendar' ? (
          <CalendarPage data={data} />
        ) : activePerson ? (
          <ParticipantCard
            key={activePerson.id}
            name={activePerson.name}
            icon={activePerson.icon}
            todayCount={getTodayCount(activePerson.name)}
            monthTotal={getMonthTotal(activePerson.name)}
            budget={budgets[activePerson.name] ?? DEFAULT_BUDGET}
            lastSmoked={lastSmoked[activePerson.name] || null}
            onIncrement={() => updateCount(activePerson.name, 1)}
            onDecrement={() => updateCount(activePerson.name, -1)}
          />
        ) : null}
      </main>

      <BottomNav active={page} onChange={handlePageChange} />

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
