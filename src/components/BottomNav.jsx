import { PARTICIPANTS } from '../App'

const TABS = [
  ...PARTICIPANTS.map(p => ({ id: p.id, label: p.name, icon: p.icon })),
  { id: 'calendar', label: '달력', icon: '📅' },
]

const ACTIVE_COLORS = {
  miseon:   'text-rose-500',
  jinwook:  'text-blue-500',
  calendar: 'text-emerald-500',
}

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
                isActive ? ACTIVE_COLORS[tab.id] : 'text-gray-400'
              }`}
            >
              <span className={`transition-transform ${isActive ? 'scale-125' : 'scale-100'} text-xl leading-none`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-semibold ${isActive ? '' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
