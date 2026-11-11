import { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { client } from './client'

vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() },
}))

// Replaces the network layer so no real request is made. The adapter returns
// a response with the given status, or throws the error axios would throw.
// It also records each request so tests can inspect what was sent.
function mockServer(status: number, data: unknown = {}) {
    const requests: InternalAxiosRequestConfig[] = []

    client.defaults.adapter = async (config) => {
        requests.push(config)

        const response: AxiosResponse = {
            data,
            status,
            statusText: '',
            headers: new AxiosHeaders(),
            config,
        }

        if (status >= 200 && status < 300) return response

        throw new AxiosError(
            `Request failed with status code ${status}`,
            AxiosError.ERR_BAD_REQUEST,
            config,
            null,
            response,
        )
    }

    return requests
}

describe('API client', () => {
    const replace = vi.fn()

    beforeEach(() => {
        // jsdom cannot navigate, so replace window.location with a stub.
        vi.stubGlobal('location', { pathname: '/employees', replace })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        replace.mockClear()
    })

    describe('request authorization', () => {
        it('sends the stored token as a Bearer header', async () => {
            sessionStorage.setItem('token', 'abc123')
            const requests = mockServer(200)

            await client.get('/api/employees')

            expect(requests[0].headers.Authorization).toBe('Bearer abc123')
        })

        it('sends no Authorization header when signed out', async () => {
            const requests = mockServer(200)

            await client.get('/api/employees')

            expect(requests[0].headers.Authorization).toBeUndefined()
        })
    })

    describe('401 responses', () => {
        it('clears the token and redirects to the login page', async () => {
            sessionStorage.setItem('token', 'expired')
            mockServer(401)

            await expect(client.get('/api/employees')).rejects.toBeDefined()

            expect(sessionStorage.getItem('token')).toBeNull()
            expect(replace).toHaveBeenCalledWith('/login')
            expect(toast.error).not.toHaveBeenCalled()
        })

        it('does not redirect when already on the login page', async () => {
            vi.stubGlobal('location', { pathname: '/login', replace })
            sessionStorage.setItem('token', 'expired')
            mockServer(401)

            await expect(client.get('/api/employees')).rejects.toBeDefined()

            expect(replace).not.toHaveBeenCalled()
        })

        it('leaves the session alone when the login request itself fails', async () => {
            sessionStorage.setItem('token', 'still-valid')
            mockServer(401)

            await expect(
                client.post('/api/auth/login', {}),
            ).rejects.toBeDefined()

            expect(sessionStorage.getItem('token')).toBe('still-valid')
            expect(replace).not.toHaveBeenCalled()
            expect(toast.error).not.toHaveBeenCalled()
        })
    })

    describe('other error responses', () => {
        it('shows the server message for a failed request', async () => {
            mockServer(400, { message: 'Email already exists' })

            await expect(
                client.post('/api/employees', {}),
            ).rejects.toBeDefined()

            expect(toast.error).toHaveBeenCalledWith('Email already exists')
        })

        it('falls back to the detail field of the response', async () => {
            mockServer(500, { detail: 'Something broke on the server' })

            await expect(client.get('/api/employees')).rejects.toBeDefined()

            expect(toast.error).toHaveBeenCalledWith(
                'Something broke on the server',
            )
        })

        it('does not show a toast for 403 responses', async () => {
            mockServer(403, { message: 'Forbidden' })

            await expect(client.get('/api/employees')).rejects.toBeDefined()

            expect(toast.error).not.toHaveBeenCalled()
            expect(replace).not.toHaveBeenCalled()
        })
    })
})