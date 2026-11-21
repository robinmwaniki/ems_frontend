import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeUser } from '@/test/fixtures'

const authMocks = vi.hoisted(() => ({
    login: vi.fn(),
    demoLogin: vi.fn(),
    me: vi.fn(),
}))

vi.mock('@/api/auth', () => ({
    authApi: authMocks,
}))

afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe('demo login entry point', () => {
    it('offers role choices and signs in using the selected synthetic role', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'true')
        vi.stubEnv('VITE_DEMO_API_URL', 'https://demo-api.example.com')
        authMocks.demoLogin.mockResolvedValue({ accessToken: 'demo-jwt', tokenType: 'Bearer' })
        authMocks.me.mockResolvedValue(makeUser('ROLE_HR_MANAGER'))

        const [{ default: LoginPage }, { useAuthStore }] = await Promise.all([
            import('./Login'),
            import('@/store/auth'),
        ])
        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<p>Staff demo dashboard</p>} />
                </Routes>
            </MemoryRouter>,
        )

        expect(screen.getByRole('heading', { name: 'Explore the demo' })).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /hr manager/i }))

        await waitFor(() => expect(screen.getByText('Staff demo dashboard')).toBeInTheDocument())
        expect(authMocks.demoLogin).toHaveBeenCalledWith('ROLE_HR_MANAGER')
        expect(useAuthStore.getState().user?.role).toBe('ROLE_HR_MANAGER')
    })

    it('does not expose demo choices when demo mode is disabled', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'false')
        const { default: LoginPage } = await import('./Login')

        render(<MemoryRouter><LoginPage /></MemoryRouter>)

        expect(screen.queryByRole('heading', { name: 'Explore the demo' })).not.toBeInTheDocument()
    })

    it('disables demo login if the dedicated demo API URL is missing', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'true')
        vi.stubEnv('VITE_DEMO_API_URL', '')
        const { default: LoginPage } = await import('./Login')

        render(<MemoryRouter><LoginPage /></MemoryRouter>)

        expect(screen.getByRole('button', { name: /administrator/i })).toBeDisabled()
        expect(screen.getByRole('status')).toHaveTextContent(/not configured/i)
        expect(authMocks.demoLogin).not.toHaveBeenCalled()
    })
})
