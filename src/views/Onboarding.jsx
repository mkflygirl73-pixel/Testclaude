import { useState } from 'react'
import { useWorkoutStore } from '../store/useWorkoutStore'

const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦅', '🐉', '🦄', '🐻', '🐼', '🦋', '🐬', '🦀', '🔥', '⚡', '🌊', '🏔️', '💎', '🚀']

export default function Onboarding() {
  const { addUser, seedDemoData } = useWorkoutStore()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🦁')
  const [withDemo, setWithDemo] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleStart = async () => {
    if (!name.trim() || withDemo === null || busy) return
    setBusy(true)
    await addUser(name.trim(), emoji)
    if (withDemo) await seedDemoData()
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-5 max-w-md mx-auto">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="text-7xl mb-3 animate-pop">🏔️</div>
        <h1 className="text-5xl font-black tracking-tight text-white">CREST</h1>
        <p className="text-slate-400 mt-2 font-medium">Compete. Train. Conquer.</p>
      </div>

      <div className="w-full space-y-4">
        {/* Name */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            placeholder="Enter your name"
            autoFocus
            maxLength={20}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-lg font-semibold transition-colors"
          />
        </div>

        {/* Avatar */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Your Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map(av => (
              <button
                key={av}
                onClick={() => setEmoji(av)}
                className={`text-2xl p-2.5 rounded-xl transition-all tap-highlight-none ${
                  emoji === av ? 'bg-orange-500 scale-110 shadow-lg shadow-orange-500/30' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Demo data option */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Play Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setWithDemo(false)}
              className={`p-3 rounded-xl border text-sm font-semibold transition-all tap-highlight-none ${
                withDemo === false ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              <div className="text-xl mb-1">🙋</div>
              Solo Start
            </button>
            <button
              onClick={() => setWithDemo(true)}
              className={`p-3 rounded-xl border text-sm font-semibold transition-all tap-highlight-none ${
                withDemo === true ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              <div className="text-xl mb-1">🏟️</div>
              With Rivals
            </button>
          </div>
          {withDemo && (
            <p className="text-xs text-slate-500 mt-2 text-center">3 AI rivals with workout history will be added</p>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim() || withDemo === null || busy}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-xl transition-all shadow-lg shadow-orange-500/30 tap-highlight-none"
        >
          {busy ? 'Setting up...' : "LET'S GO 🚀"}
        </button>
      </div>
    </div>
  )
}
