import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe('demo API configuration', () => {
    it('does not fall back to the production API when demo mode has no demo URL', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'true')
        vi.stubEnv('VITE_DEMO_API_URL', '')
        vi.stubEnv('VITE_API_URL', 'https://production.example.com')

        const config = await import('./demo')

        expect(config.DEMO_MODE).toBe(true)
        expect(config.DEMO_CONFIG_ERROR).toContain('VITE_DEMO_API_URL')
        expect(config.API_BASE_URL).toBe('/__demo_api_not_configured__')
        expect(config.API_BASE_URL).not.toBe('https://production.example.com')
    })

    it('uses only the dedicated demo API URL in demo mode', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'true')
        vi.stubEnv('VITE_DEMO_API_URL', 'https://demo-api.example.com/')
        vi.stubEnv('VITE_API_URL', 'https://production.example.com')

        const config = await import('./demo')

        expect(config.DEMO_CONFIG_ERROR).toBeNull()
        expect(config.API_BASE_URL).toBe('https://demo-api.example.com')
    })

    it('preserves the normal API URL outside demo mode', async () => {
        vi.stubEnv('VITE_DEMO_MODE', 'false')
        vi.stubEnv('VITE_API_URL', 'https://production.example.com')

        const config = await import('./demo')

        expect(config.DEMO_MODE).toBe(false)
        expect(config.API_BASE_URL).toBe('https://production.example.com')
    })
})
