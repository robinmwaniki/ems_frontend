import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import styles from './Layout.module.css'

const nav = [
    { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
    { to: '/employees', icon: '👥', label: 'Employees' },
    { to: '/departments', icon: '🏢', label: 'Departments' },
    { to: '/leave', icon: '✈️', label: 'Leave' },
    { to: '/payroll', icon: '💰', label: 'Payroll' },
    { to: '/announcements', icon: '📣', label: 'Announcements' },
]

const adminNav = [
    { to: '/users', icon: '🔐', label: 'Users' },
]

export default function StaffLayout() {
    const { user, clearAuth, isAdmin } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    return (
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <span className={styles.brandMark}>👥</span>
                    <span>EMS</span>
                </div>

                <nav className={styles.nav}>
                    {nav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive ? styles.active : ''}`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    {isAdmin() &&
                        adminNav.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `${styles.navLink} ${isActive ? styles.active : ''}`
                                }
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userChip}>
            <span className={styles.avatar}>
              {user?.firstName?.charAt(0).toUpperCase() ??
                  user?.username?.charAt(0).toUpperCase() ??
                  'U'}
            </span>
                        <span>{user?.username}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            </aside>

            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    )
}