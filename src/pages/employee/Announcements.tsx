import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { employeeContentApi } from '@/api/employeeContent'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

export default function MyAnnouncementsPage() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['me-announcements'],
        queryFn: employeeContentApi.announcements,
    })

    return (
        <div>
            <PageHeader title="Company Announcements" subtitle="News and updates shared with employees." />
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading announcements…</p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load announcements.</p>
                        <button type="button" onClick={() => refetch()}>Try again</button>
                    </div>
                ) : !data?.length ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                        There are no active announcements at the moment.
                    </p>
                ) : (
                    <div>
                        {data.map((announcement) => (
                            <article key={announcement.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                                <h2 style={{ margin: '0 0 .55rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                                    {announcement.title}
                                </h2>
                                <p style={{ margin: '0 0 .85rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                                    {announcement.message}
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem 1rem', color: 'var(--muted)', fontSize: '.8rem' }}>
                                    <span>Published {announcement.publishDate ? format(new Date(announcement.publishDate), 'dd MMM yyyy') : 'recently'}</span>
                                    {announcement.expiryDate && <span>Until {format(new Date(announcement.expiryDate), 'dd MMM yyyy')}</span>}
                                    {announcement.publishDate && <span>{formatDistanceToNow(new Date(announcement.publishDate), { addSuffix: true })}</span>}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
