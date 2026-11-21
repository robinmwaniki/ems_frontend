import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import Button from '@/components/Button'
import styles from './Login.module.css'

interface LoginLocationState { from?: { pathname?: string } }

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { setAuth, clearAuth } = useAuthStore()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
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
            const { accessToken } = await authApi.login(username.trim(), password)
            sessionStorage.setItem('token', accessToken)
            const me = await authApi.me()
            setAuth(accessToken, me)
            if (from && from !== '/login') navigate(from, { replace: true })
            else if (me.role === 'ROLE_ADMIN' || me.role === 'ROLE_HR_MANAGER') navigate('/dashboard', { replace: true })
            else navigate('/employee/dashboard', { replace: true })
        } catch (err) {
            console.error('Login failed:', err)
            clearAuth()
            setError('Unable to sign in. Please check your username and password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className={styles.page}>
            <section className={styles.story} aria-label="Employee management platform">
                <div className={styles.orbit} aria-hidden="true"><div className={styles.orbitInner} /></div>
                <div className={styles.brand}><span className={styles.brandMark}>EMS</span><span>Workforce Management</span></div>
                <h2 className={styles.headline}>A clearer way to manage your people.</h2>
                <p className={styles.description}>One secure workspace for employee records, attendance, leave management and payroll.</p>
                <ul className={styles.features}>
                    <li><span className={styles.check}>✓</span>Employee records</li>
                    <li><span className={styles.check}>✓</span>Leave and attendance</li>
                    <li><span className={styles.check}>✓</span>Payroll and payslips</li>
                </ul>
            </section>
            <section className={styles.formSide}>
                <div className={styles.formCard}>
                    <p className={styles.eyebrow}>Secure workspace</p>
                    <h1 className={styles.title}>Welcome back</h1>
                    <p className={styles.subtitle}>Sign in with your account to continue.</p>
                    {error && <div className={styles.error} role="alert">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="username">Username</label>
                            <input id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required disabled={loading} />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.passwordInput}>
                                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required disabled={loading} />
                                <button
                                    className={styles.passwordToggle}
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                    disabled={loading}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className={styles.submit}>{loading ? 'Signing in…' : 'Sign in'}</Button>
                    </form>
                    <p className={styles.footer}>© 2026 Employee Management System</p>
                </div>
            </section>
        </main>
    )
}
