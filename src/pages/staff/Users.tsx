import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import { employeesApi } from '@/api/employees'
import { useAuthStore } from '@/store/auth'
import type { Role, User } from '@/types/api'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'

interface UserForm {
    employeeId: string
    username: string
    password: string
    role: Role
}

const emptyForm: UserForm = {
    employeeId: '',
    username: '',
    password: '',
    role: 'ROLE_EMPLOYEE',
}

const inputStyle = {
    padding: '.65rem .9rem',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: '.9rem',
    width: '100%',
}

export default function UsersPage() {
    const qc = useQueryClient()
    const currentUser = useAuthStore((state) => state.user)
    const [page, setPage] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<UserForm>(emptyForm)

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['users', page],
        queryFn: () => usersApi.list(page, 10),
    })

    const { data: employeesData } = useQuery({
        queryKey: ['employees', 'user-options'],
        queryFn: () => employeesApi.list(0, 100),
    })

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(false)
    }

    const saveMutation = useMutation({
        mutationFn: ({ id, values }: { id: number | null; values: UserForm }) => {
            const request = {
                employeeId: Number(values.employeeId),
                username: values.username.trim(),
                password: values.password || undefined,
                role: values.role,
            }
            return id === null ? usersApi.create(request) : usersApi.update(id, request)
        },
        onSuccess: async () => {
            toast.success(editingId === null ? 'User account created.' : 'User account updated.')
            await qc.invalidateQueries({ queryKey: ['users'] })
            resetForm()
        },
        onError: () => toast.error('Unable to save user account. Check username and employee assignment.'),
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
            enabled ? usersApi.enable(id) : usersApi.disable(id),
        onSuccess: async (_, variables) => {
            toast.success(variables.enabled ? 'User account enabled.' : 'User account disabled.')
            await qc.invalidateQueries({ queryKey: ['users'] })
        },
        onError: () => toast.error('Unable to change user status.'),
    })

    const deleteMutation = useMutation({
        mutationFn: usersApi.delete,
        onSuccess: async () => {
            toast.success('User account deleted.')
            await qc.invalidateQueries({ queryKey: ['users'] })
        },
        onError: () => toast.error('Unable to delete user account.'),
    })

    const startEdit = (user: User) => {
        setEditingId(user.id)
        setForm({
            employeeId: String(user.employeeId ?? ''),
            username: user.username,
            password: '',
            role: user.role,
        })
        setShowForm(true)
    }

    return (
        <div>
            <PageHeader
                title="System Users"
                subtitle="Create accounts and manage access to EMS."
                action={<Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((visible) => !visible) }}>+ Create User</Button>}
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 560 }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                        {editingId === null ? 'Create User Account' : 'Edit User Account'}
                    </h3>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            saveMutation.mutate({ id: editingId, values: form })
                        }}
                        style={{ display: 'grid', gap: '.8rem' }}
                    >
                        <label>
                            <span>Employee</span>
                            <select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} style={inputStyle}>
                                <option value="">Select employee</option>
                                {employeesData?.content.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.firstName} {employee.lastName} — {employee.email}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span>Username</span>
                            <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={inputStyle} />
                        </label>
                        <label>
                            <span>Password {editingId !== null && '(leave blank to keep current password)'}</span>
                            <input
                                required={editingId === null}
                                type="password"
                                minLength={8}
                                autoComplete="new-password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                style={inputStyle}
                            />
                        </label>
                        <label>
                            <span>Role</span>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} style={inputStyle}>
                                <option value="ROLE_EMPLOYEE">Employee</option>
                                <option value="ROLE_HR_MANAGER">HR Manager</option>
                                <option value="ROLE_ADMIN">Administrator</option>
                            </select>
                        </label>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={saveMutation.isPending || !employeesData?.content.length}>
                                {saveMutation.isPending ? 'Saving…' : 'Save Account'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading users…</p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load system users.</p>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                ) : (
                    <Table head={['Username', 'Employee', 'Role', 'Status', 'Actions']} empty="No users.">
                        {data?.content.map((user) => {
                            const isCurrentUser = currentUser?.username === user.username
                            return (
                                <tr key={user.id}>
                                    <Td><span style={{ fontWeight: 600 }}>{user.username}</span></Td>
                                    <Td>{user.employeeName ?? '—'}</Td>
                                    <Td>
                                        <Badge variant={user.role === 'ROLE_ADMIN' ? 'info' : user.role === 'ROLE_HR_MANAGER' ? 'warning' : 'neutral'}>
                                            {user.role.replace('ROLE_', '')}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Badge variant={user.enabled ? 'success' : 'danger'}>
                                            {user.enabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                                            <Button variant="ghost" size="sm" disabled={isCurrentUser} onClick={() => startEdit(user)}>Edit</Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                disabled={statusMutation.isPending || isCurrentUser}
                                                title={isCurrentUser ? 'You cannot disable your own account.' : undefined}
                                                onClick={() => statusMutation.mutate({ id: user.id, enabled: !user.enabled })}
                                            >
                                                {user.enabled ? 'Disable' : 'Enable'}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                disabled={deleteMutation.isPending || isCurrentUser}
                                                title={isCurrentUser ? 'You cannot delete your own account.' : undefined}
                                                onClick={() => {
                                                    if (window.confirm(`Delete account for ${user.username}?`)) {
                                                        deleteMutation.mutate(user.id)
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </Td>
                                </tr>
                            )
                        })}
                    </Table>
                )}
            </Card>
            {data && <Pager page={page} totalPages={data.totalPages} onPage={setPage} />}
        </div>
    )
}
