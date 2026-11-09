import { useQuery } from '@tanstack/react-query'
import { meApi } from '@/api/me'
import { useAuthStore } from '@/store/auth'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

export default function EmployeeDashboard() {
    const { user } = useAuthStore()

    const { data: leave } = useQuery({
        queryKey: ['me-leave'],
        queryFn: () => meApi.leave(0, 5),
    })

    const { data: unread } = useQuery({
        queryKey: ['me-unread'],
        queryFn: meApi.unreadCount,
    })

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.firstName ?? user?.username} 👋`}
                subtitle="Here's what's going on today."
            />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}
            >
                <Card style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '.5rem' }}>
                        Unread Notifications
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{unread ?? 0}</p>
                </Card>
                <Card style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '.5rem' }}>
                        Pending Leave Requests
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {leave?.content.filter((l) => l.status === 'PENDING').length ?? 0}
                    </p>
                </Card>
            </div>
        </div>
    )
}