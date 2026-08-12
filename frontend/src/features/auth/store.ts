import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { TokenResponse } from './types'

interface AuthState {
  accessToken: string | null
  expiresAt: number | null
  setSession: (token: TokenResponse) => void
  clearSession: () => void
  hasValidSession: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      expiresAt: null,
      setSession: (token) => {
        set({
          accessToken: token.access_token,
          expiresAt: Date.now() + token.expires_in * 1000,
        })
      },
      clearSession: () => set({ accessToken: null, expiresAt: null }),
      hasValidSession: () => {
        const { accessToken, expiresAt } = get()
        return Boolean(accessToken && expiresAt && expiresAt > Date.now())
      },
    }),
    {
      name: 'silly-teamwork-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ accessToken, expiresAt }) => ({ accessToken, expiresAt }),
    },
  ),
)

export function clearAuthSession() {
  useAuthStore.getState().clearSession()
}
