
import { create } from 'zustand'
import type { MeResponse } from '@/types/api'

interface AuthState {
    token: string | null
    user: MeResponse | null

    setAuth: (token: string, user: MeResponse) => void
    clearAuth: () => void

    isAdmin: () => boolean
    isHr: () => boolean
    isStaff: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: sessionStorage.getItem('token'),
    user: null,

    setAuth: (token, user) => {
        sessionStorage.setItem('token', token)
        set({
            token,
            user,
        })
    },

    clearAuth: () => {
        sessionStorage.removeItem('token')

        set({
            token: null,
            user: null,
        })
    },

    isAdmin: () => get().user?.role === 'ROLE_ADMIN',

    isHr: () => get().user?.role === 'ROLE_HR_MANAGER',

    isStaff: () => {
        const role = get().user?.role

        return role === 'ROLE_ADMIN' || role === 'ROLE_HR_MANAGER'
    },
}))
