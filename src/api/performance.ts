import { client } from './client'
import type { Page, PerformanceReview } from '@/types/api'

export const performanceApi = {
    list: (page = 0, size = 10) =>
        client
            .get<Page<PerformanceReview>>('/api/performance', { params: { page, size } })
            .then((r) => r.data),

    listForEmployee: (employeeId: number, page = 0, size = 10) =>
        client
            .get<Page<PerformanceReview>>(`/api/performance/employee/${employeeId}`, {
                params: { page, size },
            })
            .then((r) => r.data),

    get: (id: number) =>
        client.get<PerformanceReview>(`/api/performance/${id}`).then((r) => r.data),

    create: (data: Omit<PerformanceReview, 'id' | 'employeeName'>) =>
        client.post<PerformanceReview>('/api/performance', data).then((r) => r.data),

    update: (id: number, data: Omit<PerformanceReview, 'id' | 'employeeName'>) =>
        client.put<PerformanceReview>(`/api/performance/${id}`, data).then((r) => r.data),

    delete: (id: number) => client.delete(`/api/performance/${id}`),
}
