import { client } from './client'
import type { AuthResponse, MeResponse, Role } from '@/types/api'

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

    demoLogin: async (role: Role): Promise<AuthResponse> => {
        const response = await client.post<AuthResponse>(
            '/api/demo/login',
            null,
            { params: { role: role.replace('ROLE_', '') } },
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
        confirmPassword: string,
    ) =>
        client.post('/api/auth/change-password', {
            currentPassword,
            newPassword,
            confirmPassword,
        }),
}
