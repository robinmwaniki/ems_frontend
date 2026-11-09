import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <Card style={{ padding: '1.5rem' }}>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '.5rem' }}>
                {label}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</p>
        </Card>
    )
}

export default function AdminDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: dashboardApi.stats,
    })

    if (isLoading) return <p>Loading…</p>
    if (!data) return null

    const fmt = (n: number) =>
        new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            maximumFractionDigits: 0,
        }).format(n)

    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle="Company overview"
            />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
                    gap: '1rem',
                }}
            >
                <Stat label="Total Employees" value={data.totalEmployees} />
                <Stat label="Departments" value={data.totalDepartments} />
                <Stat label="Hired This Month" value={data.employeesHiredThisMonth} />
                <Stat label="Total Payroll" value={fmt(data.totalPayroll)} />
                <Stat label="Highest Salary" value={fmt(data.highestSalary)} />
                <Stat label="Average Salary" value={fmt(data.averageSalary)} />
            </div>
        </div>
    )
}