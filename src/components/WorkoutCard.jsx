import { formatDistanceToNow, parseISO } from 'date-fns'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { WORKOUT_TYPES } from '../data/workoutTypes'
import UserAvatar from './UserAvatar'

const REACTIONS = ['🔥', '💪', '🎉', '👏', '⚡']

export default function WorkoutCard({ workout, onUserClick }) {
  const { users, reactions, addReaction, currentUserId } = useWorkoutStore()
  const user = users.find(u => u.id === workout.userId)
  const wt = WORKOUT_TYPES.find(t => t.id === workout.type)
  if (!user || !wt) return null

  const workoutReactions = reactions[workout.id] || {}
  const timeAgo = formatDistanceToNow(parseISO(workout.date), { addSuffix: true })
  const isOwn = workout.userId === currentUserId

  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          className="flex items-center gap-2.5 tap-highlight-none"
          onClick={() => onUserClick?.(user.id)}
        >
          <UserAvatar emoji={user.emoji} size="md" ring={isOwn} />
          <div className="text-left">
            <div className="font-bold text-sm text-white">{user.name}</div>
            <div className="text-xs text-slate-500">{timeAgo}</div>
          </div>
        </button>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${wt.bg} border ${wt.border} ${wt.text}`}>
          <span>{wt.emoji}</span>
          <span>{wt.label}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-3 pl-1">
        <div className="text-sm text-slate-300">
          <span className="font-bold text-white">{workout.duration}</span>
          <span className="text-slate-500 ml-1">min</span>
        </div>
        <div className="text-sm text-slate-300">
          <span className="font-bold text-orange-400">+{workout.points}</span>
          <span className="text-slate-500 ml-1">pts</span>
        </div>
      </div>

      {/* Notes */}
      {workout.notes && (
        <p className="text-sm text-slate-400 italic mb-3 pl-1">&quot;{workout.notes}&quot;</p>
      )}

      {/* Reactions */}
      <div className="flex gap-2 flex-wrap">
        {REACTIONS.map(emoji => {
          const count = (workoutReactions[emoji] || []).length
          const reacted = (workoutReactions[emoji] || []).includes(currentUserId)
          return (
            <button
              key={emoji}
              onClick={() => addReaction(workout.id, emoji)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-all tap-highlight-none ${
                reacted
                  ? 'bg-orange-500/20 border border-orange-500 text-white scale-105'
                  : 'bg-slate-700 border border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-xs font-semibold">{count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
