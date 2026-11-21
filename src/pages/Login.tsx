import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { DEMO_CONFIG_ERROR, DEMO_MODE } from '@/config/demo'
import type { Role } from '@/types/api'
import Button from '@/components/Button'
import styles from './Login.module.css'

interface LoginLocationState { from?: { pathname?: string } }

const demoRoles: { role: Role; label: string; description: string }[] = [
    { role: 'ROLE_ADMIN', label: 'Administrator', description: 'Workforce overview and system administration' },
    { role: 'ROLE_HR_MANAGER', label: 'HR Manager', description: 'Employee records, leave and attendance' },
    { role: 'ROLE_EMPLOYEE', label: 'Employee', description: 'Personal dashboard, attendance and payslips' },
]

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { setAuth, clearAuth } = useAuthStore()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [demoLoading, setDemoLoading] = useState<Role | null>(null)
    const [error, setError] = useState('')
    const locationState = location.state as LoginLocationState | null
    const from = locationState?.from?.pathname

    const navigateForRole = (role: Role) => {
        if (from && from !== '/login') navigate(from, { replace: true })
        else if (role === 'ROLE_ADMIN' || role === 'ROLE_HR_MANAGER') navigate('/dashboard', { replace: true })
        else navigate('/employee/dashboard', { replace: true })
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loading || demoLoading) return
        setError('')
        setLoading(true)
        try {
            const { accessToken } = await authApi.login(username.trim(), password)
            sessionStorage.setItem('token', accessToken)
            const me = await authApi.me()
            setAuth(accessToken, me)
            navigateForRole(me.role)
        } catch (err) {
            console.error('Login failed:', err)
            clearAuth()
            setError('Unable to sign in. Please check your username and password.')
        } finally {
            setLoading(false)
        }
    }

    const handleDemoLogin = async (role: Role) => {
        if (loading || demoLoading) return
        setError('')
        if (DEMO_CONFIG_ERROR) {
            setError('The demo is not configured correctly. Please try again later.')
            return
        }

        setDemoLoading(role)
        clearAuth()
        try {
            const { accessToken } = await authApi.demoLogin(role)
            sessionStorage.setItem('token', accessToken)
            const me = await authApi.me()
            if (me.role !== role) {
                throw new Error('The demo account returned an unexpected role.')
            }
            setAuth(accessToken, me)
            navigateForRole(me.role)
        } catch (err) {
            console.error('Demo sign-in failed:', err)
            clearAuth()
            setError('The demo environment is temporarily unavailable. Please try again shortly.')
        } finally {
            setDemoLoading(null)
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
                            <input id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required disabled={loading || demoLoading !== null} />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.passwordInput}>
                                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required disabled={loading || demoLoading !== null} />
                                <button
                                    className={styles.passwordToggle}
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                    disabled={loading || demoLoading !== null}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" disabled={loading || demoLoading !== null} className={styles.submit}>{loading ? 'Signing in…' : 'Sign in'}</Button>
                    </form>
                    {DEMO_MODE && (
                        <section className={styles.demoSection} aria-labelledby="demo-title">
                            <div className={styles.demoDivider}><span>OR</span></div>
                            <div className={styles.demoIntro}>
                                <div>
                                    <p className={styles.demoEyebrow}>Try EMS without an account</p>
                                    <h2 id="demo-title">Explore the demo</h2>
                                </div>
                                <span className={styles.demoPill}>SANDBOX</span>
                            </div>
                            <p className={styles.demoDescription}>Choose a role to explore a sample workspace. Demo data is synthetic and changes are restricted.</p>
                            {DEMO_CONFIG_ERROR && <p className={styles.demoUnavailable} role="status">Demo access is not configured on this deployment.</p>}
                            <div className={styles.demoRoles}>
                                {demoRoles.map((item) => (
                                    <button
                                        key={item.role}
                                        type="button"
                                        className={styles.demoRole}
                                        onClick={() => handleDemoLogin(item.role)}
                                        disabled={loading || demoLoading !== null || Boolean(DEMO_CONFIG_ERROR)}
                                    >
                                        <span className={styles.demoRoleCopy}>
                                            <strong>{item.label}</strong>
                                            <small>{item.description}</small>
                                        </span>
                                        <span className={styles.demoArrow} aria-hidden="true">{demoLoading === item.role ? '…' : '→'}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                    <p className={styles.footer}>© 2026 Employee Management System</p>
                </div>
            </section>
        </main>
    )
}
