import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesApi } from '@/api/employees'
import { departmentsApi } from '@/api/departments'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'
import ProtectedImage from '@/components/ProtectedImage'

interface EmployeeForm {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    salary: string
    hireDate: string
    departmentId: string
}

const emptyForm: EmployeeForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    salary: '',
    hireDate: '',
    departmentId: '',
}

const inputStyle = {
    padding: '.65rem .9rem',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: '.9rem',
    width: '100%',
}

export default function EmployeesPage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)
    const [keyword, setKeyword] = useState('')
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<EmployeeForm>(emptyForm)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['employees', page, search],
        queryFn: () => employeesApi.list(page, 10, search || undefined),
    })

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: departmentsApi.list,
    })

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(false)
    }

    const toRequest = (values: EmployeeForm) => ({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        salary: Number(values.salary),
        hireDate: values.hireDate,
        departmentId: Number(values.departmentId),
    })

    const createMutation = useMutation({
        mutationFn: (values: EmployeeForm) => employeesApi.create(toRequest(values)),
        onSuccess: async () => {
            toast.success('Employee created.')
            await qc.invalidateQueries({ queryKey: ['employees'] })
            resetForm()
        },
        onError: () => toast.error('Failed to create employee. Check the entered details.'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: number; values: EmployeeForm }) =>
            employeesApi.update(id, toRequest(values)),
        onSuccess: async () => {
            toast.success('Employee updated.')
            await qc.invalidateQueries({ queryKey: ['employees'] })
            resetForm()
        },
        onError: () => toast.error('Failed to update employee. Check the entered details.'),
    })

    const deleteMutation = useMutation({
        mutationFn: employeesApi.delete,
        onSuccess: async () => {
            toast.success('Employee deleted.')
            await qc.invalidateQueries({ queryKey: ['employees'] })
        },
        onError: () => toast.error('Failed to delete employee.'),
    })

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSearch(keyword.trim())
        setPage(0)
    }

    const startEdit = (employee: NonNullable<typeof data>['content'][number]) => {
        setEditingId(employee.id)
        setForm({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phoneNumber: employee.phoneNumber,
            salary: String(employee.salary),
            hireDate: employee.hireDate,
            departmentId: String(employee.departmentId),
        })
        setShowForm(true)
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (editingId !== null) {
            updateMutation.mutate({ id: editingId, values: form })
        } else {
            createMutation.mutate(form)
        }
    }

    const saving = createMutation.isPending || updateMutation.isPending

    return (
        <div>
            <PageHeader
                title="Employees"
                subtitle="Create, update and manage employee records."
                action={
                    <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.5rem' }}>
                            <input
                                type="search"
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Search employees..."
                                aria-label="Search employees"
                                style={inputStyle}
                            />
                            <Button type="submit" variant="ghost" size="sm">Search</Button>
                        </form>
                        <Button
                            onClick={() => {
                                setEditingId(null)
                                setForm(emptyForm)
                                setShowForm((visible) => !visible)
                            }}
                        >
                            + Add Employee
                        </Button>
                    </div>
                }
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                        {editingId === null ? 'New Employee' : 'Edit Employee'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '.9rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.75rem' }}>
                            <label>
                                <span>First name</span>
                                <input required maxLength={50} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Last name</span>
                                <input required maxLength={50} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Email</span>
                                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Phone number</span>
                                <input required value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Salary (KES)</span>
                                <input required type="number" min="0.01" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Hire date</span>
                                <input required type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Department</span>
                                <select required value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} style={inputStyle}>
                                    <option value="">Select department</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>{department.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        {departments.length === 0 && (
                            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
                                Create a department before adding an employee.
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={saving || departments.length === 0}>
                                {saving ? 'Saving…' : editingId === null ? 'Create Employee' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading employees...</p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load employees.</p>
                        <Button onClick={() => qc.invalidateQueries({ queryKey: ['employees', page, search] })}>Retry</Button>
                    </div>
                ) : (
                    <Table head={['Employee', 'Phone', 'Department', 'Salary', 'Actions']} empty="No employees found.">
                        {data?.content.map((employee) => (
                            <tr key={employee.id}>
                                <Td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand-dark)', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: '.9rem', flexShrink: 0, overflow: 'hidden' }}>
                                            {employee.profilePhoto ? (
                                                <ProtectedImage
                                                    srcPath={employeesApi.photoPath(employee.id, employee.profilePhoto)}
                                                    alt={`${employee.firstName} ${employee.lastName}`}
                                                    fallback={employee.firstName.charAt(0).toUpperCase()}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : employee.firstName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{employee.firstName} {employee.lastName}</div>
                                            <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{employee.email}</div>
                                        </div>
                                    </div>
                                </Td>
                                <Td>{employee.phoneNumber}</Td>
                                <Td>{employee.departmentName}</Td>
                                <Td>KES {Number(employee.salary).toLocaleString()}</Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                                        <Button variant="ghost" size="sm" onClick={() => startEdit(employee)}>Edit</Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => {
                                                if (window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) {
                                                    deleteMutation.mutate(employee.id)
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
                <Pager page={page} totalPages={data.totalPages} onPage={setPage} />
            )}
        </div>
    )
}
