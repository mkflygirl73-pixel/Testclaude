import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProfileDirectoryStore = create(
  persist(
    (set) => ({
      profiles: [],

      saveProfile: (profile) => set((state) => {
        if (profile.id) {
          return { profiles: state.profiles.map(p => p.id === profile.id ? { ...p, ...profile } : p) }
        }
        return {
          profiles: [
            ...state.profiles,
            { ...profile, id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` },
          ],
        }
      }),

      deleteProfile: (id) => set((state) => ({
        profiles: state.profiles.filter(p => p.id !== id),
      })),
    }),
    { name: 'profile-directory-v1' }
  )
)
