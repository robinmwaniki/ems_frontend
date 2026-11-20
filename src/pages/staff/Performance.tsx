import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { performanceApi } from '@/api/performance'
import { employeesApi } from '@/api/employees'
import type { PerformanceReview } from '@/types/api'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import Button from '@/components/Button'
import toast from 'react-hot-toast'

interface ReviewForm {
    employeeId: string
    reviewDate: string
    reviewer: string
    rating: string
    comments: string
    goals: string
}

const emptyForm: ReviewForm = {
    employeeId: '',
    reviewDate: '',
    reviewer: '',
    rating: '3',
    comments: '',
    goals: '',
}

const inputStyle = {
    padding: '.65rem .9rem',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: '.9rem',
    width: '100%',
}

export default function PerformancePage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<ReviewForm>(emptyForm)

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['performance-reviews', page],
        queryFn: () => performanceApi.list(page, 10),
    })

    const { data: employeesData } = useQuery({
        queryKey: ['employees', 'performance-options'],
        queryFn: () => employeesApi.list(0, 100),
    })

    const toRequest = (values: ReviewForm) => ({
        employeeId: Number(values.employeeId),
        reviewDate: values.reviewDate,
        reviewer: values.reviewer.trim(),
        rating: Number(values.rating),
        comments: values.comments.trim(),
        goals: values.goals.trim(),
    })

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(false)
    }

    const saveMutation = useMutation({
        mutationFn: ({ id, values }: { id: number | null; values: ReviewForm }) => {
            const request = toRequest(values)
            return id === null ? performanceApi.create(request) : performanceApi.update(id, request)
        },
        onSuccess: async () => {
            toast.success(editingId === null ? 'Performance review created.' : 'Performance review updated.')
            await qc.invalidateQueries({ queryKey: ['performance-reviews'] })
            resetForm()
        },
        onError: () => toast.error('Unable to save performance review. Check the entered details.'),
    })

    const deleteMutation = useMutation({
        mutationFn: performanceApi.delete,
        onSuccess: async () => {
            toast.success('Performance review deleted.')
            await qc.invalidateQueries({ queryKey: ['performance-reviews'] })
        },
        onError: () => toast.error('Unable to delete performance review.'),
    })

    const startEdit = (review: PerformanceReview) => {
        setEditingId(review.id)
        setForm({
            employeeId: String(review.employeeId),
            reviewDate: review.reviewDate,
            reviewer: review.reviewer,
            rating: String(review.rating),
            comments: review.comments ?? '',
            goals: review.goals ?? '',
        })
        setShowForm(true)
    }

    return (
        <div>
            <PageHeader
                title="Performance"
                subtitle="Create, edit and maintain employee performance reviews."
                action={<Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((visible) => !visible) }}>+ New Review</Button>}
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                        {editingId === null ? 'New Performance Review' : 'Edit Performance Review'}
                    </h3>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            saveMutation.mutate({ id: editingId, values: form })
                        }}
                        style={{ display: 'grid', gap: '.8rem' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.75rem' }}>
                            <label>
                                <span>Employee</span>
                                <select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} style={inputStyle}>
                                    <option value="">Select employee</option>
                                    {employeesData?.content.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.firstName} {employee.lastName} — {employee.email}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>Review date</span>
                                <input required type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Reviewer</span>
                                <input required value={form.reviewer} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Rating (1–5)</span>
                                <select required value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={inputStyle}>
                                    <option value="1">1 — Needs improvement</option>
                                    <option value="2">2 — Below expectations</option>
                                    <option value="3">3 — Meets expectations</option>
                                    <option value="4">4 — Exceeds expectations</option>
                                    <option value="5">5 — Outstanding</option>
                                </select>
                            </label>
                        </div>
                        <label>
                            <span>Comments</span>
                            <textarea rows={3} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
                        </label>
                        <label>
                            <span>Goals</span>
                            <textarea rows={3} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
                        </label>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={saveMutation.isPending || !employeesData?.content.length}>
                                {saveMutation.isPending ? 'Saving…' : 'Save Review'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading reviews…</p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load performance reviews.</p>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                ) : (
                    <Table
                        head={['Employee', 'Review date', 'Reviewer', 'Rating', 'Comments', 'Goals', 'Actions']}
                        empty="No performance reviews."
                    >
                        {data?.content.map((review) => (
                            <tr key={review.id}>
                                <Td>{review.employeeName}</Td>
                                <Td>{review.reviewDate}</Td>
                                <Td>{review.reviewer}</Td>
                                <Td>{review.rating}/5</Td>
                                <Td>{review.comments || '—'}</Td>
                                <Td>{review.goals || '—'}</Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                                        <Button variant="ghost" size="sm" onClick={() => startEdit(review)}>Edit</Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => {
                                                if (window.confirm(`Delete performance review for ${review.employeeName}?`)) {
                                                    deleteMutation.mutate(review.id)
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
