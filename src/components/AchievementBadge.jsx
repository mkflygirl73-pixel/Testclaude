import { RARITY_STYLES } from '../data/achievements'

export default function AchievementBadge({ achievement, unlocked }) {
  const s = RARITY_STYLES[achievement.rarity]
  return (
    <div
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
        unlocked
          ? `${s.bg} ${s.border} ${s.glow}`
          : 'bg-slate-800/50 border-slate-800 opacity-40 grayscale'
      }`}
      title={achievement.desc}
    >
      <span className="text-2xl">{achievement.emoji}</span>
      <span className={`text-[10px] font-bold text-center leading-tight ${unlocked ? s.label : 'text-slate-500'}`}>
        {achievement.label}
      </span>
      {unlocked && (
        <span className={`text-[9px] font-semibold uppercase tracking-wider ${s.label}`}>
          {achievement.rarity}
        </span>
      )}
    </div>
  )
}
