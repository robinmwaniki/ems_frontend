import { client } from './client'
import type {
    Attendance,
    Employee,
    Leave,
    LeaveType,
    Notification,
    Page,
    Payroll,
} from '@/types/api'

export const meApi = {
    profile: () =>
        client.get<Employee>('/api/me/profile').then((r) => r.data),

    updateProfile: (data: Partial<Employee>) =>
        client.put<Employee>('/api/me/profile', data).then((r) => r.data),

    uploadPhoto: (file: File) => {
        const form = new FormData()
        form.append('file', file)
        return client.post('/api/me/photo', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    photoUrl: () =>
        `${import.meta.env.VITE_API_URL ?? ''}/api/me/photo`,

    leave: (page = 0, size = 10) =>
        client
            .get<Page<Leave>>('/api/me/leave', { params: { page, size } })
            .then((r) => r.data),

    applyLeave: (data: {
        leaveType: LeaveType
        startDate: string
        endDate: string
        reason: string
    }) => client.post<Leave>('/api/me/leave', data).then((r) => r.data),

    cancelLeave: (id: number) =>
        client.post<Leave>(`/api/me/leave/${id}/cancel`).then((r) => r.data),

    attendance: (page = 0, size = 20) =>
        client
            .get<Page<Attendance>>('/api/me/attendance', { params: { page, size } })
            .then((r) => r.data),

    checkIn: () =>
        client.post<Attendance>('/api/me/attendance/check-in').then((r) => r.data),

    checkOut: () =>
        client.post<Attendance>('/api/me/attendance/check-out').then((r) => r.data),

    payroll: (page = 0, size = 12) =>
        client
            .get<Page<Payroll>>('/api/me/payroll', { params: { page, size } })
            .then((r) => r.data),

    notifications: () =>
        client.get<Notification[]>('/api/me/notifications').then((r) => r.data),

    unreadCount: () =>
        client.get<number>('/api/me/notifications/unread-count').then((r) => r.data),

    markRead: (id: number) =>
        client.post(`/api/me/notifications/${id}/read`),

    markAllRead: () => client.post('/api/me/notifications/read-all'),
}