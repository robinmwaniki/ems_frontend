import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meApi } from '@/api/me'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Pager from '@/components/Pager'

export default function MyAttendancePage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)

    const { data, isLoading } = useQuery({
        queryKey: ['me-attendance', page],
        queryFn: () => meApi.attendance(page),
    })

    const checkInMutation = useMutation({
        mutationFn: meApi.checkIn,
        onSuccess: () => {
            toast.success('Checked in.')
            qc.invalidateQueries({ queryKey: ['me-attendance'] })
        },
    })

    const checkOutMutation = useMutation({
        mutationFn: meApi.checkOut,
        onSuccess: () => {
            toast.success('Checked out.')
            qc.invalidateQueries({ queryKey: ['me-attendance'] })
        },
    })

    return (
        <div>
            <PageHeader
                title="My Attendance"
                subtitle="Your daily check-in and check-out records."
                action={
                    <div style={{ display: 'flex', gap: '.75rem' }}>
                        <Button
                            onClick={() => checkInMutation.mutate()}
                            disabled={checkInMutation.isPending}
                        >
                            Check In
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => checkOutMutation.mutate()}
                            disabled={checkOutMutation.isPending}
                        >
                            Check Out
                        </Button>
                    </div>
                }
            />
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : (
                    <Table
                        head={['Date', 'Check In', 'Check Out', 'Late', 'Overtime']}
                        empty="No attendance records."
                    >
                        {data?.content.map((a) => (
                            <tr key={a.id}>
                                <Td>
                                    <span style={{ fontWeight: 600 }}>{a.attendanceDate}</span>
                                </Td>
                                <Td>{a.checkInTime?.slice(11, 16) ?? '—'}</Td>
                                <Td>{a.checkOutTime?.slice(11, 16) ?? '—'}</Td>
                                <Td>
                                    {a.late ? (
                                        <span style={{ color: '#dc2626' }}>Late</span>
                                    ) : (
                                        <span style={{ color: '#16a34a' }}>On time</span>
                                    )}
                                </Td>
                                <Td>
                                    {a.overtime ? (
                                        <span style={{ color: '#d97706' }}>Overtime</span>
                                    ) : (
                                        '—'
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