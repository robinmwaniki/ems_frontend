import type { ReactNode } from 'react'
import * as Sentry from '@sentry/react'

interface Props {
    children: ReactNode
}

export function AppErrorBoundary({ children }: Props) {
    return (
        <Sentry.ErrorBoundary
            fallback={
                <main role="alert" className="app-error-fallback">
                    <h1>Something went wrong</h1>
                    <p>The application could not complete this action.</p>
                    <button type="button" onClick={() => window.location.reload()}>
                        Reload application
                    </button>
                </main>
            }
        >
            {children}
        </Sentry.ErrorBoundary>
    )
}
