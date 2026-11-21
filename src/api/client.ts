import axios from 'axios'
import toast from 'react-hot-toast'
import { API_BASE_URL, DEMO_MODE } from '@/config/demo'

export const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
})

client.interceptors.request.use(
    (config) => {
        const requestUrl = config.url ?? ''
        const isDemoLogin = /\/api\/demo\/login(?:\?|$)/.test(requestUrl)
        const method = (config.method ?? 'get').toLowerCase()

        // Enforce read-only behavior in the browser as a second layer.
        // The demo backend independently rejects write operations as well.
        if (DEMO_MODE && !['get', 'head', 'options'].includes(method) && !isDemoLogin) {
            const message = 'This action is disabled in the public demo.'
            toast.error(message)
            return Promise.reject(new Error(message))
        }

        const token = sessionStorage.getItem('token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error),
)

client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.',
            )

            return Promise.reject(error)
        }

        const status = error.response?.status
        const responseData = error.response?.data

        let message = 'An error occurred. Please try again.'

        if (typeof responseData === 'string') {
            message = responseData
        } else if (responseData && typeof responseData === 'object') {
            const data = responseData as {
                message?: string
                error?: string
                detail?: string
            }

            message =
                data.message ??
                data.detail ??
                data.error ??
                error.message ??
                message
        } else {
            message = error.message || message
        }

        const requestUrl = error.config?.url ?? ''
        const isLoginRequest = /\/api\/(?:auth\/login|demo\/login)(?:\?|$)/.test(requestUrl)

        if (status === 401 && !isLoginRequest) {
            sessionStorage.removeItem('token')

            if (window.location.pathname !== '/login') {
                window.location.replace('/login')
            }
        } else if (status !== 403 && !isLoginRequest) {
            toast.error(message)
        }

        return Promise.reject(error)
    },
)
