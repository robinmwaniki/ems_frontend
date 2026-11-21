import { client } from './client'
import type { Notification } from '@/types/api'

export const notificationsApi = {
    list: () =>
        client.get<Notification[]>('/api/notifications').then((r) => r.data),

    markRead: (id: number) =>
        client.post<void>(`/api/notifications/${id}/read`),

    markAllRead: () =>
        client.post<void>('/api/notifications/read-all'),
}
