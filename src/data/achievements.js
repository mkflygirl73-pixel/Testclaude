export const ACHIEVEMENTS = [
  {
    id: 'first_workout', label: 'First Step', emoji: '👟', rarity: 'common',
    desc: 'Log your first workout',
    check: (s) => s.totalWorkouts >= 1,
  },
  {
    id: 'streak_3', label: 'Hat Trick', emoji: '🎩', rarity: 'common',
    desc: '3-day workout streak',
    check: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak_7', label: 'Week Warrior', emoji: '⚔️', rarity: 'rare',
    desc: '7-day streak — one full week!',
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: 'streak_30', label: 'Unstoppable', emoji: '🔥', rarity: 'legendary',
    desc: '30-day streak. Absolute machine.',
    check: (s) => s.currentStreak >= 30,
  },
  {
    id: 'workouts_10', label: 'Getting Serious', emoji: '💪', rarity: 'common',
    desc: '10 total workouts',
    check: (s) => s.totalWorkouts >= 10,
  },
  {
    id: 'workouts_50', label: 'Dedicated', emoji: '🏅', rarity: 'rare',
    desc: '50 total workouts',
    check: (s) => s.totalWorkouts >= 50,
  },
  {
    id: 'workouts_100', label: 'Century Club', emoji: '💯', rarity: 'epic',
    desc: '100 total workouts',
    check: (s) => s.totalWorkouts >= 100,
  },
  {
    id: 'pts_1k', label: 'Point Chaser', emoji: '⭐', rarity: 'common',
    desc: 'Earn 1,000 total points',
    check: (s) => s.totalPoints >= 1000,
  },
  {
    id: 'pts_5k', label: 'Superstar', emoji: '🌟', rarity: 'epic',
    desc: 'Earn 5,000 total points',
    check: (s) => s.totalPoints >= 5000,
  },
  {
    id: 'pts_10k', label: 'Legend', emoji: '👑', rarity: 'legendary',
    desc: 'Earn 10,000 total points',
    check: (s) => s.totalPoints >= 10000,
  },
  {
    id: 'runner', label: 'Road Runner', emoji: '🏃', rarity: 'rare',
    desc: '10 running workouts',
    check: (s) => (s.byType?.run || 0) >= 10,
  },
  {
    id: 'swimmer', label: 'Aquaman', emoji: '🌊', rarity: 'rare',
    desc: '10 swimming workouts',
    check: (s) => (s.byType?.swim || 0) >= 10,
  },
  {
    id: 'lifter', label: 'Iron Pumper', emoji: '🏋️', rarity: 'rare',
    desc: '10 weightlifting workouts',
    check: (s) => (s.byType?.lift || 0) >= 10,
  },
  {
    id: 'variety', label: 'Cross Trainer', emoji: '🎯', rarity: 'epic',
    desc: 'Try 5 different workout types',
    check: (s) => Object.keys(s.byType || {}).length >= 5,
  },
  {
    id: 'early_bird', label: 'Early Bird', emoji: '🌅', rarity: 'rare',
    desc: 'Log a workout before 7am',
    check: (s) => s.hasEarlyBird,
  },
  {
    id: 'night_owl', label: 'Night Owl', emoji: '🦉', rarity: 'rare',
    desc: 'Log a workout after 10pm',
    check: (s) => s.hasNightOwl,
  },
  {
    id: 'social', label: 'Hype Person', emoji: '📣', rarity: 'common',
    desc: 'React to 5 workouts',
    check: (s) => (s.totalReactions || 0) >= 5,
  },
  {
    id: 'marathon_session', label: 'Endurance Beast', emoji: '🦾', rarity: 'epic',
    desc: 'Log a workout longer than 90 minutes',
    check: (s) => s.longestWorkout >= 90,
  },
]

export const RARITY_STYLES = {
  common:    { border: 'border-slate-600',  bg: 'bg-slate-700/50',  label: 'text-slate-400',  glow: '' },
  rare:      { border: 'border-blue-500',   bg: 'bg-blue-900/40',   label: 'text-blue-400',   glow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]' },
  epic:      { border: 'border-purple-500', bg: 'bg-purple-900/40', label: 'text-purple-400', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]' },
  legendary: { border: 'border-amber-400',  bg: 'bg-amber-900/40',  label: 'text-amber-400',  glow: 'shadow-[0_0_16px_rgba(251,191,36,0.5)]' },
}
