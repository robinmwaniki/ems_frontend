import { client } from './client'
import type { Employee, Page } from '@/types/api'

export const employeesApi = {
    list: (page = 0, size = 10, keyword?: string) =>
        client
            .get<Page<Employee>>('/api/employees', {
                params: { page, size, ...(keyword ? { keyword } : {}) },
            })
            .then((r) => r.data),

    get: (id: number) =>
        client.get<Employee>(`/api/employees/${id}`).then((r) => r.data),

    create: (data: Partial<Employee>) =>
        client.post<Employee>('/api/employees', data).then((r) => r.data),

    update: (id: number, data: Partial<Employee>) =>
        client.put<Employee>(`/api/employees/${id}`, data).then((r) => r.data),

    delete: (id: number) => client.delete(`/api/employees/${id}`),

    uploadPhoto: (id: number, file: File) => {
        const form = new FormData()
        form.append('file', file)
        return client.post(`/api/employees/${id}/photo`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    photoUrl: (id: number, version?: string | null) =>
        `${import.meta.env.VITE_API_URL ?? ''}/photos/employee/${id}${version ? `?v=${version}` : ''}`,
}