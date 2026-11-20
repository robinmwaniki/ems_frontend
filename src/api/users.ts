import { client } from './client'
import type { Page, User, Role } from '@/types/api'

export interface UserRequest {
    employeeId: number
    username: string
    password?: string
    role: Role
}

export const usersApi = {
    list: (page = 0, size = 10) =>
        client.get<Page<User>>('/api/users', { params: { page, size } }).then((r) => r.data),
    create: (data: UserRequest) =>
        client.post<User>('/api/users', data).then((r) => r.data),
    update: (id: number, data: UserRequest) =>
        client.put<User>(`/api/users/${id}`, data).then((r) => r.data),
    enable: (id: number) =>
        client.post<User>(`/api/users/${id}/enable`).then((r) => r.data),
    disable: (id: number) =>
        client.post<User>(`/api/users/${id}/disable`).then((r) => r.data),
    delete: (id: number) => client.delete(`/api/users/${id}`),
}
