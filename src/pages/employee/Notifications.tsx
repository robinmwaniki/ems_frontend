import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meApi } from '@/api/me'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function MyNotificationsPage() {
    const qc = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['me-notifications'],
        queryFn: meApi.notifications,
    })

    const markReadMutation = useMutation({
        mutationFn: meApi.markRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['me-notifications'] })
            qc.invalidateQueries({ queryKey: ['me-unread'] })
        },
    })

    const markAllMutation = useMutation({
        mutationFn: meApi.markAllRead,
        onSuccess: () => {
            toast.success('All marked as read.')
            qc.invalidateQueries({ queryKey: ['me-notifications'] })
            qc.invalidateQueries({ queryKey: ['me-unread'] })
        },
    })

    return (
        <div>
            <PageHeader
                title="Notifications"
                subtitle={`${data?.filter((n) => !n.read).length ?? 0} unread`}
                action={
                    <Button
                        variant="secondary"
                        onClick={() => markAllMutation.mutate()}
                        disabled={markAllMutation.isPending}
                    >
                        Mark All Read
                    </Button>
                }
            />

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : !data?.length ? (
                    <p
                        style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'var(--muted)',
                        }}
                    >
                        No notifications.
                    </p>
                ) : (
                    data.map((n) => (
                        <div
                            key={n.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                padding: '1.1rem 1.35rem',
                                borderBottom: '1px solid var(--border)',
                                background: n.read ? 'transparent' : '#f5f7ff',
                                boxShadow: n.read
                                    ? 'none'
                                    : 'inset 3px 0 0 var(--brand)',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        marginBottom: '.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '.5rem',
                                    }}
                                >
                                    {n.title}
                                    {!n.read && (
                                        <span
                                            style={{
                                                background: '#ef4444',
                                                color: '#fff',
                                                borderRadius: 999,
                                                padding: '.15em .6em',
                                                fontSize: '.72rem',
                                                fontWeight: 700,
                                            }}
                                        >
                      New
                    </span>
                                    )}
                                </div>
                                <p style={{ margin: '0 0 .2rem', fontSize: '.9rem' }}>
                                    {n.message}
                                </p>
                                <span style={{ color: 'var(--muted)', fontSize: '.8rem' }}>
                  {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                  })}
                </span>
                            </div>
                            {!n.read && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markReadMutation.mutate(n.id)}
                                    disabled={markReadMutation.isPending}
                                >
                                    Mark Read
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </Card>
        </div>
    )
}