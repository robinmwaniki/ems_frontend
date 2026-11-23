import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentsApi } from '@/api/departments'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import toast from 'react-hot-toast'

interface DepartmentForm {
    name: string
    code: string
}

const emptyForm: DepartmentForm = { name: '', code: '' }

const inputStyle = {
    padding: '.65rem .9rem',
    border: '1px solid var(--border)',
    borderRadius: 10,
    width: '100%',
}

export default function DepartmentsPage() {
    const qc = useQueryClient()
    const [form, setForm] = useState<DepartmentForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [showForm, setShowForm] = useState(false)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['departments'],
        queryFn: departmentsApi.list,
    })

    const saveMutation = useMutation({
        mutationFn: (values: DepartmentForm & { id: number | null }) =>
            values.id === null
                ? departmentsApi.create({ name: values.name.trim(), code: values.code.trim() })
                : departmentsApi.update(values.id, { name: values.name.trim(), code: values.code.trim() }),
        onSuccess: async () => {
            toast.success(editingId === null ? 'Department created.' : 'Department updated.')
            await qc.invalidateQueries({ queryKey: ['departments'] })
            setForm(emptyForm)
            setEditingId(null)
            setShowForm(false)
        },
        onError: () => toast.error('Unable to save department. Check the name and code.'),
    })

    const deleteMutation = useMutation({
        mutationFn: departmentsApi.delete,
        onSuccess: async () => {
            toast.success('Department deleted.')
            await qc.invalidateQueries({ queryKey: ['departments'] })
        },
        onError: () => toast.error('Unable to delete department. It may still have employees assigned.'),
    })

    const startCreate = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm((visible) => !visible)
    }

    const startEdit = (department: NonNullable<typeof data>[number]) => {
        setForm({ name: department.name, code: department.code })
        setEditingId(department.id)
        setShowForm(true)
    }

    return (
        <div>
            <PageHeader
                title="Departments"
                subtitle="Create and maintain company departments."
                action={<Button onClick={startCreate}>+ Add Department</Button>}
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 480 }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                        {editingId === null ? 'New Department' : 'Edit Department'}
                    </h3>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            saveMutation.mutate({ ...form, id: editingId })
                        }}
                        style={{ display: 'grid', gap: '.75rem' }}
                    >
                        <label>
                            <span>Name</span>
                            <input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                        </label>
                        <label>
                            <span>Code</span>
                            <input required maxLength={20} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} style={inputStyle} />
                        </label>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? 'Saving…' : 'Save'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
                ) : isError ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Unable to load departments.</p>
                ) : (
                    <Table head={['ID', 'Name', 'Code', 'Actions']} empty="No departments.">
                        {data?.map((department) => (
                            <tr key={department.id}>
                                <Td>{department.id}</Td>
                                <Td><span style={{ fontWeight: 600 }}>{department.name}</span></Td>
                                <Td>{department.code}</Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '.4rem' }}>
                                        <Button variant="ghost" size="sm" onClick={() => startEdit(department)}>Edit</Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => {
                                                if (window.confirm('Delete this department?')) {
                                                    deleteMutation.mutate(department.id)
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
        </div>
    )
}
