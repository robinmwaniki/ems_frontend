
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import Button from '@/components/Button'

interface LoginLocationState {
    from?: {
        pathname?: string
    }
}

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { setAuth, clearAuth } = useAuthStore()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const locationState = location.state as LoginLocationState | null
    const from = locationState?.from?.pathname

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (loading) return

        setError('')
        setLoading(true)

        try {
            // Authenticate and retrieve the JWT.
            const { accessToken } = await authApi.login(
                username.trim(),
                password
            )

            // Store the token before requesting protected endpoints.
            sessionStorage.setItem('token', accessToken)

            // Retrieve the authenticated user's information.
            const me = await authApi.me()

            // Update the global authentication state.
            setAuth(accessToken, me)

            // Redirect according to the user's role.
            if (from && from !== '/login') {
                navigate(from, { replace: true })
            } else if (
                me.role === 'ROLE_ADMIN' ||
                me.role === 'ROLE_HR_MANAGER'
            ) {
                navigate('/dashboard', { replace: true })
            } else {
                navigate('/employee/dashboard', { replace: true })
            }
        } catch (err) {
            console.error('Login failed:', err)

            // Remove any partially stored authentication data.
            clearAuth()

            setError(
                'Unable to sign in. Please check your username and password.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr',
            }}
        >
            <div
                style={{
                    background:
                        'radial-gradient(circle at 20% 15%,rgba(165,180,252,.35),transparent 45%), linear-gradient(135deg,#1e1b4b,#4338ca 55%,#6366f1)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '2rem',
                    padding: '4rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.8rem',
                        fontSize: '1.35rem',
                        fontWeight: 700,
                    }}
                >
                    <span
                        style={{
                            width: 44,
                            height: 44,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,.18)',
                            fontSize: '1.3rem',
                        }}
                    >
                        👥
                    </span>

                    Employee Management System
                </div>

                <h2
                    style={{
                        fontSize: '2.4rem',
                        fontWeight: 700,
                        lineHeight: 1.2,
                        letterSpacing: '-.02em',
                        maxWidth: 460,
                    }}
                >
                    One place for your people, payroll and time off.
                </h2>

                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gap: '.9rem',
                        color: 'rgba(255,255,255,.85)',
                    }}
                >
                    <li>✅ Employees, departments and attendance</li>
                    <li>✅ Leave requests with quick approvals</li>
                    <li>✅ Payroll and printable payslips</li>
                </ul>
            </div>

            <div
                style={{
                    display: 'grid',
                    placeItems: 'center',
                    padding: '2rem',
                    background: '#f9fafb',
                }}
            >
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <h1
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            marginBottom: '.35rem',
                        }}
                    >
                        Welcome back
                    </h1>

                    <p
                        style={{
                            color: 'var(--muted)',
                            marginBottom: '1.75rem',
                        }}
                    >
                        Sign in to continue to your workspace.
                    </p>

                    {error && (
                        <div
                            role="alert"
                            style={{
                                background: '#fee2e2',
                                color: '#991b1b',
                                borderRadius: 12,
                                padding: '.9rem 1.1rem',
                                marginBottom: '1rem',
                                fontSize: '.9rem',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        style={{ display: 'grid', gap: '1rem' }}
                    >
                        <div>
                            <label
                                htmlFor="username"
                                style={{
                                    display: 'block',
                                    fontSize: '.85rem',
                                    fontWeight: 500,
                                    marginBottom: '.4rem',
                                }}
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                autoFocus
                                required
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '.75rem .95rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    fontSize: '1rem',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                style={{
                                    display: 'block',
                                    fontSize: '.85rem',
                                    fontWeight: 500,
                                    marginBottom: '.4rem',
                                }}
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '.75rem .95rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    fontSize: '1rem',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '.5rem',
                                width: '100%',
                                justifyContent: 'center',
                                padding: '.8rem',
                            }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>

                    <p
                        style={{
                            marginTop: '2rem',
                            textAlign: 'center',
                            color: '#9ca3af',
                            fontSize: '.8rem',
                        }}
                    >
                        © 2026 Employee Management System
                    </p>
                </div>
            </div>
        </div>
    )
}
