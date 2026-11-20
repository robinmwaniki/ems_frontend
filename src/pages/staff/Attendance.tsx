import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { attendanceApi } from '@/api/attendance'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import Button from '@/components/Button'

export default function AttendancePage() {
    const [page, setPage] = useState(0)
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['staff-attendance', page],
        queryFn: () => attendanceApi.list(page, 10),
    })

    const displayTime = (value: string | null) =>
        value ? value.replace('T', ' ').slice(0, 16) : '—'

    return (
        <div>
            <PageHeader title="Attendance" subtitle="Company attendance records." />
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
