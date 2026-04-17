import { useWorkoutStore } from './store/useWorkoutStore'
import Navigation from './components/Navigation'
import Toast from './components/Toast'
import Onboarding from './views/Onboarding'
import Dashboard from './views/Dashboard'
import LogWorkout from './views/LogWorkout'
import Leaderboard from './views/Leaderboard'
import Profile from './views/Profile'

const VIEWS = {
  dashboard: Dashboard,
  log: LogWorkout,
  leaderboard: Leaderboard,
  profile: Profile,
}

export default function App() {
  const { users, currentUserId, view } = useWorkoutStore()

  if (!users.length || !currentUserId) {
    return <Onboarding />
  }

  const View = VIEWS[view] || Dashboard

  return (
    <div className="min-h-screen bg-slate-900 text-white max-w-md mx-auto relative">
      <Toast />
      <div className="pb-20">
        <View />
      </div>
      <Navigation />
    </div>
  )
}
