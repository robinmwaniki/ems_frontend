import { client } from './client'
import type { Announcement, Page, PerformanceReview } from '@/types/api'

export const employeeContentApi = {
    announcements: () =>
        client.get<Announcement[]>('/api/me/announcements').then((response) => response.data),

    performance: (page = 0, size = 10) =>
        client.get<Page<PerformanceReview>>('/api/me/performance', { params: { page, size } })
            .then((response) => response.data),
}
