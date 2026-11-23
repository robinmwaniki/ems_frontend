import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'

function BrokenComponent(): never {
    throw new Error('private employee data must not appear')
}

describe('AppErrorBoundary', () => {
    it('renders a safe fallback when a child throws', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <AppErrorBoundary>
                <BrokenComponent />
            </AppErrorBoundary>,
        )

        expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
        expect(screen.getByRole('button', { name: 'Reload application' })).toBeInTheDocument()
        expect(screen.queryByText(/private employee data/i)).not.toBeInTheDocument()

        consoleError.mockRestore()
    })
})
