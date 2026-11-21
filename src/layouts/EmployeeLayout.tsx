import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './Layout.module.css'

const nav = [
    { to:'/employee/dashboard', icon:'▦', label:'Dashboard' },
    { to:'/employee/profile', icon:'♙', label:'My Profile' },
    { to:'/employee/leave', icon:'◷', label:'My Leave' },
    { to:'/employee/attendance', icon:'◷', label:'Attendance' },
    { to:'/employee/payroll', icon:'KSh', label:'My Payroll' },
    { to:'/employee/notifications', icon:'◉', label:'Notifications' },
    { to:'/employee/announcements', icon:'▤', label:'Announcements' },
    { to:'/employee/performance', icon:'★', label:'My Performance' },
    { to:'/employee/change-password', icon:'⌑', label:'Change Password' },
]

export default function EmployeeLayout() {
    const { user, clearAuth } = useAuthStore()
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
                    <span>My Workspace</span>
                </div>
                <nav className={styles.nav} aria-label="Employee navigation">
                    {nav.map((item) => (
                        <NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>
                            <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <ThemeToggle />
                    <div className={styles.userChip}>
                        <span className={styles.avatar}>{user?.firstName?.charAt(0).toUpperCase() ?? user?.username?.charAt(0).toUpperCase() ?? 'U'}</span>
                        <span>{user?.firstName ?? user?.username}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
                </div>
            </aside>
            <main className={styles.content}>
                <header className={styles.mobileHeader}>
                    <button className={styles.mobileMenuButton} onClick={() => setMenuOpen(true)} aria-label="Open navigation">☰</button>
                    <span className={styles.mobileBrand}>EMS Workspace</span>
                    <ThemeToggle />
                </header>
                <Outlet />
            </main>
        </div>
    )
}
