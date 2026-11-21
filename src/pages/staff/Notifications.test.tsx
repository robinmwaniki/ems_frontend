import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StaffNotificationsPage from './Notifications'
import type { Notification } from '@/types/api'

const api = vi.hoisted(() => ({
    list: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
}))

const toast = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}))

vi.mock('@/api/notifications', () => ({
    notificationsApi: api,
}))

vi.mock('react-hot-toast', () => ({
    default: toast,
}))

const initialNotifications: Notification[] = [
    {
        id: 11,
        title: 'Payroll processed',
        message: 'The October payroll has been processed.',
        read: false,
        createdAt: '2026-11-20T09:00:00Z',
    },
    {
        id: 12,
        title: 'Policy update',
        message: 'The leave policy was updated.',
        read: true,
        createdAt: '2026-11-19T09:00:00Z',
    },
]

let notifications: Notification[]

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <StaffNotificationsPage />
        </QueryClientProvider>,
    )
}

describe('StaffNotificationsPage', () => {
    beforeEach(() => {
        notifications = initialNotifications.map((notification) => ({ ...notification }))
        vi.clearAllMocks()

        api.list.mockImplementation(async () => notifications)
        api.markRead.mockImplementation(async (id: number) => {
            notifications = notifications.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification,
            )
        })
        api.markAllRead.mockImplementation(async () => {
            notifications = notifications.map((notification) => ({
                ...notification,
                read: true,
            }))
        })
    })

    it('shows a loading state while staff notifications are being fetched', () => {
        api.list.mockReturnValue(new Promise(() => undefined))

        renderPage()

        expect(screen.getByText('Loading notifications…')).toBeInTheDocument()
    })

    it('renders staff notifications and the unread count', async () => {
        renderPage()

        expect(await screen.findByText('Payroll processed')).toBeInTheDocument()
        expect(screen.getByText('Policy update')).toBeInTheDocument()
        expect(screen.getByText('1 unread notification')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Mark Read' })).toBeInTheDocument()
    })

    it('marks one notification as read and refreshes the list', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Payroll processed')
        await user.click(screen.getByRole('button', { name: 'Mark Read' }))

        await waitFor(() => {
            expect(api.markRead).toHaveBeenCalledWith(11)
            expect(api.list).toHaveBeenCalledTimes(2)
        })
        expect(screen.getByText('0 unread notifications')).toBeInTheDocument()
    })

    it('marks all notifications as read and confirms the action', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Payroll processed')
        await user.click(screen.getByRole('button', { name: 'Mark All Read' }))

        await waitFor(() => {
            expect(api.markAllRead).toHaveBeenCalledOnce()
            expect(api.list).toHaveBeenCalledTimes(2)
        })
        expect(toast.success).toHaveBeenCalledWith('All notifications marked as read.')
        expect(screen.getByText('0 unread notifications')).toBeInTheDocument()
    })

    it('offers a retry when loading notifications fails', async () => {
        api.list.mockRejectedValueOnce(new Error('Request failed'))
        renderPage()

        expect(await screen.findByText('Unable to load notifications.')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))

        expect(await screen.findByText('Payroll processed')).toBeInTheDocument()
    })

    it('reports a failed mark-read action without hiding the notification', async () => {
        const user = userEvent.setup()
        api.markRead.mockRejectedValueOnce(new Error('Request failed'))
        renderPage()

        await screen.findByText('Payroll processed')
        await user.click(screen.getByRole('button', { name: 'Mark Read' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Could not mark notification as read.')
        })
        expect(screen.getByText('Payroll processed')).toBeInTheDocument()
    })
})
