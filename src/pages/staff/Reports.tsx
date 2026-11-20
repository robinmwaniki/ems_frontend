import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports'
import type {
    Attendance,
    Employee,
    Leave,
    Payroll,
    PerformanceReview,
} from '@/types/api'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Table, { Td } from '@/components/Table'

type ReportType = 'employees' | 'payroll' | 'leave' | 'attendance' | 'performance'
type Cell = string | number | null

const reportLabels: Record<ReportType, string> = {
    employees: 'Employees',
    payroll: 'Payroll',
    leave: 'Leave',
    attendance: 'Attendance',
    performance: 'Performance',
}

export default function ReportsPage() {
    const [report, setReport] = useState<ReportType>('employees')
    const { data, isLoading, isError } = useQuery({
        queryKey: ['reports', report],
        queryFn: () => reportsApi[report](),
    })

    let headers: string[] = []
    let rows: Cell[][] = []

    switch (report) {
        case 'employees':
            headers = ['Employee', 'Email', 'Department', 'Salary']
            rows = ((data ?? []) as Employee[]).map((item) => [
                `${item.firstName} ${item.lastName}`,
                item.email,
                item.departmentName,
                item.salary,
            ])
            break
        case 'payroll':
            headers = ['Employee', 'Month', 'Basic salary', 'Net salary']
            rows = ((data ?? []) as Payroll[]).map((item) => [
                item.employeeName,
                item.payrollMonth,
                item.basicSalary,
                item.netSalary,
            ])
            break
        case 'leave':
            headers = ['Employee', 'Type', 'Start', 'End', 'Status']
            rows = ((data ?? []) as Leave[]).map((item) => [
                item.employeeName,
                item.leaveType,
                item.startDate,
                item.endDate,
                item.status,
            ])
            break
        case 'attendance':
            headers = ['Employee', 'Date', 'Check in', 'Check out', 'Status']
            rows = ((data ?? []) as Attendance[]).map((item) => [
                item.employeeName,
                item.attendanceDate,
                item.checkInTime ?? '—',
                item.checkOutTime ?? '—',
                item.status ?? (item.late ? 'LATE' : 'PRESENT'),
            ])
            break
        case 'performance':
            headers = ['Employee', 'Review date', 'Reviewer', 'Rating']
            rows = ((data ?? []) as PerformanceReview[]).map((item) => [
                item.employeeName,
                item.reviewDate,
                item.reviewer,
                item.rating,
            ])
            break
    }

    return (
        <div>
            <PageHeader title="Reports" subtitle="Operational reports from the EMS records." />
            <div style={{ marginBottom: '1rem', maxWidth: 280 }}>
                <label htmlFor="report-type" style={{ display: 'block', marginBottom: '.4rem', fontWeight: 600 }}>
                    Report category
                </label>
                <select
                    id="report-type"
                    value={report}
                    onChange={(event) => setReport(event.target.value as ReportType)}
                    style={{ width: '100%', padding: '.65rem .8rem', border: '1px solid var(--border)', borderRadius: 10 }}
                >
                    {(Object.keys(reportLabels) as ReportType[]).map((key) => (
                        <option key={key} value={key}>{reportLabels[key]}</option>
                    ))}
                </select>
            </div>
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading report…</p>
                ) : isError ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Unable to load this report.</p>
                ) : (
                    <Table head={headers} empty="No records found.">
                        {rows.map((row, index) => (
                            <tr key={index}>
                                {row.map((value, cellIndex) => <Td key={cellIndex}>{value ?? '—'}</Td>)}
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
        </div>
    )
}
