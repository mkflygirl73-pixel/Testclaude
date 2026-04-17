import { useState } from 'react'
import { useWorkoutStore } from '../store/useWorkoutStore'
import UserAvatar from '../components/UserAvatar'

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_STYLES = [
  'bg-gradient-to-r from-amber-900/60 to-yellow-900/60 border-amber-500/50',
  'bg-gradient-to-r from-slate-700/60 to-slate-600/60 border-slate-500/50',
  'bg-gradient-to-r from-orange-900/40 to-amber-900/40 border-orange-700/50',
]

export default function Leaderboard() {
  const { getLeaderboard, currentUserId, setView } = useWorkoutStore()
  const [period, setPeriod] = useState('all')
  const board = getLeaderboard(period)
  const maxPts = board[0]?.points || 1

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 bg-gradient-to-b from-slate-800 to-slate-900">
        <h1 className="text-3xl font-black text-white mb-4">🏆 Leaderboard</h1>

        {/* Period toggle */}
        <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
          {['all', 'week'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all tap-highlight-none ${
                period === p ? 'bg-orange-500 text-white' : 'text-slate-400'
              }`}
            >
              {p === 'all' ? '🏅 All Time' : '📅 This Week'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        {board.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <div className="text-5xl mb-3">🏆</div>
            <div className="font-semibold">No athletes yet</div>
            <div className="text-sm mt-1">Be the first to log a workout!</div>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {board.length >= 2 && (
              <div className="mb-4">
                {board.slice(0, Math.min(3, board.length)).map((user, i) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-4 rounded-2xl border mb-2 transition-all ${
                      i < RANK_STYLES.length ? RANK_STYLES[i] : 'bg-slate-800 border-slate-700'
                    } ${user.id === currentUserId ? 'ring-1 ring-orange-500' : ''}`}
                    onClick={() => setView('profile', user.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="text-2xl w-8 text-center">{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
                    <UserAvatar emoji={user.emoji} size="md" ring={user.id === currentUserId} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white flex items-center gap-2">
                        {user.name}
                        {user.id === currentUserId && <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">You</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-400">{user.workoutCount} workouts</span>
                        {user.streak > 0 && (
                          <span className="text-xs text-orange-400 font-semibold">
                            {user.streak}d {user.streak >= 7 ? '🔥' : '⚡'}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 w-full bg-slate-800/80 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-700 ${
                            i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-orange-600'
                          }`}
                          style={{ width: `${(user.points / maxPts) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-xl font-black text-white">{user.points.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rest of the board */}
            {board.length > 3 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Others</div>
                {board.slice(3).map((user, i) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border bg-slate-800 border-slate-700 ${
                      user.id === currentUserId ? 'border-orange-500/50' : ''
                    }`}
                    onClick={() => setView('profile', user.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="text-sm font-bold text-slate-500 w-6 text-center">#{i + 4}</span>
                    <UserAvatar emoji={user.emoji} size="sm" ring={user.id === currentUserId} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.workoutCount} workouts</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{user.points.toLocaleString()}</div>
                      {user.streak > 0 && <div className="text-xs text-orange-400">{user.streak}d ⚡</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My position callout if not visible */}
            {board.findIndex(u => u.id === currentUserId) > 2 && (
              <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3 flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-sm font-bold text-white">
                    You&apos;re ranked #{board.findIndex(u => u.id === currentUserId) + 1}
                  </div>
                  <div className="text-xs text-slate-400">
                    {board[board.findIndex(u => u.id === currentUserId) - 1]?.points - board.find(u => u.id === currentUserId)?.points} pts behind #{board.findIndex(u => u.id === currentUserId)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
