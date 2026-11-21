import { client } from './client'
import type { Page, SystemLog } from '@/types/api'

export const systemLogsApi = {
    list: (page = 0, size = 20) =>
        client
            .get<Page<SystemLog>>('/api/system-logs', { params: { page, size } })
            .then((r) => r.data),
}
