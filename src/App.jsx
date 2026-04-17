import { useEffect } from 'react'
import { useWorkoutStore } from './store/useWorkoutStore'
import Navigation from './components/Navigation'
import Toast from './components/Toast'
import Onboarding from './views/Onboarding'
import Dashboard from './views/Dashboard'
import LogWorkout from './views/LogWorkout'
import Leaderboard from './views/Leaderboard'
import Profile from './views/Profile'

const VIEWS = { dashboard: Dashboard, log: LogWorkout, leaderboard: Leaderboard, profile: Profile }

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center max-w-md mx-auto">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🏔️</div>
        <div className="text-white font-black text-2xl">CREST</div>
        <div className="text-slate-500 text-sm mt-2">Connecting...</div>
      </div>
    </div>
  )
}

export default function App() {
  const { init, loading, users, currentUserId, view } = useWorkoutStore()

  useEffect(() => { init() }, [])

  if (loading) return <LoadingScreen />

  const currentUser = users.find(u => u.id === currentUserId)
  if (!currentUser) return <Onboarding />

  const View = VIEWS[view] || Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-white max-w-md mx-auto relative">
      <Toast />
      <div className="pb-20"><View /></div>
      <Navigation />
    </div>
  )
}
