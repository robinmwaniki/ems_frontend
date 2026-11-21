import { client } from './client'
import { downloadCsv } from './download'
import type { Attendance, Employee, Leave, Payroll, PerformanceReview, StatutoryRemittanceReport } from '@/types/api'
export const reportsApi = {
 employees: () => client.get<Employee[]>('/api/reports/employees').then(r=>r.data),
 payroll: () => client.get<Payroll[]>('/api/reports/payroll').then(r=>r.data),
 leave: () => client.get<Leave[]>('/api/reports/leave').then(r=>r.data),
 attendance: () => client.get<Attendance[]>('/api/reports/attendance').then(r=>r.data),
 performance: () => client.get<PerformanceReview[]>('/api/reports/performance').then(r=>r.data),
 statutoryRemittances: (month:string) => client.get<StatutoryRemittanceReport>('/api/reports/statutory-remittances',{params:{month}}).then(r=>r.data),
 downloadStatutoryCsv: (month:string) => downloadCsv('/api/reports/statutory-remittances.csv?month='+encodeURIComponent(month),'statutory-remittances-'+month+'.csv'),
}
