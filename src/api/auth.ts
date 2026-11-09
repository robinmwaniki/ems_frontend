
import { client } from './client'
import type { AuthResponse, MeResponse } from '@/types/api'

export const authApi = {
    login: async (
        username: string,
        password: string,
    ): Promise<AuthResponse> => {
        const response = await client.post<AuthResponse>(
            '/api/auth/login',
            {
                username,
                password,
            },
        )

        return response.data
    },

    me: async (): Promise<MeResponse> => {
        const response = await client.get<MeResponse>('/api/auth/me')
        return response.data
    },

    changePassword: (
        currentPassword: string,
        newPassword: string,
    ) =>
        client.post('/api/auth/change-password', {
            currentPassword,
            newPassword,
        }),
}
