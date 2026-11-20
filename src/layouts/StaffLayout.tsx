import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './Layout.module.css'

const nav = [
    { to:'/dashboard', icon:'▦', label:'Dashboard' },
    { to:'/employees', icon:'♙', label:'Employees' },
    { to:'/departments', icon:'▤', label:'Departments' },
    { to:'/leave', icon:'◷', label:'Leave' },
    { to:'/payroll', icon:'KSh', label:'Payroll' },
    { to:'/announcements', icon:'◉', label:'Announcements' },
    { to:'/attendance', icon:'◷', label:'Attendance' },
    { to:'/performance', icon:'↗', label:'Performance' },
    { to:'/reports', icon:'▥', label:'Reports' },
]
const adminNav = [
    { to:'/users', icon:'♧', label:'Users' },
    { to:'/system-logs', icon:'≡', label:'System Logs' },
]

export default function StaffLayout() {
    const { user, clearAuth, isAdmin } = useAuthStore()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const handleLogout = () => { clearAuth(); navigate('/login') }
    const closeMenu = () => setMenuOpen(false)

    return (
        <div className={styles.shell}>
            {menuOpen && <button className={styles.backdrop} aria-label="Close navigation" onClick={closeMenu} />}
            <aside className={[styles.sidebar, menuOpen ? styles.sidebarOpen : ''].join(' ')}>
                <div className={styles.brand}>
                    <span className={styles.brandMark}>EMS</span>
                    <span>Workforce</span>
                </div>
                <nav className={styles.nav} aria-label="Main navigation">
                    {nav.map((item) => (
                        <NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>
                            <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
                        </NavLink>
                    ))}
                    {isAdmin() && adminNav.map((item) => (
                        <NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>
                            <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <ThemeToggle />
                    <div className={styles.userChip}>
                        <span className={styles.avatar}>{user?.firstName?.charAt(0).toUpperCase() ?? user?.username?.charAt(0).toUpperCase() ?? 'U'}</span>
                        <span>{user?.username}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
                </div>
            </aside>
            <main className={styles.content}>
                <header className={styles.mobileHeader}>
                    <button className={styles.mobileMenuButton} onClick={() => setMenuOpen(true)} aria-label="Open navigation">☰</button>
                    <span className={styles.mobileBrand}>EMS Workforce</span>
                    <ThemeToggle />
                </header>
                <Outlet />
            </main>
        </div>
    )
}
