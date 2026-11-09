
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import type { Role } from '@/types/api'

interface Props {
    children: ReactNode
    allowedRoles: Role[]
}

export default function RequireAuth({
                                        children,
                                        allowedRoles,
                                    }: Props) {
    const token = useAuthStore((state) => state.token)
    const user = useAuthStore((state) => state.user)
    const location = useLocation()

    if (!token) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        )
    }

    // Wait for the authenticated user to be loaded.
    if (!user) {
        return (
            <div
                style={{
                    minHeight: '50vh',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                Loading your account...
            </div>
        )
    }

    if (!allowedRoles.includes(user.role)) {
        const redirect =
            user.role === 'ROLE_EMPLOYEE'
                ? '/employee/dashboard'
                : '/dashboard'

        return <Navigate to={redirect} replace />
    }

    return <>{children}</>
}
