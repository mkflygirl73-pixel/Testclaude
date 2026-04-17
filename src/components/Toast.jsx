import { useEffect } from 'react'
import { useWorkoutStore } from '../store/useWorkoutStore'

function ToastItem({ toast }) {
  const dismissToast = useWorkoutStore(s => s.dismissToast)

  useEffect(() => {
    const t = setTimeout(() => dismissToast(toast.id), 3200)
    return () => clearTimeout(t)
  }, [toast.id, dismissToast])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-slide-up border text-sm font-semibold ${
        toast.kind === 'achievement'
          ? 'bg-amber-900/90 border-amber-500 text-amber-200'
          : 'bg-slate-800/95 border-orange-500 text-white'
      }`}
      onClick={() => dismissToast(toast.id)}
    >
      <span className="text-xl">{toast.emoji}</span>
      <div className="flex flex-col">
        {toast.kind === 'achievement' && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Achievement Unlocked</span>
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  )
}

export default function Toast() {
  const toasts = useWorkoutStore(s => s.toasts)
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
