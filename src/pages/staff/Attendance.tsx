import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '@/api/attendance'
import { employeesApi } from '@/api/employees'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import Button from '@/components/Button'
import toast from 'react-hot-toast'

const inputStyle = {
    padding: '.65rem .9rem',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: '.9rem',
}

export default function AttendancePage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)
    const [employeeId, setEmployeeId] = useState('')

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['staff-attendance', page],
        queryFn: () => attendanceApi.list(page, 10),
    })

    const { data: employeesData } = useQuery({
        queryKey: ['employees', 'attendance-options'],
        queryFn: () => employeesApi.list(0, 100),
    })

    const checkInMutation = useMutation({
        mutationFn: () => attendanceApi.checkIn(Number(employeeId)),
        onSuccess: async () => {
            toast.success('Employee checked in.')
            await qc.invalidateQueries({ queryKey: ['staff-attendance'] })
        },
        onError: () => toast.error('Unable to check in. The employee may already have an attendance record for today.'),
    })

    const checkOutMutation = useMutation({
        mutationFn: () => attendanceApi.checkOut(Number(employeeId)),
        onSuccess: async () => {
            toast.success('Employee checked out.')
            await qc.invalidateQueries({ queryKey: ['staff-attendance'] })
        },
        onError: () => toast.error('Unable to check out. Confirm the employee has an open attendance record.'),
    })

    const displayTime = (value: string | null) =>
        value ? value.replace('T', ' ').slice(0, 16) : '—'

    return (
        <div>
            <PageHeader title="Attendance" subtitle="Record employee check-ins and check-outs." />
            <Card style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'end' }}>
                    <label style={{ display: 'grid', gap: '.35rem', minWidth: 260 }}>
                        <span style={{ fontSize: '.85rem', fontWeight: 600 }}>Employee</span>
                        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={inputStyle}>
                            <option value="">Select employee</option>
                            {employeesData?.content.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.lastName} — {employee.email}
                                </option>
                            ))}
                        </select>
                    </label>
                    <Button
                        disabled={!employeeId || checkInMutation.isPending || checkOutMutation.isPending}
                        onClick={() => checkInMutation.mutate()}
                    >
                        {checkInMutation.isPending ? 'Checking in…' : 'Check In'}
                    </Button>
                    <Button
                        variant="secondary"
                        disabled={!employeeId || checkInMutation.isPending || checkOutMutation.isPending}
                        onClick={() => checkOutMutation.mutate()}
                    >
                        {checkOutMutation.isPending ? 'Checking out…' : 'Check Out'}
                    </Button>
                </div>
            </Card>
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading attendance…</p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load attendance records.</p>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                ) : (
                    <Table
                        head={['Employee', 'Date', 'Check in', 'Check out', 'Hours', 'Status']}
                        empty="No attendance records."
                    >
                        {data?.content.map((record) => (
                            <tr key={record.id}>
                                <Td>{record.employeeName}</Td>
                                <Td>{record.attendanceDate}</Td>
                                <Td>{displayTime(record.checkInTime)}</Td>
                                <Td>{displayTime(record.checkOutTime)}</Td>
                                <Td>{record.workingHours ?? '—'}</Td>
                                <Td>{record.status ?? (record.late ? 'LATE' : record.checkOutTime ? 'PRESENT' : 'CHECKED_IN')}</Td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
            {data && <Pager page={page} totalPages={data.totalPages} onPage={setPage} />}
        </div>
    )
}
