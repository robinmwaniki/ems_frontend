import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { notificationsApi } from '@/api/notifications'
import type { Notification } from '@/types/api'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import toast from 'react-hot-toast'

export default function StaffNotificationsPage() {
    const queryClient = useQueryClient()

    const { data, isLoading, isError, refetch } = useQuery<Notification[]>({
        queryKey: ['staff-notifications'],
        queryFn: notificationsApi.list,
    })

    const markReadMutation = useMutation({
        mutationFn: notificationsApi.markRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-notifications'] })
        },
        onError: () => toast.error('Could not mark notification as read.'),
    })

    const markAllMutation = useMutation({
        mutationFn: notificationsApi.markAllRead,
        onSuccess: () => {
            toast.success('All notifications marked as read.')
            queryClient.invalidateQueries({ queryKey: ['staff-notifications'] })
        },
        onError: () => toast.error('Could not update notifications.'),
    })

    const unreadCount = data?.filter((notification) => !notification.read).length ?? 0

    return (
        <div>
            <PageHeader
                title="Notifications"
                subtitle={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
                action={
                    <Button
                        variant="secondary"
                        onClick={() => markAllMutation.mutate()}
                        disabled={!unreadCount || markAllMutation.isPending}
                    >
                        {markAllMutation.isPending ? 'Updating…' : 'Mark All Read'}
                    </Button>
                }
            />

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                        Loading notifications…
                    </p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load notifications.</p>
                        <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
                    </div>
                ) : !data?.length ? (
                    <p style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--muted)' }}>
                        You’re all caught up. No notifications yet.
                    </p>
                ) : (
                    data.map((notification) => (
                        <article
                            key={notification.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                padding: '1.1rem 1.35rem',
                                borderBottom: '1px solid var(--border)',
                                background: notification.read ? 'transparent' : 'var(--surface-subtle, var(--surface))',
                                boxShadow: notification.read ? 'none' : 'inset 3px 0 0 var(--brand)',
                            }}
                        >
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '.5rem',
                                    marginBottom: '.3rem',
                                    fontWeight: 650,
                                    color: 'var(--text)',
                                }}>
                                    <span>{notification.title}</span>
                                    {!notification.read && (
                                        <span style={{
                                            borderRadius: 999,
                                            padding: '.15rem .55rem',
                                            background: 'var(--brand-soft, var(--surface))',
                                            color: 'var(--brand)',
                                            fontSize: '.7rem',
                                            fontWeight: 700,
                                        }}>NEW</span>
                                    )}
                                </div>
                                <p style={{ margin: '0 0 .4rem', color: 'var(--text)', fontSize: '.9rem', lineHeight: 1.55 }}>
                                    {notification.message}
                                </p>
                                <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            {!notification.read && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markReadMutation.mutate(notification.id)}
                                    disabled={markReadMutation.isPending}
                                >
                                    Mark Read
                                </Button>
                            )}
                        </article>
                    ))
                )}
            </Card>
        </div>
    )
}
