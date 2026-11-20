import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { systemLogsApi } from '@/api/systemLogs'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import Button from '@/components/Button'

export default function SystemLogsPage() {
    const [page, setPage] = useState(0)
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['system-logs', page],
        queryFn: () => systemLogsApi.list(page, 20),
    })

    return (
        <div>
            <PageHeader title="System Logs" subtitle="Administrative audit trail." />
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading logs…</p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load system logs.</p>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                ) : (
                    <Table
                        head={['Time', 'Username', 'Role', 'Action', 'Description']}
                        empty="No system logs."
                    >
                        {data?.content.map((log) => (
                            <tr key={log.id}>
                                <Td>{log.createdAt.replace('T', ' ')}</Td>
                                <Td>{log.username}</Td>
                                <Td>{log.role}</Td>
                                <Td>{log.action}</Td>
                                <Td>{log.description}</Td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
            {data && <Pager page={page} totalPages={data.totalPages} onPage={setPage} />}
        </div>
    )
}
