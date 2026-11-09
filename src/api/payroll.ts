import { client } from './client'
import type { Page, Payroll } from '@/types/api'

export const payrollApi = {
    list: (page = 0, size = 10) =>
        client
            .get<Page<Payroll>>('/api/payroll', { params: { page, size } })
            .then((r) => r.data),

    get: (id: number) =>
        client.get<Payroll>(`/api/payroll/${id}`).then((r) => r.data),

    create: (data: Partial<Payroll>) =>
        client.post<Payroll>('/api/payroll', data).then((r) => r.data),

    update: (id: number, data: Partial<Payroll>) =>
        client.put<Payroll>(`/api/payroll/${id}`, data).then((r) => r.data),

    delete: (id: number) => client.delete(`/api/payroll/${id}`),

    payslipUrl: (id: number) =>
        `${import.meta.env.VITE_API_URL ?? ''}/api/payslips/${id}`,
}