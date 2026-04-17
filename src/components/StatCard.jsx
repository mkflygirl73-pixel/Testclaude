export default function StatCard({ label, value, emoji, sub }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col gap-1">
      <span className="text-2xl">{emoji}</span>
      <span className="text-2xl font-black text-white leading-none">{value}</span>
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  )
}
