
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesApi } from '@/api/employees'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'

export default function EmployeesPage() {
    const qc = useQueryClient()

    const [page, setPage] = useState(0)
    const [keyword, setKeyword] = useState('')
    const [search, setSearch] = useState('')

    // Fetch employees.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['employees', page, search],
        queryFn: () =>
            employeesApi.list(page, 10, search || undefined),
    })

    // Delete employee.
    const deleteMutation = useMutation({
        mutationFn: employeesApi.delete,

        onSuccess: async () => {
            toast.success('Employee deleted.')

            await qc.invalidateQueries({
                queryKey: ['employees'],
            })
        },

        onError: () => {
            toast.error('Failed to delete employee.')
        },
    })

    // Handle employee search.
    const handleSearch = (e: Parameters<
        NonNullable<React.ComponentProps<'form'>['onSubmit']>
    >[0]) => {
        e.preventDefault()
        setSearch(keyword.trim())
        setPage(0)
    }

    return (
        <div>
            <PageHeader
                title="Employees"
                subtitle="Everyone who works at the company."
                action={
                    <div
                        style={{
                            display: 'flex',
                            gap: '.75rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <form
                            onSubmit={handleSearch}
                            style={{
                                display: 'flex',
                                gap: '.5rem',
                            }}
                        >
                            <input
                                type="search"
                                value={keyword}
                                onChange={(e) =>
                                    setKeyword(e.target.value)
                                }
                                placeholder="Search employees..."
                                aria-label="Search employees"
                                style={{
                                    padding: '.55rem .9rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    fontSize: '.9rem',
                                }}
                            />

                            <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                            >
                                Search
                            </Button>
                        </form>
                    </div>
                }
            />

            <Card>
                {isLoading ? (
                    <p
                        style={{
                            padding: '2rem',
                            textAlign: 'center',
                        }}
                    >
                        Loading employees...
                    </p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load employees.</p>

                        <Button
                            onClick={() =>
                                qc.invalidateQueries({
                                    queryKey: ['employees', page, search],
                                })
                            }
                        >
                            Retry
                        </Button>
                    </div>
                ) : (
                    <Table
                        head={[
                            'Employee',
                            'Phone',
                            'Department',
                            'Salary',
                            'Actions',
                        ]}
                        empty="No employees found."
                    >
                        {data?.content.map((emp) => (
                            <tr key={emp.id}>
                                <Td>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '.75rem',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'var(--brand-soft)',
                                                color: 'var(--brand-dark)',
                                                display: 'grid',
                                                placeItems: 'center',
                                                fontWeight: 600,
                                                fontSize: '.9rem',
                                                flexShrink: 0,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {emp.profilePhoto ? (
                                                <img
                                                    src={employeesApi.photoUrl(
                                                        emp.id,
                                                        emp.profilePhoto,
                                                    )}
                                                    alt={`${emp.firstName} ${emp.lastName}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            ) : (
                                                emp.firstName
                                                    .charAt(0)
                                                    .toUpperCase()
                                            )}
                                        </div>

                                        <div>
                                            <div style={{ fontWeight: 600 }}>
                                                {emp.firstName} {emp.lastName}
                                            </div>

                                            <div
                                                style={{
                                                    color: 'var(--muted)',
                                                    fontSize: '.8rem',
                                                }}
                                            >
                                                {emp.email}
                                            </div>
                                        </div>
                                    </div>
                                </Td>

                                <Td>{emp.phoneNumber}</Td>

                                <Td>
                                    <span
                                        style={{
                                            background: 'var(--brand-soft)',
                                            color: 'var(--brand-dark)',
                                            padding: '.3em .75em',
                                            borderRadius: 999,
                                            fontSize: '.78rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {emp.departmentName}
                                    </span>
                                </Td>

                                <Td>
                                    KES {Number(emp.salary).toLocaleString()}
                                </Td>

                                <Td>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '.4rem',
                                        }}
                                    >
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        `Delete ${emp.firstName} ${emp.lastName}?`,
                                                    )
                                                ) {
                                                    deleteMutation.mutate(emp.id)
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>

            {data && data.totalPages > 0 && (
                <Pager
                    page={page}
                    totalPages={data.totalPages}
                    onPage={setPage}
                />
            )}
        </div>
    )
}
