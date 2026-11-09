import { client } from './client'
import type { Announcement, Page } from '@/types/api'

export const announcementsApi = {
    list: (page = 0, size = 10) =>
        client
            .get<Page<Announcement>>('/api/announcements', { params: { page, size } })
            .then((r) => r.data),

    create: (data: Partial<Announcement>) =>
        client.post<Announcement>('/api/announcements', data).then((r) => r.data),

    update: (id: number, data: Partial<Announcement>) =>
        client
            .put<Announcement>(`/api/announcements/${id}`, data)
            .then((r) => r.data),

    delete: (id: number) => client.delete(`/api/announcements/${id}`),
}