import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meApi } from '@/api/me'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'
import type { LeaveStatus, LeaveType } from '@/types/api'

const statusVariant = (s: LeaveStatus) => {
    if (s === 'APPROVED') return 'success'
    if (s === 'REJECTED') return 'danger'
    if (s === 'CANCELLED') return 'neutral'
    return 'warning'
}

const leaveTypes: LeaveType[] = [
    'ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'STUDY', 'UNPAID',
]

export default function MyLeavePage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        leaveType: 'ANNUAL' as LeaveType,
        startDate: '',
        endDate: '',
        reason: '',
    })

    const { data, isLoading } = useQuery({
        queryKey: ['me-leave', page],
        queryFn: () => meApi.leave(page),
    })

    const applyMutation = useMutation({
        mutationFn: meApi.applyLeave,
        onSuccess: () => {
            toast.success('Leave request submitted.')
            qc.invalidateQueries({ queryKey: ['me-leave'] })
            setShowForm(false)
            setForm({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })
        },
    })

    const cancelMutation = useMutation({
        mutationFn: meApi.cancelLeave,
        onSuccess: () => {
            toast.success('Leave cancelled.')
            qc.invalidateQueries({ queryKey: ['me-leave'] })
        },
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
                title="My Leave"
                subtitle="Apply for time off and track your requests."
                action={
                    <Button onClick={() => setShowForm(!showForm)}>
                        + Apply Leave
                    </Button>
                }
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 480 }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Apply for Leave</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            applyMutation.mutate(form)
                        }}
                        style={{ display: 'grid', gap: '.75rem' }}
                    >
                        <select
                            value={form.leaveType}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, leaveType: e.target.value as LeaveType }))
                            }
                            style={inputStyle}
                        >
                            {leaveTypes.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                            <div>
                                <label style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Start</label>
                                <input
                                    type="date"
                                    required
                                    value={form.startDate}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, startDate: e.target.value }))
                                    }
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '.8rem', color: 'var(--muted)' }}>End</label>
                                <input
                                    type="date"
                                    required
                                    value={form.endDate}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, endDate: e.target.value }))
                                    }
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <textarea
                            required
                            placeholder="Reason"
                            rows={2}
                            value={form.reason}
                            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={applyMutation.isPending}>
                                Submit
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
                        head={['Type', 'Start', 'End', 'Reason', 'Status', 'Action']}
                        empty="No leave requests."
                    >
                        {data?.content.map((l) => (
                            <tr key={l.id}>
                                <Td>
                                    <span style={{ fontWeight: 600 }}>{l.leaveType}</span>
                                </Td>
                                <Td>{l.startDate}</Td>
                                <Td>{l.endDate}</Td>
                                <Td>{l.reason}</Td>
                                <Td>
                                    <Badge variant={statusVariant(l.status)}>{l.status}</Badge>
                                </Td>
                                <Td>
                                    {l.status === 'PENDING' && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Cancel this request?')) {
                                                    cancelMutation.mutate(l.id)
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
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