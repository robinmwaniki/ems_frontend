import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe('DemoExperience', () => {
    it('shows a synthetic-data banner and role-specific guided tour in demo mode', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'true')
        const [{ default: DemoExperience }, { useAuthStore }, { makeUser }] = await Promise.all([
            import('./DemoExperience'),
            import('@/store/auth'),
            import('@/test/fixtures'),
        ])
        useAuthStore.setState({
            token: 'demo-token',
            user: makeUser('ROLE_EMPLOYEE'),
        })

        render(<MemoryRouter><DemoExperience /></MemoryRouter>)

        expect(screen.getByText('DEMO')).toBeInTheDocument()
        expect(screen.getByText(/synthetic data/i)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Guided tour' }))
        expect(screen.getByRole('navigation', { name: 'Demo guided tour' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /my payslips/i })).toHaveAttribute('href', '/employee/payroll')
        expect(screen.queryByRole('link', { name: /employee records/i })).not.toBeInTheDocument()
    })

    it('renders nothing when demo mode is disabled', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'false')
        const { default: DemoExperience } = await import('./DemoExperience')

        const { container } = render(<MemoryRouter><DemoExperience /></MemoryRouter>)

        expect(container).toBeEmptyDOMElement()
    })
})
