import { client } from './client'
import type { Leave, Page } from '@/types/api'

export const leaveApi = {
    list: (page = 0, size = 10) =>
        client
            .get<Page<Leave>>('/api/leaves', { params: { page, size } })
            .then((r) => r.data),

    approve: (id: number) =>
        client.post<Leave>(`/api/leaves/${id}/approve`).then((r) => r.data),

    reject: (id: number) =>
        client.post<Leave>(`/api/leaves/${id}/reject`).then((r) => r.data),
}