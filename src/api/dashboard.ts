import { client } from './client'
import type { DashboardStats } from '@/types/api'

export const dashboardApi = {
    stats: () =>
        client.get<DashboardStats>('/api/dashboard').then((r) => r.data),
}