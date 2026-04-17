import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, startOfWeek, parseISO, subDays, differenceInDays } from 'date-fns'
import { WORKOUT_TYPES } from '../data/workoutTypes'
import { ACHIEVEMENTS } from '../data/achievements'
import confetti from 'canvas-confetti'

const REACTION_EMOJIS = ['🔥', '💪', '🎉', '👏', '⚡']

const getUniqueDates = (workouts, userId) =>
  [...new Set(
    workouts.filter(w => w.userId === userId).map(w => format(parseISO(w.date), 'yyyy-MM-dd'))
  )].sort().reverse()

const calcStreak = (workouts, userId) => {
  const dates = getUniqueDates(workouts, userId)
  if (!dates.length) return 0
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  if (dates[0] !== today && dates[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    if (differenceInDays(parseISO(dates[i - 1]), parseISO(dates[i])) === 1) streak++
    else break
  }
  return streak
}

const calcStats = (workouts, reactions, userId) => {
  const uw = workouts.filter(w => w.userId === userId)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const byType = {}
  uw.forEach(w => { byType[w.type] = (byType[w.type] || 0) + 1 })
  const totalReactions = Object.values(reactions || {}).filter(wr =>
    Object.values(wr).some(users => users.includes(userId))
  ).length
  return {
    totalPoints: uw.reduce((s, w) => s + w.points, 0),
    weeklyPoints: uw.filter(w => parseISO(w.date) >= weekStart).reduce((s, w) => s + w.points, 0),
    totalWorkouts: uw.length,
    totalMinutes: uw.reduce((s, w) => s + w.duration, 0),
    currentStreak: calcStreak(workouts, userId),
    byType,
    hasEarlyBird: uw.some(w => new Date(w.date).getHours() < 7),
    hasNightOwl: uw.some(w => new Date(w.date).getHours() >= 22),
    totalReactions,
    longestWorkout: uw.reduce((max, w) => Math.max(max, w.duration), 0),
  }
}

const WEEKLY_CHALLENGES = [
  { title: 'Distance Week', desc: 'Log 5 run or cycle sessions', emoji: '🏃', goal: 5, type: 'type', types: ['run', 'bike'] },
  { title: 'Iron Week', desc: 'Hit the weights 4 times', emoji: '🏋️', goal: 4, type: 'type', types: ['lift'] },
  { title: 'Zen Week', desc: 'Complete 3 yoga sessions', emoji: '🧘', goal: 3, type: 'type', types: ['yoga'] },
  { title: 'Swim Week', desc: 'Dive in for 3 swim sessions', emoji: '🏊', goal: 3, type: 'type', types: ['swim'] },
  { title: 'Marathon Week', desc: 'Log 10+ workouts total', emoji: '💥', goal: 10, type: 'total' },
  { title: 'Variety Pack', desc: 'Try 4 different workout types', emoji: '🎯', goal: 4, type: 'variety' },
]

const DEMO_NAMES = [
  { name: 'Alex', emoji: '🦁' },
  { name: 'Sam', emoji: '🐯' },
  { name: 'Jordan', emoji: '🦅' },
]

const DEMO_NOTES = ['Felt great!', 'Tough session', 'Personal best! 🎉', 'Solid workout', '', 'Crushed it 💪', 'Morning grind', 'So tired but worth it']

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      users: [],
      workouts: [],
      reactions: {},
      currentUserId: null,
      ownerId: null,
      view: 'dashboard',
      profileUserId: null,
      toasts: [],
      unlockedAchievements: {},

      addUser: (name, emoji) => {
        const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        set(state => ({
          users: [...state.users, { id, name, emoji, joinDate: new Date().toISOString() }],
          currentUserId: state.currentUserId || id,
          ownerId: state.ownerId || id,
        }))
        return id
      },

      setCurrentUser: (userId) => set({ currentUserId: userId, view: 'dashboard' }),

      removeUser: (userId) => {
        const { currentUserId, ownerId } = get()
        if (currentUserId !== ownerId) return
        if (userId === ownerId) return
        set(state => {
          const reactions = { ...state.reactions }
          state.workouts.filter(w => w.userId === userId).forEach(w => delete reactions[w.id])
          return {
            users: state.users.filter(u => u.id !== userId),
            workouts: state.workouts.filter(w => w.userId !== userId),
            reactions,
            unlockedAchievements: Object.fromEntries(
              Object.entries(state.unlockedAchievements).filter(([k]) => k !== userId)
            ),
            currentUserId: state.currentUserId === userId ? ownerId : state.currentUserId,
            profileUserId: state.profileUserId === userId ? null : state.profileUserId,
            view: state.profileUserId === userId ? 'dashboard' : state.view,
          }
        })
      },

      setView: (view, profileUserId = null) => set({ view, profileUserId }),

      logWorkout: (type, duration, notes = '') => {
        const { currentUserId, workouts, reactions, unlockedAchievements } = get()
        if (!currentUserId) return null

        const wt = WORKOUT_TYPES.find(t => t.id === type)
        const points = Math.round(wt.points * duration)
        const id = `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const workout = { id, userId: currentUserId, type, duration, notes, date: new Date().toISOString(), points }

        const newWorkouts = [workout, ...workouts]
        const stats = calcStats(newWorkouts, reactions, currentUserId)
        const nowUnlocked = ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id)
        const prevUnlocked = unlockedAchievements[currentUserId] || []
        const justUnlocked = nowUnlocked.filter(id => !prevUnlocked.includes(id))

        const newToasts = [
          { id: `t_pts_${Date.now()}`, kind: 'points', message: `+${points} points!`, emoji: wt.emoji },
          ...justUnlocked.map(achId => {
            const ach = ACHIEVEMENTS.find(a => a.id === achId)
            return { id: `t_ach_${achId}_${Date.now()}`, kind: 'achievement', message: ach.label, emoji: ach.emoji }
          }),
        ]

        set(state => ({
          workouts: newWorkouts,
          unlockedAchievements: { ...state.unlockedAchievements, [currentUserId]: nowUnlocked },
          toasts: [...state.toasts, ...newToasts],
        }))

        confetti({
          particleCount: 130,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
        })

        return { points, id }
      },

      addReaction: (workoutId, emoji) => {
        const { currentUserId } = get()
        if (!currentUserId) return
        set(state => {
          const r = JSON.parse(JSON.stringify(state.reactions))
          if (!r[workoutId]) r[workoutId] = {}
          if (!r[workoutId][emoji]) r[workoutId][emoji] = []
          const users = r[workoutId][emoji]
          r[workoutId][emoji] = users.includes(currentUserId)
            ? users.filter(u => u !== currentUserId)
            : [...users, currentUserId]
          return { reactions: r }
        })
      },

      dismissToast: (toastId) =>
        set(state => ({ toasts: state.toasts.filter(t => t.id !== toastId) })),

      getLeaderboard: (period = 'all') => {
        const { users, workouts } = get()
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        return users.map(user => {
          const uw = period === 'week'
            ? workouts.filter(w => w.userId === user.id && parseISO(w.date) >= weekStart)
            : workouts.filter(w => w.userId === user.id)
          return {
            ...user,
            points: uw.reduce((s, w) => s + w.points, 0),
            streak: calcStreak(workouts, user.id),
            workoutCount: uw.length,
          }
        }).sort((a, b) => b.points - a.points)
      },

      getUserStats: (userId) => {
        const { workouts, reactions } = get()
        return calcStats(workouts, reactions, userId)
      },

      getUnlockedAchievements: (userId) => {
        const { workouts, reactions } = get()
        const stats = calcStats(workouts, reactions, userId)
        return ACHIEVEMENTS.filter(a => a.check(stats))
      },

      getWeeklyChallenge: () => {
        const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
        return WEEKLY_CHALLENGES[weekNum % WEEKLY_CHALLENGES.length]
      },

      getChallengeProgress: (userId) => {
        const { workouts } = get()
        const challenge = get().getWeeklyChallenge()
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        const ww = workouts.filter(w => w.userId === userId && parseISO(w.date) >= weekStart)
        if (challenge.type === 'type') return Math.min(ww.filter(w => challenge.types.includes(w.type)).length, challenge.goal)
        if (challenge.type === 'total') return Math.min(ww.length, challenge.goal)
        if (challenge.type === 'variety') return Math.min(new Set(ww.map(w => w.type)).size, challenge.goal)
        return 0
      },

      seedDemoData: () => {
        const types = ['run', 'lift', 'bike', 'hiit', 'swim', 'yoga', 'sports', 'climb']
        set(state => {
          const newUsers = DEMO_NAMES.map((u, i) => ({
            id: `demo_${i + 1}`,
            name: u.name,
            emoji: u.emoji,
            joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          }))
          const newWorkouts = []
          newUsers.forEach((user, ui) => {
            const count = 8 + Math.floor(Math.random() * 12)
            for (let i = 0; i < count; i++) {
              const daysAgo = Math.floor(Math.random() * 14)
              const type = types[Math.floor(Math.random() * types.length)]
              const wt = WORKOUT_TYPES.find(t => t.id === type)
              const duration = 20 + Math.floor(Math.random() * 55)
              newWorkouts.push({
                id: `dw_${ui}_${i}_${Date.now()}`,
                userId: user.id,
                type,
                duration,
                notes: DEMO_NOTES[Math.floor(Math.random() * DEMO_NOTES.length)],
                date: new Date(Date.now() - daysAgo * 86400000 - Math.floor(Math.random() * 14) * 3600000).toISOString(),
                points: Math.round(wt.points * duration),
              })
            }
          })
          return {
            users: [...state.users, ...newUsers],
            workouts: [...state.workouts, ...newWorkouts].sort((a, b) => new Date(b.date) - new Date(a.date)),
          }
        })
      },

      REACTION_EMOJIS,
    }),
    { name: 'crest-v2' }
  )
)
