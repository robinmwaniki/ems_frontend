import { client } from './client'
import type {
    Attendance,
    Employee,
    Leave,
    Payroll,
    PerformanceReview,
} from '@/types/api'

export const reportsApi = {
    employees: () =>
        client.get<Employee[]>('/api/reports/employees').then((r) => r.data),

    payroll: () =>
        client.get<Payroll[]>('/api/reports/payroll').then((r) => r.data),

    leave: () =>
        client.get<Leave[]>('/api/reports/leave').then((r) => r.data),

    attendance: () =>
        client.get<Attendance[]>('/api/reports/attendance').then((r) => r.data),

    performance: () =>
        client
            .get<PerformanceReview[]>('/api/reports/performance')
            .then((r) => r.data),
}
