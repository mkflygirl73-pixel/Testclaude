import { useWorkoutStore } from '../store/useWorkoutStore'
import WorkoutCard from '../components/WorkoutCard'
import UserAvatar from '../components/UserAvatar'

const MOTIVATIONAL = [
  'Keep pushing! 💪', "You're on fire! 🔥", 'Consistency is key 🗝️',
  'Champions train today 🏆', 'Outwork everyone ⚡', 'No days off 🚫',
]

export default function Dashboard() {
  const { users, workouts, currentUserId, setView, getWeeklyChallenge, getChallengeProgress, getUserStats } = useWorkoutStore()
  const currentUser = users.find(u => u.id === currentUserId)
  const stats = getUserStats(currentUserId)
  const challenge = getWeeklyChallenge()
  const challengeProgress = getChallengeProgress(currentUserId)
  const quote = MOTIVATIONAL[new Date().getDay() % MOTIVATIONAL.length]

  const handleUserClick = (userId) => setView('profile', userId)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">🏔️ CREST</h1>
            <p className="text-sm text-slate-400 mt-0.5">{quote}</p>
          </div>
          <button onClick={() => setView('profile', currentUserId)} className="tap-highlight-none">
            <UserAvatar emoji={currentUser?.emoji} size="md" ring />
          </button>
        </div>

        {/* Current user hero stats */}
        <div className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar emoji={currentUser?.emoji} size="md" />
            <div>
              <div className="font-bold text-white">{currentUser?.name}</div>
              <div className="text-xs text-slate-400">
                {stats.currentStreak > 0 && (
                  <span className="text-orange-400 font-semibold">
                    {stats.currentStreak} day streak {stats.currentStreak >= 7 ? '🔥' : '⚡'}
                  </span>
                )}
                {stats.currentStreak === 0 && 'Start your streak today!'}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-black text-orange-400">{stats.totalPoints.toLocaleString()}</div>
              <div className="text-xs text-slate-500">total pts</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/60 rounded-xl p-2">
              <div className="text-lg font-black text-white">{stats.weeklyPoints}</div>
              <div className="text-[10px] text-slate-500">wk pts</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-2">
              <div className="text-lg font-black text-white">{stats.totalWorkouts}</div>
              <div className="text-[10px] text-slate-500">workouts</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-2">
              <div className="text-lg font-black text-white">{Math.round(stats.totalMinutes / 60)}h</div>
              <div className="text-[10px] text-slate-500">total time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Challenge */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-purple-900/60 to-blue-900/60 rounded-2xl p-4 border border-purple-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{challenge.emoji}</span>
              <div>
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Weekly Challenge</div>
                <div className="font-bold text-white">{challenge.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-white">{challengeProgress}<span className="text-slate-500 text-sm">/{challenge.goal}</span></div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-2">{challenge.desc}</p>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((challengeProgress / challenge.goal) * 100, 100)}%` }}
            />
          </div>
          {challengeProgress >= challenge.goal && (
            <div className="text-center text-xs font-bold text-purple-300 mt-2">Challenge Complete! 🎉</div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Activity Feed</h2>
          <span className="text-xs text-slate-500">{workouts.length} workouts</span>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <div className="text-5xl mb-3">🏋️</div>
            <div className="font-semibold">No workouts yet</div>
            <div className="text-sm mt-1">Tap + to log your first!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.slice(0, 30).map(w => (
              <WorkoutCard key={w.id} workout={w} onUserClick={handleUserClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
