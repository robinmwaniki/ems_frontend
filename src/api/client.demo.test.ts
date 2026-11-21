import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe('demo API client safety', () => {
    it('blocks mutating API calls while demo mode is enabled', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'true')
        vi.stubEnv('VITE_DEMO_API_URL', 'https://demo-api.example.com')
        const { client } = await import('./client')

        await expect(client.post('/api/employees', { firstName: 'Unsafe' }))
            .rejects.toThrow('This action is disabled in the public demo.')
    })

    it('allows only the demo token exchange POST and targets the dedicated demo API', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'true')
        vi.stubEnv('VITE_DEMO_API_URL', 'https://demo-api.example.com')
        vi.stubEnv('VITE_API_URL', 'https://production.example.com')
        const { client } = await import('./client')

        const response = await client.post('/api/demo/login', null, {
            params: { role: 'ADMIN' },
            adapter: async (config) => ({
                data: { accessToken: 'synthetic-token', tokenType: 'Bearer' },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            }),
        })

        expect(response.config.baseURL).toBe('https://demo-api.example.com')
        expect(response.config.url).toBe('/api/demo/login')
    })
})
