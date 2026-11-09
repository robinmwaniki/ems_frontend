import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentsApi } from '@/api/departments'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import toast from 'react-hot-toast'

export default function DepartmentsPage() {
    const qc = useQueryClient()
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [showForm, setShowForm] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: departmentsApi.list,
    })

    const createMutation = useMutation({
        mutationFn: departmentsApi.create,
        onSuccess: () => {
            toast.success('Department created.')
            qc.invalidateQueries({ queryKey: ['departments'] })
            setName('')
            setCode('')
            setShowForm(false)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: departmentsApi.delete,
        onSuccess: () => {
            toast.success('Department deleted.')
            qc.invalidateQueries({ queryKey: ['departments'] })
        },
    })

    return (
        <div>
            <PageHeader
                title="Departments"
                subtitle="Organise your company into teams."
                action={
                    <Button onClick={() => setShowForm(!showForm)}>
                        + Add Department
                    </Button>
                }
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 400 }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>New Department</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            createMutation.mutate({ name, code })
                        }}
                        style={{ display: 'grid', gap: '.75rem' }}
                    >
                        <input
                            required
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                padding: '.65rem .9rem',
                                border: '1px solid var(--border)',
                                borderRadius: 10,
                            }}
                        />
                        <input
                            required
                            placeholder="Code (e.g. ENG)"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            style={{
                                padding: '.65rem .9rem',
                                border: '1px solid var(--border)',
                                borderRadius: 10,
                            }}
                        />
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={createMutation.isPending}>
                                Save
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : (
                    <Table head={['ID', 'Name', 'Code', 'Actions']} empty="No departments.">
                        {data?.map((d) => (
                            <tr key={d.id}>
                                <Td>{d.id}</Td>
                                <Td>
                                    <span style={{ fontWeight: 600 }}>{d.name}</span>
                                </Td>
                                <Td>{d.code}</Td>
                                <Td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm('Delete this department?')) {
                                                deleteMutation.mutate(d.id)
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
        </div>
    )
}