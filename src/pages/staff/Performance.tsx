import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { performanceApi } from '@/api/performance'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import Button from '@/components/Button'

export default function PerformancePage() {
    const [page, setPage] = useState(0)
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['performance-reviews', page],
        queryFn: () => performanceApi.list(page, 10),
    })

    return (
        <div>
            <PageHeader title="Performance" subtitle="Employee performance reviews." />
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
                        head={['Employee', 'Review date', 'Reviewer', 'Rating', 'Comments', 'Goals']}
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
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
            {data && <Pager page={page} totalPages={data.totalPages} onPage={setPage} />}
        </div>
    )
}
