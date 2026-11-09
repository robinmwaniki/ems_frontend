import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveApi } from '@/api/leave'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'
import type { LeaveStatus } from '@/types/api'

const statusVariant = (s: LeaveStatus) => {
    if (s === 'APPROVED') return 'success'
    if (s === 'REJECTED') return 'danger'
    if (s === 'CANCELLED') return 'neutral'
    return 'warning'
}

export default function LeavePage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)

    const { data, isLoading } = useQuery({
        queryKey: ['leave', page],
        queryFn: () => leaveApi.list(page, 10),
    })

    const approveMutation = useMutation({
        mutationFn: leaveApi.approve,
        onSuccess: () => {
            toast.success('Leave approved.')
            qc.invalidateQueries({ queryKey: ['leave'] })
        },
    })

    const rejectMutation = useMutation({
        mutationFn: leaveApi.reject,
        onSuccess: () => {
            toast.success('Leave rejected.')
            qc.invalidateQueries({ queryKey: ['leave'] })
        },
    })

    return (
        <div>
            <PageHeader
                title="Leave Requests"
                subtitle="Review and approve time-off requests."
            />
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : (
                    <Table
                        head={['Employee', 'Type', 'Start', 'End', 'Status', 'Actions']}
                        empty="No leave requests."
                    >
                        {data?.content.map((l) => (
                            <tr key={l.id}>
                                <Td>
                                    <span style={{ fontWeight: 600 }}>{l.employeeName}</span>
                                </Td>
                                <Td>{l.leaveType}</Td>
                                <Td>{l.startDate}</Td>
                                <Td>{l.endDate}</Td>
                                <Td>
                                    <Badge variant={statusVariant(l.status)}>
                                        {l.status}
                                    </Badge>
                                </Td>
                                <Td>
                                    {l.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '.4rem' }}>
                                            <Button
                                                size="sm"
                                                onClick={() => approveMutation.mutate(l.id)}
                                                disabled={approveMutation.isPending}
                                            >
                                                ✔ Approve
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => rejectMutation.mutate(l.id)}
                                                disabled={rejectMutation.isPending}
                                            >
                                                ✖ Reject
                                            </Button>
                                        </div>
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