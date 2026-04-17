import { useWorkoutStore } from '../store/useWorkoutStore'

const TABS = [
  { id: 'dashboard',        label: 'Feed',    icon: '🏠' },
  { id: 'leaderboard',      label: 'Ranks',   icon: '🏆' },
  { id: 'log',              label: '',        icon: '➕', center: true },
  { id: 'people',           label: 'People',  icon: '📋' },
  { id: 'profile',          label: 'Me',      icon: '👤' },
]

export default function Navigation() {
  const { view, setView } = useWorkoutStore()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-900/95 backdrop-blur border-t border-slate-700/50 z-40">
      <div className="flex items-end justify-around px-2 pt-2 pb-safe pb-3">
        {TABS.map(tab => {
          if (tab.center) {
            return (
              <button
                key={tab.id}
                onClick={() => setView('log')}
                className="tap-highlight-none -mt-5 flex-shrink-0"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all ${
                  view === 'log'
                    ? 'bg-orange-400 scale-110 shadow-orange-500/40'
                    : 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/30'
                }`}>
                  {tab.icon}
                </div>
              </button>
            )
          }
          const active = view === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all tap-highlight-none ${
                active ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-[10px] font-semibold ${active ? 'text-orange-400' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
