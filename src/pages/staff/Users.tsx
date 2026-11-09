import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client'
import type { Page, User } from '@/types/api'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Table, { Td } from '@/components/Table'
import { useState } from 'react'
import Pager from '@/components/Pager'

export default function UsersPage() {
    const [page, setPage] = useState(0)

    const { data, isLoading } = useQuery({
        queryKey: ['users', page],
        queryFn: () =>
            client
                .get<Page<User>>('/api/users', { params: { page, size: 10 } })
                .then((r) => r.data),
    })

    return (
        <div>
            <PageHeader
                title="System Users"
                subtitle="Manage who can sign in."
            />
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : (
                    <Table
                        head={['Username', 'Employee', 'Role', 'Status']}
                        empty="No users."
                    >
                        {data?.content.map((u) => (
                            <tr key={u.id}>
                                <Td>
                                    <span style={{ fontWeight: 600 }}>{u.username}</span>
                                </Td>
                                <Td>{u.employeeName ?? '—'}</Td>
                                <Td>
                                    <Badge
                                        variant={
                                            u.role === 'ROLE_ADMIN'
                                                ? 'info'
                                                : u.role === 'ROLE_HR_MANAGER'
                                                    ? 'warning'
                                                    : 'neutral'
                                        }
                                    >
                                        {u.role.replace('ROLE_', '')}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge variant={u.enabled ? 'success' : 'danger'}>
                                        {u.enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
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