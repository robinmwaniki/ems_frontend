import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeUser } from '@/test/fixtures'
import { useAuthStore } from '@/store/auth'
import type { Role } from '@/types/api'
import RequireAuth from './RequireAuth'

// Renders a protected page inside a router that also has the pages a
// visitor can be redirected to.
function renderProtected(allowedRoles: Role[], startAt = '/secret') {
    return render(
        <MemoryRouter initialEntries={[startAt]}>
            <Routes>
                <Route path="/login" element={<p>Login page</p>} />
                <Route path="/dashboard" element={<p>Staff dashboard</p>} />
                <Route
                    path="/employee/dashboard"
                    element={<p>Employee dashboard</p>}
                />
                <Route
                    path="/secret"
                    element={
                        <RequireAuth allowedRoles={allowedRoles}>
                            <p>Protected content</p>
                        </RequireAuth>
                    }
                />
            </Routes>
        </MemoryRouter>,
    )
}

describe('RequireAuth', () => {
    beforeEach(() => {
        useAuthStore.setState({ token: null, user: null })
    })

    it('redirects signed-out visitors to the login page', () => {
        renderProtected(['ROLE_ADMIN'])

        expect(screen.getByText('Login page')).toBeInTheDocument()
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('shows a loading message while the user is being loaded', () => {
        useAuthStore.setState({ token: 'abc', user: null })

        renderProtected(['ROLE_ADMIN'])

        expect(screen.getByText('Loading your account...')).toBeInTheDocument()
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('renders the page for a user with an allowed role', () => {
        useAuthStore.setState({
            token: 'abc',
            user: makeUser('ROLE_HR_MANAGER'),
        })

        renderProtected(['ROLE_ADMIN', 'ROLE_HR_MANAGER'])

        expect(screen.getByText('Protected content')).toBeInTheDocument()
    })

    it('sends an employee away from a staff-only page', () => {
        useAuthStore.setState({
            token: 'abc',
            user: makeUser('ROLE_EMPLOYEE'),
        })

        renderProtected(['ROLE_ADMIN', 'ROLE_HR_MANAGER'])

        expect(screen.getByText('Employee dashboard')).toBeInTheDocument()
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('sends staff away from an employee-only page', () => {
        useAuthStore.setState({
            token: 'abc',
            user: makeUser('ROLE_ADMIN'),
        })

        renderProtected(['ROLE_EMPLOYEE'])

        expect(screen.getByText('Staff dashboard')).toBeInTheDocument()
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })
})