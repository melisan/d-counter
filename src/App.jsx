import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import ParticipantCard from './components/ParticipantCard'
import CalendarPage from './components/CalendarPage'
import RageCard from './components/RageCard'
import RageCalendarPage from './components/RageCalendarPage'
import GraceCard from './components/GraceCard'
import GraceCalendarPage from './components/GraceCalendarPage'
import SnackCard from './components/SnackCard'
import SnackCalendarPage from './components/SnackCalendarPage'
import BudgetModal from './components/BudgetModal'
import { PARTICIPANTS, DEFAULT_BUDGET, SNACK_DEFAULT_BUDGET, STORAGE_KEY, PAGE_KEY, MODE_KEY, POLL_MS } from './constants'

function getMonthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function getDayKey(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}
function tsToMonthDay(ts) {
  const d = new Date(ts)
  return { mKey: getMonthKey(d), dKey: getDayKey(d) }
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
  const [page, setPage]           = useState(() => localStorage.getItem(PAGE_KEY) || 'miseon')
  const [mode, setMode]           = useState(() => localStorage.getItem(MODE_KEY) || 'smoke')
  const [data, setData]           = useState(loadLocal)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [config, setConfig]       = useState(null)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setConfig).catch(() => {})
  }, [])

  const activeParticipants = config?.participant
    ? PARTICIPANTS.filter(p => p.id === config.participant)
    : PARTICIPANTS

  useEffect(() => {
    if (!config?.participant) return
    const valid = [config.participant, 'calendar']
    if (!valid.includes(page)) {
      setPage(config.participant)
      localStorage.setItem(PAGE_KEY, config.participant)
    }
  }, [config])

  const handlePageChange = (p) => {
    setPage(p)
    localStorage.setItem(PAGE_KEY, p)
  }

  const handleModeChange = (m) => {
    setMode(m)
    localStorage.setItem(MODE_KEY, m)
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

  // ── Cigarette ───────────────────────────────────────────────────────────────
  const budgets    = data.budgets    || Object.fromEntries(activeParticipants.map(p => [p.name, DEFAULT_BUDGET]))
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

  // ── Rage ────────────────────────────────────────────────────────────────────
  const lastRage = data.lastRage || {}

  function getRageTodayEvents(name) {
    return data.rageMonths?.[monthKey]?.[name]?.[today] ?? []
  }

  function addRage(name, sections) {
    const ts    = new Date().toISOString()
    const entry = { ts }
    Object.keys(sections).forEach(key => {
      entry[key] = sections[key]?.trim() ? { text: sections[key].trim(), ts } : null
    })
    setData(prev => {
      const next = structuredClone(prev)
      next.rageMonths ??= {}
      next.rageMonths[monthKey] ??= {}
      next.rageMonths[monthKey][name] ??= {}
      next.rageMonths[monthKey][name][today] ??= []
      next.rageMonths[monthKey][name][today].push(entry)
      next.lastRage ??= {}
      next.lastRage[name] = ts
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  function editRageSection(name, entryTs, sectionKey, newText) {
    const { mKey, dKey } = tsToMonthDay(entryTs)
    setData(prev => {
      const next   = structuredClone(prev)
      const events = next.rageMonths?.[mKey]?.[name]?.[dKey]
      if (events) {
        const idx = events.findIndex(e => e.ts === entryTs)
        if (idx !== -1) {
          events[idx][sectionKey] = newText
            ? { text: newText, ts: new Date().toISOString() }
            : null
        }
      }
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  function deleteRageEntry(name, ts) {
    const { mKey, dKey } = tsToMonthDay(ts)
    setData(prev => {
      const next   = structuredClone(prev)
      const events = next.rageMonths?.[mKey]?.[name]?.[dKey]
      if (events) {
        next.rageMonths[mKey][name][dKey] = events.filter(e => e.ts !== ts)
      }
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  // ── Snack ───────────────────────────────────────────────────────────────────
  const snackBudgets   = data.snackBudgets || Object.fromEntries(activeParticipants.map(p => [p.name, SNACK_DEFAULT_BUDGET]))
  const snackMonthDays = data.snackMonths?.[monthKey] || {}

  function getSnackTodayCount(name) { return snackMonthDays[name]?.[today] ?? 0 }
  function getTodayWeight(name)     { return data.weights?.[name]?.[today] ?? null }

  function updateSnackCount(name, delta) {
    setData(prev => {
      const next = structuredClone(prev)
      next.snackMonths ??= {}
      next.snackMonths[monthKey] ??= {}
      next.snackMonths[monthKey][name] ??= {}
      const cur = next.snackMonths[monthKey][name][today] ?? 0
      next.snackMonths[monthKey][name][today] = Math.max(0, cur + delta)
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  function logWeight(name, kg) {
    setData(prev => {
      const next = structuredClone(prev)
      next.weights ??= {}
      next.weights[name] ??= {}
      next.weights[name][today] = kg
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  // ── Grace ───────────────────────────────────────────────────────────────────
  const lastGrace = data.lastGrace || {}

  function getGraceTodayEvents(name) {
    return data.graceMonths?.[monthKey]?.[name]?.[today] ?? []
  }

  function addGrace(name, sections) {
    const ts    = new Date().toISOString()
    const entry = { ts }
    Object.keys(sections).forEach(key => {
      entry[key] = sections[key]?.trim() ? { text: sections[key].trim(), ts } : null
    })
    setData(prev => {
      const next = structuredClone(prev)
      next.graceMonths ??= {}
      next.graceMonths[monthKey] ??= {}
      next.graceMonths[monthKey][name] ??= {}
      next.graceMonths[monthKey][name][today] ??= []
      next.graceMonths[monthKey][name][today].push(entry)
      next.lastGrace ??= {}
      next.lastGrace[name] = ts
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  function editGraceSection(name, entryTs, sectionKey, newText) {
    const { mKey, dKey } = tsToMonthDay(entryTs)
    setData(prev => {
      const next   = structuredClone(prev)
      const events = next.graceMonths?.[mKey]?.[name]?.[dKey]
      if (events) {
        const idx = events.findIndex(e => e.ts === entryTs)
        if (idx !== -1) {
          events[idx][sectionKey] = newText
            ? { text: newText, ts: new Date().toISOString() }
            : null
        }
      }
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  function deleteGraceEntry(name, ts) {
    const { mKey, dKey } = tsToMonthDay(ts)
    setData(prev => {
      const next   = structuredClone(prev)
      const events = next.graceMonths?.[mKey]?.[name]?.[dKey]
      if (events) {
        next.graceMonths[mKey][name][dKey] = events.filter(e => e.ts !== ts)
      }
      saveLocal(next)
      pushRemote(next).catch(() => {})
      return next
    })
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const activePerson = activeParticipants.find(p => p.id === page)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-blue-50 pb-20">
      <Header
        today={now}
        onSettings={() => setShowBudgetModal(true)}
        mode={mode}
        onModeChange={handleModeChange}
      />

      <main className="max-w-lg mx-auto px-4 py-5">
        {page === 'calendar' ? (
          mode === 'smoke'
            ? <CalendarPage data={data} participants={activeParticipants} />
            : mode === 'rage'
              ? <RageCalendarPage
                  data={data}
                  participants={activeParticipants}
                  onEditSection={editRageSection}
                  onDeleteEntry={deleteRageEntry}
                />
              : mode === 'snack'
                ? <SnackCalendarPage data={data} participants={activeParticipants} />
                : <GraceCalendarPage
                  data={data}
                  participants={activeParticipants}
                  onEditSection={editGraceSection}
                  onDeleteEntry={deleteGraceEntry}
                />
        ) : activePerson ? (
          mode === 'smoke' ? (
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
          ) : mode === 'rage' ? (
            <RageCard
              key={activePerson.id + '-rage'}
              name={activePerson.name}
              todayEvents={getRageTodayEvents(activePerson.name)}
              lastRage={lastRage[activePerson.name] || null}
              onAdd={(sections) => addRage(activePerson.name, sections)}
              onDeleteEntry={(ts) => deleteRageEntry(activePerson.name, ts)}
              onEditSection={(entryTs, key, text) => editRageSection(activePerson.name, entryTs, key, text)}
            />
          ) : mode === 'snack' ? (
            <SnackCard
              key={activePerson.id + '-snack'}
              name={activePerson.name}
              todayCount={getSnackTodayCount(activePerson.name)}
              budget={snackBudgets[activePerson.name] ?? SNACK_DEFAULT_BUDGET}
              todayWeight={getTodayWeight(activePerson.name)}
              onIncrement={() => updateSnackCount(activePerson.name, 1)}
              onDecrement={() => updateSnackCount(activePerson.name, -1)}
              onLogWeight={(kg) => logWeight(activePerson.name, kg)}
            />
          ) : (
            <GraceCard
              key={activePerson.id + '-grace'}
              name={activePerson.name}
              todayEvents={getGraceTodayEvents(activePerson.name)}
              lastGrace={lastGrace[activePerson.name] || null}
              onAdd={(sections) => addGrace(activePerson.name, sections)}
              onDeleteEntry={(ts) => deleteGraceEntry(activePerson.name, ts)}
              onEditSection={(entryTs, key, text) => editGraceSection(activePerson.name, entryTs, key, text)}
            />
          )
        ) : null}
      </main>

      <BottomNav active={page} onChange={handlePageChange} participants={activeParticipants} />

      {showBudgetModal && (
        <BudgetModal
          budgets={budgets}
          participants={activeParticipants}
          onSave={saveBudgets}
          onClose={() => setShowBudgetModal(false)}
        />
      )}
    </div>
  )
}
