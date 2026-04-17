import { useState } from 'react'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { WORKOUT_TYPES } from '../data/workoutTypes'

export default function LogWorkout() {
  const { logWorkout, setView } = useWorkoutStore()
  const [type, setType] = useState('run')
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const selected = WORKOUT_TYPES.find(t => t.id === type)
  const pts = Math.round(selected.points * duration)

  const handleLog = () => {
    if (submitted) return
    setSubmitted(true)
    logWorkout(type, duration, notes)
    setTimeout(() => {
      setView('dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen px-4 pt-12 pb-8">
      <h1 className="text-3xl font-black text-white mb-6">Log Workout</h1>

      {/* Workout type grid */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Type</label>
        <div className="grid grid-cols-5 gap-2">
          {WORKOUT_TYPES.map(wt => (
            <button
              key={wt.id}
              onClick={() => setType(wt.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all tap-highlight-none ${
                type === wt.id
                  ? `${wt.bg} ${wt.border} scale-105 shadow-lg`
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500'
              }`}
            >
              <span className="text-2xl">{wt.emoji}</span>
              <span className={`text-[9px] font-bold ${type === wt.id ? wt.text : 'text-slate-500'}`}>
                {wt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6 bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Duration</label>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{duration}</span>
            <span className="text-slate-400 font-medium">min</span>
          </div>
        </div>
        <input
          type="range"
          min={5}
          max={180}
          step={5}
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="w-full accent-orange-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>5</span>
          <span>60</span>
          <span>120</span>
          <span>180</span>
        </div>

        {/* Quick picks */}
        <div className="flex gap-2 mt-3">
          {[15, 30, 45, 60, 90].map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all tap-highlight-none ${
                duration === d ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6 bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did it feel? Personal best? Crushed it?"
          rows={3}
          maxLength={140}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm resize-none transition-colors"
        />
      </div>

      {/* Points preview */}
      <div className="mb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-5 py-2">
          <span className="text-xl">{selected.emoji}</span>
          <span className="text-white font-semibold">You&apos;ll earn</span>
          <span className="text-2xl font-black text-orange-400">{pts}</span>
          <span className="text-slate-400">points</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{selected.points} pts/min × {duration} min</p>
      </div>

      {/* Submit */}
      <button
        onClick={handleLog}
        disabled={submitted}
        className={`w-full py-4 rounded-2xl font-black text-xl text-white transition-all shadow-lg tap-highlight-none ${
          submitted
            ? 'bg-green-500 shadow-green-500/30 scale-95'
            : 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/30 active:scale-95'
        }`}
      >
        {submitted ? '✅ Logged!' : `LOG WORKOUT ${selected.emoji}`}
      </button>
    </div>
  )
}
