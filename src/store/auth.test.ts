import { beforeEach, describe, expect, it } from 'vitest'
import { makeUser } from '@/test/fixtures'
import { useAuthStore } from './auth'

describe('auth store', () => {
    beforeEach(() => {
        useAuthStore.setState({ token: null, user: null })
    })

    it('stores the token and user when authenticated', () => {
        const user = makeUser('ROLE_ADMIN')

        useAuthStore.getState().setAuth('abc123', user)

        expect(useAuthStore.getState().token).toBe('abc123')
        expect(useAuthStore.getState().user).toEqual(user)
        expect(sessionStorage.getItem('token')).toBe('abc123')
    })

    it('clears the token and user on logout', () => {
        useAuthStore.getState().setAuth('abc123', makeUser('ROLE_ADMIN'))

        useAuthStore.getState().clearAuth()

        expect(useAuthStore.getState().token).toBeNull()
        expect(useAuthStore.getState().user).toBeNull()
        expect(sessionStorage.getItem('token')).toBeNull()
    })

    it('identifies an admin', () => {
        useAuthStore.getState().setAuth('t', makeUser('ROLE_ADMIN'))
        const state = useAuthStore.getState()

        expect(state.isAdmin()).toBe(true)
        expect(state.isHr()).toBe(false)
        expect(state.isStaff()).toBe(true)
    })

    it('identifies an HR manager as staff but not admin', () => {
        useAuthStore.getState().setAuth('t', makeUser('ROLE_HR_MANAGER'))
        const state = useAuthStore.getState()

        expect(state.isAdmin()).toBe(false)
        expect(state.isHr()).toBe(true)
        expect(state.isStaff()).toBe(true)
    })

    it('does not treat an employee as staff', () => {
        useAuthStore.getState().setAuth('t', makeUser('ROLE_EMPLOYEE'))
        const state = useAuthStore.getState()

        expect(state.isAdmin()).toBe(false)
        expect(state.isHr()).toBe(false)
        expect(state.isStaff()).toBe(false)
    })

    it('treats a signed-out visitor as having no role', () => {
        const state = useAuthStore.getState()

        expect(state.isAdmin()).toBe(false)
        expect(state.isHr()).toBe(false)
        expect(state.isStaff()).toBe(false)
    })
})