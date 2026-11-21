import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { payrollApi, type PayrollRequest } from '@/api/payroll'
import { employeesApi } from '@/api/employees'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Table, { Td } from '@/components/Table'
import Pager from '@/components/Pager'
import toast from 'react-hot-toast'

interface PayrollForm {
    employeeId: string
    payrollMonth: string
    houseAllowance: string
    transportAllowance: string
    bonus: string
    deductions: string
    pensionContribution: string
    insurancePremium: string
    residentTaxpayer: boolean
}

const emptyForm: PayrollForm = {
    employeeId: '',
    payrollMonth: '',
    houseAllowance: '0',
    transportAllowance: '0',
    bonus: '0',
    deductions: '0',
    pensionContribution: '0',
    insurancePremium: '0',
    residentTaxpayer: true,
}

const inputStyle = {
    padding: '.65rem .9rem',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: '.9rem',
    width: '100%',
}

export default function PayrollPage() {
    const qc = useQueryClient()
    const [page, setPage] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<PayrollForm>(emptyForm)

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['payroll', page],
        queryFn: () => payrollApi.list(page, 10),
    })

    const { data: employeesData } = useQuery({
        queryKey: ['employees', 'payroll-options'],
        queryFn: () => employeesApi.list(0, 100),
    })

    const toRequest = (values: PayrollForm): PayrollRequest => ({
        employeeId: Number(values.employeeId),
        payrollMonth: values.payrollMonth,
        houseAllowance: Number(values.houseAllowance || 0),
        transportAllowance: Number(values.transportAllowance || 0),
        bonus: Number(values.bonus || 0),
        deductions: Number(values.deductions || 0),
        pensionContribution: Number(values.pensionContribution || 0),
        insurancePremium: Number(values.insurancePremium || 0),
        residentTaxpayer: values.residentTaxpayer,
    })

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(false)
    }

    const saveMutation = useMutation({
        mutationFn: ({ id, values }: { id: number | null; values: PayrollForm }) => {
            const request = toRequest(values)
            return id === null ? payrollApi.create(request) : payrollApi.update(id, request)
        },
        onSuccess: async () => {
            toast.success(editingId === null ? 'Payroll generated.' : 'Payroll updated.')
            await qc.invalidateQueries({ queryKey: ['payroll'] })
            resetForm()
        },
        onError: () => toast.error('Unable to save payroll. Check the employee, month and amounts.'),
    })

    const deleteMutation = useMutation({
        mutationFn: payrollApi.delete,
        onSuccess: async () => {
            toast.success('Payroll record deleted.')
            await qc.invalidateQueries({ queryKey: ['payroll'] })
        },
        onError: () => toast.error('Unable to delete payroll record.'),
    })

    const startEdit = (record: NonNullable<typeof data>['content'][number]) => {
        setEditingId(record.id)
        setForm({
            employeeId: String(record.employeeId),
            payrollMonth: record.payrollMonth,
            houseAllowance: String(record.houseAllowance),
            transportAllowance: String(record.transportAllowance),
            bonus: String(record.bonus),
            deductions: String(record.deductions),
            pensionContribution: String(record.pensionContribution ?? 0),
            insurancePremium: String(record.insurancePremium ?? 0),
            residentTaxpayer: record.residentTaxpayer ?? true,
        })
        setShowForm(true)
    }

    const fmt = (value: number) =>
        new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)

    return (
        <div>
            <PageHeader
                title="Payroll"
                subtitle="Generate and maintain monthly payroll records."
                action={<Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((visible) => !visible) }}>+ Generate Payroll</Button>}
            />

            {showForm && (
                <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                        {editingId === null ? 'Generate Payroll' : 'Edit Payroll'}
                    </h3>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            saveMutation.mutate({ id: editingId, values: form })
                        }}
                        style={{ display: 'grid', gap: '.9rem' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.75rem' }}>
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
                                <span>Payroll month</span>
                                <input required type="month" value={form.payrollMonth} onChange={(e) => setForm({ ...form, payrollMonth: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>House allowance (KES)</span>
                                <input required type="number" min="0" step="0.01" value={form.houseAllowance} onChange={(e) => setForm({ ...form, houseAllowance: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Transport allowance (KES)</span>
                                <input required type="number" min="0" step="0.01" value={form.transportAllowance} onChange={(e) => setForm({ ...form, transportAllowance: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Bonus (KES)</span>
                                <input required type="number" min="0" step="0.01" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Deductions (KES)</span>
                                <input required type="number" min="0" step="0.01" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Voluntary pension contribution (KES)</span>
                                <input required type="number" min="0" step="0.01" value={form.pensionContribution} onChange={(e) => setForm({ ...form, pensionContribution: e.target.value })} style={inputStyle} />
                            </label>
                            <label>
                                <span>Insurance premiums eligible for relief (KES)</span>
                                <input required type="number" min="0" step="0.01" value={form.insurancePremium} onChange={(e) => setForm({ ...form, insurancePremium: e.target.value })} style={inputStyle} />
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                                <input type="checkbox" checked={form.residentTaxpayer} onChange={(e) => setForm({ ...form, residentTaxpayer: e.target.checked })} />
                                Resident taxpayer (eligible for KES 2,400 personal relief)
                            </label>
                        </div>
                        <p style={{ color: 'var(--muted)', fontSize: '.82rem' }}>
                            Basic salary is taken from the employee record. PAYE, NSSF, SHIF and Housing Levy are calculated automatically using Kenyan statutory rates for the selected payroll month.
                        </p>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <Button type="submit" disabled={saveMutation.isPending || !employeesData?.content.length}>
                                {saveMutation.isPending ? 'Saving…' : editingId === null ? 'Generate Payroll' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading payroll…</p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load payroll records.</p>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                ) : (
                    <Table head={['Employee', 'Month', 'Gross Pay', 'PAYE', 'Net Salary', 'Payslip', 'Actions']} empty="No payroll records.">
                        {data?.content.map((record) => (
                            <tr key={record.id}>
                                <Td><span style={{ fontWeight: 600 }}>{record.employeeName}</span></Td>
                                <Td>{record.payrollMonth}</Td>
                                <Td>{fmt(record.grossPay)}</Td>
                                <Td>{fmt(record.tax)}</Td>
                                <Td><span style={{ fontWeight: 600, color: '#166534' }}>{fmt(record.netSalary)}</span></Td>
                                <Td>
                                    <Button size="sm" variant="ghost" onClick={() => payrollApi.downloadPayslip(record.id).catch(() => undefined)}>
                                        PDF
                                    </Button>
                                </Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                                        <Button size="sm" variant="ghost" onClick={() => startEdit(record)}>Edit</Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => {
                                                if (window.confirm(`Delete payroll for ${record.employeeName} — ${record.payrollMonth}?`)) {
                                                    deleteMutation.mutate(record.id)
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
            {data && <Pager page={page} totalPages={data.totalPages} onPage={setPage} />}
        </div>
    )
}
