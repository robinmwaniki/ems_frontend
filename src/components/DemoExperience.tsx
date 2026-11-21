import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { DEMO_MODE } from '@/config/demo'
import { useAuthStore } from '@/store/auth'
import styles from './DemoExperience.module.css'

const staffTour = [
    { to: '/dashboard', label: 'Dashboard', detail: 'Workforce overview and key metrics' },
    { to: '/employees', label: 'Employee records', detail: 'Browse the synthetic employee directory' },
    { to: '/attendance', label: 'Attendance', detail: 'Review attendance records' },
    { to: '/leave', label: 'Leave management', detail: 'Review leave requests and balances' },
    { to: '/payroll', label: 'Payroll and payslips', detail: 'Explore payroll summaries and payslip documents' },
]

const employeeTour = [
    { to: '/employee/dashboard', label: 'My dashboard', detail: 'Your employee self-service overview' },
    { to: '/employee/profile', label: 'My profile', detail: 'Review your profile information' },
    { to: '/employee/attendance', label: 'My attendance', detail: 'Review your attendance history' },
    { to: '/employee/leave', label: 'My leave', detail: 'Explore your leave information' },
    { to: '/employee/payroll', label: 'My payslips', detail: 'View payroll details and available payslips' },
]

export default function DemoExperience() {
    const [guideOpen, setGuideOpen] = useState(false)
    const user = useAuthStore((state) => state.user)

    if (!DEMO_MODE) return null

    const isEmployee = user?.role === 'ROLE_EMPLOYEE'
    const tour = isEmployee ? employeeTour : staffTour

    return (
        <aside className={styles.wrapper} aria-label="Demo environment notice">
            <div className={styles.banner}>
                <span className={styles.demoTag}>DEMO</span>
                <span className={styles.bannerText}>
                    You're exploring a sandbox with synthetic data. Changes are restricted and are not saved.
                </span>
                {user && (
                    <button
                        type="button"
                        className={styles.guideButton}
                        aria-expanded={guideOpen}
                        aria-controls="demo-guide"
                        onClick={() => setGuideOpen((open) => !open)}
                    >
                        {guideOpen ? 'Close guide' : 'Guided tour'}
                    </button>
                )}
            </div>
            {guideOpen && user && (
                <nav id="demo-guide" className={styles.guide} aria-label="Demo guided tour">
                    <div className={styles.guideHeading}>
                        <div>
                            <strong>Explore EMS</strong>
                            <p>Choose a section to see how the workspace fits together.</p>
                        </div>
                        <span className={styles.role}>{isEmployee ? 'Employee' : user.role === 'ROLE_ADMIN' ? 'Administrator' : 'HR Manager'}</span>
                    </div>
                    <div className={styles.links}>
                        {tour.map((item, index) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setGuideOpen(false)}
                                className={({ isActive }) => [styles.tourLink, isActive ? styles.active : ''].join(' ')}
                            >
                                <span className={styles.step}>{index + 1}</span>
                                <span className={styles.linkCopy}>
                                    <strong>{item.label}</strong>
                                    <small>{item.detail}</small>
                                </span>
                                <span aria-hidden="true" className={styles.arrow}>→</span>
                            </NavLink>
                        ))}
                    </div>
                    <p className={styles.guideFootnote}>For safety, this public demo is read-only. Never enter real employee or payroll information.</p>
                </nav>
            )}
        </aside>
    )
}
