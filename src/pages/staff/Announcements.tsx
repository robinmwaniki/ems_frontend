import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '@/api/announcements'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'

export default function AnnouncementsPage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        title: '',
        message: '',
        publishDate: '',
        expiryDate: '',
    })

    const { data, isLoading } = useQuery({
        queryKey: ['announcements', page],
        queryFn: () => announcementsApi.list(page, 10),
    })

    const createMutation = useMutation({
        mutationFn: announcementsApi.create,
        onSuccess: () => {
            toast.success('Announcement created.')
            qc.invalidateQueries({ queryKey: ['announcements'] })
            setShowForm(false)
            setForm({ title: '', message: '', publishDate: '', expiryDate: '' })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: announcementsApi.delete,
        onSuccess: () => {
            toast.success('Announcement deleted.')
            qc.invalidateQueries({ queryKey: ['announcements'] })
        },
    })

    const field = (key: keyof typeof form) => ({
        value: form[key],
        onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => setForm((f) => ({ ...f, [key]: e.target.value })),
    })

    const inputStyle = {
        padding: '.65rem .9rem',
        border: '1px solid var(--border)',
        borderRadius: 10,
        fontSize: '.9rem',
        width: '100%',
    }

    return (
        <div>
            <PageHeader
                title="Announcements"
                subtitle="Share news with the company."
                action={
                    <Button onClick={() => setShowForm(!showForm)}>
                        + New Announcement
                    </Button>
                }
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 500 }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                        New Announcement
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            createMutation.mutate(form)
                        }}
                        style={{ display: 'grid', gap: '.75rem' }}
                    >
                        <input required placeholder="Title" {...field('title')} style={inputStyle} />
                        <textarea
                            required
                            placeholder="Message"
                            rows={3}
                            {...field('message')}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                            <div>
                                <label style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                                    Publish Date
                                </label>
                                <input type="date" required {...field('publishDate')} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                                    Expiry Date
                                </label>
                                <input type="date" required {...field('expiryDate')} style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={createMutation.isPending}>
                                Save
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : (
                    <Table
                        head={['Title', 'Publish Date', 'Expiry Date', 'Actions']}
                        empty="No announcements."
                    >
                        {data?.content.map((a) => (
                            <tr key={a.id}>
                                <Td>
                                    <span style={{ fontWeight: 600 }}>{a.title}</span>
                                </Td>
                                <Td>{a.publishDate}</Td>
                                <Td>{a.expiryDate}</Td>
                                <Td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm('Delete this announcement?')) {
                                                deleteMutation.mutate(a.id)
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
            {data && (
                <Pager page={page} totalPages={data.totalPages} onPage={setPage} />
            )}
        </div>
    )
}