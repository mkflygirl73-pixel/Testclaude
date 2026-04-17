import { create } from 'zustand'
import { format, startOfWeek, parseISO, subDays, differenceInDays } from 'date-fns'
import { WORKOUT_TYPES } from '../data/workoutTypes'
import { ACHIEVEMENTS } from '../data/achievements'
import confetti from 'canvas-confetti'

// ── GitHub file storage ───────────────────────────────────────────────────────
const OWNER     = 'mkflygirl73-pixel'
const REPO      = 'Testclaude'
const BRANCH    = 'main'
const DATA_PATH = 'data/db.json'
const TOKEN     = import.meta.env.VITE_GITHUB_TOKEN
const API_URL   = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`

const hdrs = () => ({
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
})

const encodeJSON = (obj) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj, null, 2))))

const decodeB64 = (b64) => {
  try { return JSON.parse(decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))))) }
  catch { return emptyDB() }
}

const emptyDB = () => ({ users: {}, workouts: {}, reactions: {}, meta: {} })

async function readDB() {
  const res = await fetch(`${API_URL}?ref=${BRANCH}&_=${Date.now()}`, { headers: hdrs() })
  if (!res.ok) return { data: emptyDB(), sha: '' }
  const info = await res.json()
  return { data: decodeB64(info.content), sha: info.sha }
}

function applyPatch(data, updates) {
  const out = JSON.parse(JSON.stringify(data))
  for (const [path, value] of Object.entries(updates)) {
    const parts = path.split('/')
    let node = out
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]] || typeof node[parts[i]] !== 'object') node[parts[i]] = {}
      node = node[parts[i]]
    }
    const key = parts[parts.length - 1]
    if (value === null) delete node[key]
    else node[key] = value
  }
  return out
}

async function writeDB(updates, retries = 4) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const { data, sha } = await readDB()
    const newData = applyPatch(data, updates)
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: hdrs(),
      body: JSON.stringify({
        message: 'update [skip ci]',
        content: encodeJSON(newData),
        sha,
        branch: BRANCH,
      }),
    })
    if (res.ok) return newData
    if (res.status !== 409) throw new Error(`Write failed: ${res.status}`)
    await new Promise(r => setTimeout(r, 700 * (attempt + 1)))
  }
  throw new Error('Write failed after retries')
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
    Object.values(wr).some(u => Array.isArray(u) && u.includes(userId))
  ).length
  return {
    totalPoints:    uw.reduce((s, w) => s + w.points, 0),
    weeklyPoints:   uw.filter(w => parseISO(w.date) >= weekStart).reduce((s, w) => s + w.points, 0),
    totalWorkouts:  uw.length,
    totalMinutes:   uw.reduce((s, w) => s + w.duration, 0),
    currentStreak:  calcStreak(workouts, userId),
    byType,
    hasEarlyBird:   uw.some(w => new Date(w.date).getHours() < 7),
    hasNightOwl:    uw.some(w => new Date(w.date).getHours() >= 22),
    totalReactions,
    longestWorkout: uw.reduce((m, w) => Math.max(m, w.duration), 0),
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const REACTION_EMOJIS = ['🔥', '💪', '🎉', '👏', '⚡']
const CURRENT_USER_KEY = 'crest-uid'

const WEEKLY_CHALLENGES = [
  { title: 'Distance Week', desc: 'Log 5 run or cycle sessions', emoji: '🏃', goal: 5, type: 'type', types: ['run', 'bike'] },
  { title: 'Iron Week',     desc: 'Hit the weights 4 times',     emoji: '🏋️', goal: 4, type: 'type', types: ['lift'] },
  { title: 'Zen Week',      desc: 'Complete 3 yoga sessions',    emoji: '🧘', goal: 3, type: 'type', types: ['yoga'] },
  { title: 'Swim Week',     desc: 'Dive in for 3 swim sessions', emoji: '🏊', goal: 3, type: 'type', types: ['swim'] },
  { title: 'Marathon Week', desc: 'Log 10+ workouts total',      emoji: '💥', goal: 10, type: 'total' },
  { title: 'Variety Pack',  desc: 'Try 4 different workout types', emoji: '🎯', goal: 4, type: 'variety' },
]

const DEMO_NAMES = [{ name: 'Alex', emoji: '🦁' }, { name: 'Sam', emoji: '🐯' }, { name: 'Jordan', emoji: '🦅' }]
const DEMO_NOTES = ['Felt great!', 'Tough session', 'Personal best!', 'Solid workout', '', 'Crushed it', 'Morning grind', 'Worth it']

// ── Store ─────────────────────────────────────────────────────────────────────
export const useWorkoutStore = create((set, get) => ({
  users: [],
  workouts: [],
  reactions: {},
  currentUserId: localStorage.getItem(CURRENT_USER_KEY),
  ownerId: null,
  view: 'dashboard',
  profileUserId: null,
  toasts: [],
  unlockedAchievements: {},
  loading: true,
  initialized: false,
  REACTION_EMOJIS,

  _sync: (db) => set({
    users:                db.users    ? Object.values(db.users)   : [],
    workouts:             db.workouts ? Object.values(db.workouts).sort((a, b) => new Date(b.date) - new Date(a.date)) : [],
    reactions:            db.reactions || {},
    ownerId:              db.meta?.ownerId || null,
    unlockedAchievements: db.meta?.unlockedAchievements || {},
  }),

  init: async () => {
    if (get().initialized) return
    set({ initialized: true })
    const { data } = await readDB()
    get()._sync(data)
    set({ loading: false })
    setInterval(async () => { const { data } = await readDB(); get()._sync(data) }, 5000)
  },

  addUser: async (name, emoji) => {
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const user = { id, name, emoji, joinDate: new Date().toISOString() }
    const updates = { [`users/${id}`]: user }
    if (!get().ownerId) updates['meta/ownerId'] = id
    const newData = await writeDB(updates)
    get()._sync(newData)
    localStorage.setItem(CURRENT_USER_KEY, id)
    set({ currentUserId: id })
    return id
  },

  setCurrentUser: (userId) => {
    localStorage.setItem(CURRENT_USER_KEY, userId)
    set({ currentUserId: userId, view: 'dashboard' })
  },

  setView: (view, profileUserId = null) => set({ view, profileUserId }),

  removeUser: async (userId) => {
    const { currentUserId, ownerId, workouts } = get()
    if (currentUserId !== ownerId || userId === ownerId) return
    const updates = {
      [`users/${userId}`]: null,
      [`meta/unlockedAchievements/${userId}`]: null,
    }
    workouts.filter(w => w.userId === userId).forEach(w => {
      updates[`workouts/${w.id}`] = null
      updates[`reactions/${w.id}`] = null
    })
    const newData = await writeDB(updates)
    get()._sync(newData)
  },

  logWorkout: async (type, duration, notes = '') => {
    const { currentUserId, workouts, reactions, unlockedAchievements } = get()
    if (!currentUserId) return null
    const wt = WORKOUT_TYPES.find(t => t.id === type)
    const points = Math.round(wt.points * duration)
    const id = `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const workout = { id, userId: currentUserId, type, duration, notes, date: new Date().toISOString(), points }

    set(state => ({ workouts: [workout, ...state.workouts] }))

    const stats = calcStats([workout, ...workouts], reactions, currentUserId)
    const nowUnlocked = ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id)
    const prevUnlocked = unlockedAchievements[currentUserId] || []
    const justUnlocked = nowUnlocked.filter(i => !prevUnlocked.includes(i))

    const updates = { [`workouts/${id}`]: workout }
    if (justUnlocked.length > 0) {
      updates[`meta/unlockedAchievements/${currentUserId}`] = nowUnlocked
      set(state => ({ unlockedAchievements: { ...state.unlockedAchievements, [currentUserId]: nowUnlocked } }))
    }
    await writeDB(updates)

    const newToasts = [
      { id: `t_pts_${Date.now()}`, kind: 'points', message: `+${points} points!`, emoji: wt.emoji },
      ...justUnlocked.map(achId => {
        const ach = ACHIEVEMENTS.find(a => a.id === achId)
        return { id: `t_ach_${achId}_${Date.now()}`, kind: 'achievement', message: ach.label, emoji: ach.emoji }
      }),
    ]
    set(state => ({ toasts: [...state.toasts, ...newToasts] }))
    confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 }, colors: ['#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'] })
    return { points, id }
  },

  addReaction: async (workoutId, emoji) => {
    const { currentUserId, reactions } = get()
    if (!currentUserId) return
    const current = reactions[workoutId]?.[emoji] || []
    const updated = current.includes(currentUserId)
      ? current.filter(u => u !== currentUserId)
      : [...current, currentUserId]
    set(state => ({
      reactions: { ...state.reactions, [workoutId]: { ...(state.reactions[workoutId] || {}), [emoji]: updated } },
    }))
    await writeDB({ [`reactions/${workoutId}/${emoji}`]: updated.length ? updated : null })
  },

  dismissToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  getLeaderboard: (period = 'all') => {
    const { users, workouts } = get()
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    return users.map(user => {
      const uw = period === 'week'
        ? workouts.filter(w => w.userId === user.id && parseISO(w.date) >= weekStart)
        : workouts.filter(w => w.userId === user.id)
      return { ...user, points: uw.reduce((s, w) => s + w.points, 0), streak: calcStreak(workouts, user.id), workoutCount: uw.length }
    }).sort((a, b) => b.points - a.points)
  },

  getUserStats: (userId) => calcStats(get().workouts, get().reactions, userId),

  getUnlockedAchievements: (userId) => {
    const stats = calcStats(get().workouts, get().reactions, userId)
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
    if (challenge.type === 'type')    return Math.min(ww.filter(w => challenge.types.includes(w.type)).length, challenge.goal)
    if (challenge.type === 'total')   return Math.min(ww.length, challenge.goal)
    if (challenge.type === 'variety') return Math.min(new Set(ww.map(w => w.type)).size, challenge.goal)
    return 0
  },

  seedDemoData: async () => {
    const types = ['run', 'lift', 'bike', 'hiit', 'swim', 'yoga', 'sports', 'climb']
    const updates = {}
    DEMO_NAMES.forEach((u, ui) => {
      const user = { id: `demo_${ui + 1}`, name: u.name, emoji: u.emoji, joinDate: new Date(Date.now() - 30 * 86400000).toISOString() }
      updates[`users/${user.id}`] = user
      for (let i = 0; i < 8 + Math.floor(Math.random() * 10); i++) {
        const daysAgo = Math.floor(Math.random() * 14)
        const type = types[Math.floor(Math.random() * types.length)]
        const wt = WORKOUT_TYPES.find(t => t.id === type)
        const duration = 20 + Math.floor(Math.random() * 55)
        const id = `dw_${ui}_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
        updates[`workouts/${id}`] = {
          id, userId: user.id, type, duration,
          notes: DEMO_NOTES[Math.floor(Math.random() * DEMO_NOTES.length)],
          date: new Date(Date.now() - daysAgo * 86400000 - Math.floor(Math.random() * 14) * 3600000).toISOString(),
          points: Math.round(wt.points * duration),
        }
      }
    })
    await writeDB(updates)
  },
}))
