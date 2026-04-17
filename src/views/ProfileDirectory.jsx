import { useState } from 'react'
import { useProfileDirectoryStore } from '../store/useProfileDirectoryStore'

const EMPTY_FORM = { name: '', street: '', city: '', state: '', postalCode: '', country: '' }

function ProfileForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  const inputCls = 'w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors'
  const labelCls = 'block text-xs font-semibold text-slate-400 mb-1'

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        {initial.id ? 'Edit Profile' : 'Add New Profile'}
      </h2>

      <div>
        <label className={labelCls}>Full Name *</label>
        <input className={inputCls} placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
      </div>

      <div>
        <label className={labelCls}>Street</label>
        <input className={inputCls} placeholder="123 Main St" value={form.street} onChange={set('street')} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>City</label>
          <input className={inputCls} placeholder="Springfield" value={form.city} onChange={set('city')} />
        </div>
        <div>
          <label className={labelCls}>State</label>
          <input className={inputCls} placeholder="IL" value={form.state} onChange={set('state')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Postal Code</label>
          <input className={inputCls} placeholder="62701" value={form.postalCode} onChange={set('postalCode')} />
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input className={inputCls} placeholder="USA" value={form.country} onChange={set('country')} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors"
        >
          {initial.id ? 'Update' : 'Save'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-sm transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function addressLine(p) {
  return [p.street, p.city, p.state, p.postalCode, p.country].filter(Boolean).join(', ')
}

function ProfileCard({ profile, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-black text-orange-400">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-base leading-tight">{profile.name}</div>
          {addressLine(profile) && (
            <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{addressLine(profile)}</div>
          )}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(profile)}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          {confirmDelete ? (
            <>
              <button
                onClick={() => onDelete(profile.id)}
                className="px-2 h-8 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-colors"
              >
                No
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfileDirectory() {
  const { profiles, saveProfile, deleteProfile } = useProfileDirectoryStore()
  const [editProfile, setEditProfile] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    addressLine(p).toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (form) => {
    saveProfile(form)
    setShowForm(false)
    setEditProfile(null)
  }

  const handleEdit = (profile) => {
    setEditProfile(profile)
    setShowForm(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => setEditProfile(null)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-white">People</h1>
            <p className="text-xs text-slate-500 mt-0.5">{profiles.length} profile{profiles.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setEditProfile(null) }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-all ${
              showForm
                ? 'bg-slate-600 text-slate-300'
                : 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/30 text-white'
            }`}
          >
            {showForm ? '✕' : '+'}
          </button>
        </div>

        {profiles.length > 0 && (
          <input
            type="search"
            placeholder="Search by name or address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-700/80 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        )}
      </div>

      <div className="px-4 pb-8 space-y-3">
        {/* Edit form (top) */}
        {editProfile && (
          <ProfileForm
            initial={editProfile}
            onSave={handleSave}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Add form */}
        {showForm && !editProfile && (
          <ProfileForm onSave={handleSave} onCancel={() => setShowForm(false)} />
        )}

        {/* Profile list */}
        {filtered.map(p => (
          <ProfileCard
            key={p.id}
            profile={p}
            onEdit={handleEdit}
            onDelete={deleteProfile}
          />
        ))}

        {/* Empty states */}
        {profiles.length === 0 && !showForm && (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-3">👤</div>
            <p className="font-semibold">No profiles yet</p>
            <p className="text-sm mt-1">Tap + to add your first one</p>
          </div>
        )}

        {profiles.length > 0 && filtered.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <p className="font-semibold">No results for &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  )
}
