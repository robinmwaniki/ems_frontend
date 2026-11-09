import { client } from './client'
import type { Department } from '@/types/api'

export const departmentsApi = {
    list: () =>
        client.get<Department[]>('/api/departments').then((r) => r.data),

    create: (data: { name: string; code: string }) =>
        client.post<Department>('/api/departments', data).then((r) => r.data),

    update: (id: number, data: { name: string; code: string }) =>
        client.put<Department>(`/api/departments/${id}`, data).then((r) => r.data),

    delete: (id: number) => client.delete(`/api/departments/${id}`),
}