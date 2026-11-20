import { client } from './client'
import { downloadPdf } from './download'
import type { Page, Payroll } from '@/types/api'

export interface PayrollRequest {
    employeeId: number
    payrollMonth: string
    houseAllowance: number
    transportAllowance: number
    bonus: number
    deductions: number
    pensionContribution: number
    insurancePremium: number
    residentTaxpayer: boolean
}

export const payrollApi = {
    list: (page = 0, size = 10) =>
        client
            .get<Page<Payroll>>('/api/payroll', { params: { page, size } })
            .then((r) => r.data),

    get: (id: number) =>
        client.get<Payroll>(`/api/payroll/${id}`).then((r) => r.data),

    create: (data: PayrollRequest) =>
        client.post<Payroll>('/api/payroll', data).then((r) => r.data),

    update: (id: number, data: PayrollRequest) =>
        client.put<Payroll>(`/api/payroll/${id}`, data).then((r) => r.data),

    delete: (id: number) => client.delete(`/api/payroll/${id}`),

    downloadPayslip: (id: number) =>
        downloadPdf(`/api/payslips/${id}`, `Payslip-${id}.pdf`),
}
