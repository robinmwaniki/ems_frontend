import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '@/api/announcements'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'

interface AnnouncementForm {
    title: string
    message: string
    publishDate: string
    expiryDate: string
}

const emptyForm: AnnouncementForm = {
    title: '',
    message: '',
    publishDate: '',
    expiryDate: '',
}

const inputStyle = {
    padding: '.65rem .9rem',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: '.9rem',
    width: '100%',
}

export default function AnnouncementsPage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<AnnouncementForm>(emptyForm)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['announcements', page],
        queryFn: () => announcementsApi.list(page, 10),
    })

    const saveMutation = useMutation({
        mutationFn: (values: AnnouncementForm & { id: number | null }) => {
            const payload = {
                title: values.title.trim(),
                message: values.message.trim(),
                publishDate: values.publishDate,
                expiryDate: values.expiryDate,
            }
            return values.id === null
                ? announcementsApi.create(payload)
                : announcementsApi.update(values.id, payload)
        },
        onSuccess: async () => {
            toast.success(editingId === null ? 'Announcement created.' : 'Announcement updated.')
            await qc.invalidateQueries({ queryKey: ['announcements'] })
            setShowForm(false)
            setEditingId(null)
            setForm(emptyForm)
        },
        onError: () => toast.error('Unable to save announcement. Check the entered details.'),
    })

    const deleteMutation = useMutation({
        mutationFn: announcementsApi.delete,
        onSuccess: async () => {
            toast.success('Announcement deleted.')
            await qc.invalidateQueries({ queryKey: ['announcements'] })
        },
        onError: () => toast.error('Unable to delete announcement.'),
    })

    const startCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setShowForm((visible) => !visible)
    }

    const startEdit = (announcement: NonNullable<typeof data>['content'][number]) => {
        setEditingId(announcement.id)
        setForm({
            title: announcement.title,
            message: announcement.message,
            publishDate: announcement.publishDate,
            expiryDate: announcement.expiryDate,
        })
        setShowForm(true)
    }

    const field = (key: keyof AnnouncementForm) => ({
        value: form[key],
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((current) => ({ ...current, [key]: event.target.value })),
    })

    return (
        <div>
            <PageHeader
                title="Announcements"
                subtitle="Create, edit and share company news."
                action={<Button onClick={startCreate}>+ New Announcement</Button>}
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 560 }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                        {editingId === null ? 'New Announcement' : 'Edit Announcement'}
                    </h3>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            saveMutation.mutate({ ...form, id: editingId })
                        }}
                        style={{ display: 'grid', gap: '.75rem' }}
                    >
                        <input required placeholder="Title" {...field('title')} style={inputStyle} />
                        <textarea required placeholder="Message" rows={4} {...field('message')} style={{ ...inputStyle, resize: 'vertical' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                            <label>
                                <span>Publish date</span>
                                <input type="date" required {...field('publishDate')} style={inputStyle} />
                            </label>
                            <label>
                                <span>Expiry date</span>
                                <input type="date" required {...field('expiryDate')} style={inputStyle} />
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? 'Saving…' : 'Save'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : isError ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Unable to load announcements.</p>
                ) : (
                    <Table head={['Title', 'Publish Date', 'Expiry Date', 'Actions']} empty="No announcements.">
                        {data?.content.map((announcement) => (
                            <tr key={announcement.id}>
                                <Td><span style={{ fontWeight: 600 }}>{announcement.title}</span></Td>
                                <Td>{announcement.publishDate}</Td>
                                <Td>{announcement.expiryDate}</Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '.4rem' }}>
                                        <Button variant="ghost" size="sm" onClick={() => startEdit(announcement)}>Edit</Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => {
                                                if (window.confirm('Delete this announcement?')) {
                                                    deleteMutation.mutate(announcement.id)
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
            {data && <Pager page={page} totalPages={data.totalPages} onPage={setPage} />}
        </div>
    )
}
