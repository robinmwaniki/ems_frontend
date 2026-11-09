import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'


const nav = [
    { to: '/employee/dashboard', icon: '⚡', label: 'Dashboard' },
    { to: '/employee/profile', icon: '👤', label: 'My Profile' },
    { to: '/employee/leave', icon: '✈️', label: 'My Leave' },
    { to: '/employee/attendance', icon: '🕐', label: 'Attendance' },
    { to: '/employee/payroll', icon: '💰', label: 'My Payroll' },
    { to: '/employee/notifications', icon: '🔔', label: 'Notifications' },
    { to: '/employee/change-password', icon: '🔒', label: 'Change Password' },
]

export default function EmployeeLayout() {
    const { user, clearAuth } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'var(--sidebar-w) 1fr',
                minHeight: '100vh',
            }}
        >
            <aside
                style={{
                    background: 'linear-gradient(180deg,#0f172a,#111c36)',
                    color: '#cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem .75rem',
                    gap: '.25rem',
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    width: 'var(--sidebar-w)',
                    overflowY: 'auto',
                }}
            >
                <div
                    style={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.75rem',
                        padding: '.5rem .85rem 1.25rem',
                    }}
                >
          <span
              style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#6366f1,#4338ca)',
                  display: 'grid',
                  placeItems: 'center',
              }}
          >
            👥
          </span>
                    EMS
                </div>

                {nav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '.8rem',
                            padding: '.65rem .85rem',
                            borderRadius: 10,
                            color: isActive ? '#fff' : '#cbd5e1',
                            background: isActive
                                ? 'rgba(99,102,241,.24)'
                                : 'transparent',
                            fontSize: '.9rem',
                            fontWeight: 500,
                            transition: 'background .15s',
                        })}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1rem' }}>
                    <div style={{ color: '#fff', padding: '.5rem .85rem', fontSize: '.9rem' }}>
                        {user?.firstName ?? user?.username}
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '.65rem .85rem',
                            borderRadius: 10,
                            border: 0,
                            background: 'none',
                            color: '#fca5a5',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '.9rem',
                        }}
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            <main style={{ marginLeft: 'var(--sidebar-w)', padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    )
}