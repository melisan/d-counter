import { PARTICIPANTS } from '../constants'

const TABS = [
  ...PARTICIPANTS.map(p => ({ id: p.id, label: p.name, icon: p.icon })),
  { id: 'calendar', label: '달력', icon: '📅' },
]

const ACTIVE = {
  miseon:   'text-rose-500',
  jinwook:  'text-blue-500',
  calendar: 'text-violet-500',
}

const INDICATOR = {
  miseon:   'bg-rose-500',
  jinwook:  'bg-blue-500',
  calendar: 'bg-violet-500',
}

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors relative ${
                isActive ? ACTIVE[tab.id] : 'text-gray-400'
              }`}
            >
              {isActive && (
                <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${INDICATOR[tab.id]}`} />
              )}
              <span className={`text-2xl leading-none transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
