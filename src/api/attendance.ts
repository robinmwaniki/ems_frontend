import { client } from './client'
import type { Attendance, Page } from '@/types/api'

export const attendanceApi = {
    list: (page = 0, size = 10) =>
        client
            .get<Page<Attendance>>('/api/attendance', { params: { page, size } })
            .then((r) => r.data),

    get: (id: number) =>
        client.get<Attendance>(`/api/attendance/${id}`).then((r) => r.data),

    checkIn: (employeeId: number) =>
        client
            .post<Attendance>('/api/attendance/check-in', { employeeId })
            .then((r) => r.data),

    checkOut: (employeeId: number) =>
        client
            .put<Attendance>(`/api/attendance/check-out/${employeeId}`)
            .then((r) => r.data),
}
