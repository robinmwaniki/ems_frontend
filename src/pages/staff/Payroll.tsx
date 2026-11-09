import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { payrollApi } from '@/api/payroll'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'

export default function PayrollPage() {
    const [page, setPage] = useState(0)

    const { data, isLoading } = useQuery({
        queryKey: ['payroll', page],
        queryFn: () => payrollApi.list(page, 10),
    })

    const fmt = (n: number) =>
        new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(n)

    return (
        <div>
            <PageHeader
                title="Payroll"
                subtitle="Monthly payroll records."
            />
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : (
                    <Table
                        head={['Employee', 'Month', 'Basic', 'Net Salary', 'Payslip']}
                        empty="No payroll records."
                    >
                        {data?.content.map((p) => (
                            <tr key={p.id}>
                                <Td>
                                    <span style={{ fontWeight: 600 }}>{p.employeeName}</span>
                                </Td>
                                <Td>{p.payrollMonth}</Td>
                                <Td>{fmt(p.basicSalary)}</Td>
                                <Td>
                  <span style={{ fontWeight: 600, color: '#166534' }}>
                    {fmt(p.netSalary)}
                  </span>
                                </Td>
                                <Td>
                                    <a
                                        href={payrollApi.payslipUrl(p.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Button size="sm" variant="ghost">
                                            PDF
                                        </Button>
                                    </a>
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