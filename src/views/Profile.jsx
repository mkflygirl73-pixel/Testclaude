import { useState } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { WORKOUT_TYPES } from '../data/workoutTypes'
import { ACHIEVEMENTS } from '../data/achievements'
import UserAvatar from '../components/UserAvatar'
import StatCard from '../components/StatCard'
import AchievementBadge from '../components/AchievementBadge'

function WeekDots({ userId, workouts }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const key = format(d, 'yyyy-MM-dd')
    const hasWorkout = workouts.some(w => w.userId === userId && format(parseISO(w.date), 'yyyy-MM-dd') === key)
    const isToday = i === 6
    return { key, hasWorkout, isToday, label: format(d, 'EEE')[0] }
  })

  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Last 7 Days</div>
      <div className="flex justify-between">
        {days.map(day => (
          <div key={day.key} className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              day.hasWorkout
                ? 'bg-orange-500 shadow-lg shadow-orange-500/40'
                : 'bg-slate-700'
            } ${day.isToday ? 'ring-2 ring-white/30' : ''}`}>
              {day.hasWorkout && <span className="text-xs">✓</span>}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Profile() {
  const { users, workouts, currentUserId, ownerId, profileUserId, setCurrentUser, setView, getUserStats, getUnlockedAchievements, removeUser } = useWorkoutStore()
  const [showSwitcher, setShowSwitcher] = useState(false)

  const userId = profileUserId || currentUserId
  const user = users.find(u => u.id === userId)
  const stats = getUserStats(userId)
  const unlockedIds = getUnlockedAchievements(userId).map(a => a.id)
  const isMe = userId === currentUserId
  const isOwner = currentUserId === ownerId
  const canRemove = isOwner && userId !== ownerId && !isMe
  const userWorkouts = workouts.filter(w => w.userId === userId)

  if (!user) return null

  const topTypes = Object.entries(stats.byType || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <UserAvatar emoji={user.emoji} size="lg" ring={isMe} />
            <div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {isMe && <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">That&apos;s you!</span>}
                {userId === ownerId && <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">👑 Admin</span>}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Joined {format(parseISO(user.joinDate), 'MMM yyyy')}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isMe && (
              <button
                onClick={() => setShowSwitcher(v => !v)}
                className="text-xs bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg text-slate-300 font-semibold tap-highlight-none"
              >
                Switch
              </button>
            )}
            {canRemove && (
              <button
                onClick={() => {
                  if (window.confirm(`Remove ${user.name} from Crest? This will delete all their workouts.`)) {
                    removeUser(userId)
                    setView('dashboard')
                  }
                }}
                className="text-xs bg-red-900/60 border border-red-700 px-3 py-1.5 rounded-lg text-red-400 font-semibold tap-highlight-none hover:bg-red-900"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* User switcher */}
        {showSwitcher && (
          <div className="bg-slate-700 rounded-xl border border-slate-600 p-2 mb-3 animate-slide-up">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => { setCurrentUser(u.id); setShowSwitcher(false) }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all tap-highlight-none ${
                  u.id === currentUserId ? 'bg-orange-500/20 border border-orange-500/40' : 'hover:bg-slate-600'
                }`}
              >
                <span className="text-xl">{u.emoji}</span>
                <span className="font-semibold text-white">{u.name}</span>
                {u.id === currentUserId && <span className="ml-auto text-xs text-orange-400">Active</span>}
              </button>
            ))}
          </div>
        )}

        {/* Streak */}
        {stats.currentStreak > 0 && (
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5">
            <span>🔥</span>
            <span className="font-black text-white">{stats.currentStreak}</span>
            <span className="text-sm text-orange-300">day streak</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-8 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard emoji="⭐" value={stats.totalPoints.toLocaleString()} label="Total Points" />
          <StatCard emoji="💪" value={stats.totalWorkouts} label="Workouts" />
          <StatCard emoji="⏱️" value={`${Math.round(stats.totalMinutes / 60)}h`} label="Total Time" sub={`${stats.totalMinutes} min`} />
          <StatCard emoji="📅" value={stats.weeklyPoints} label="This Week" sub="points" />
        </div>

        {/* 7-day dots */}
        <WeekDots userId={userId} workouts={workouts} />

        {/* Achievements */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Achievements</div>
            <div className="text-xs text-slate-500">{unlockedIds.length}/{ACHIEVEMENTS.length}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ACHIEVEMENTS.map(ach => (
              <AchievementBadge key={ach.id} achievement={ach} unlocked={unlockedIds.includes(ach.id)} />
            ))}
          </div>
        </div>

        {/* Workout type breakdown */}
        {topTypes.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Top Activities</div>
            <div className="space-y-2.5">
              {topTypes.map(([typeId, count]) => {
                const wt = WORKOUT_TYPES.find(t => t.id === typeId)
                if (!wt) return null
                const pct = Math.round((count / stats.totalWorkouts) * 100)
                return (
                  <div key={typeId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{wt.emoji}</span>
                        <span className="text-sm font-semibold text-white">{wt.label}</span>
                      </div>
                      <span className="text-xs text-slate-400">{count}x · {pct}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className={`${wt.pill} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent workouts */}
        {userWorkouts.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Recent Workouts</div>
            <div className="space-y-2">
              {userWorkouts.slice(0, 5).map(w => {
                const wt = WORKOUT_TYPES.find(t => t.id === w.type)
                if (!wt) return null
                return (
                  <div key={w.id} className="flex items-center gap-3 py-1">
                    <span className="text-xl w-8">{wt.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{wt.label}</div>
                      <div className="text-xs text-slate-500">{format(parseISO(w.date), 'MMM d, h:mm a')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-400">+{w.points}</div>
                      <div className="text-xs text-slate-500">{w.duration}m</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Back to feed */}
        <button
          onClick={() => setView('dashboard')}
          className="w-full py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 font-semibold text-sm tap-highlight-none hover:border-slate-500"
        >
          ← Back to Feed
        </button>
      </div>
    </div>
  )
}
