const demoApiUrl = (import.meta.env.VITE_DEMO_API_URL ?? '').trim()

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

function isAbsoluteHttpUrl(value: string): boolean {
    try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:'
    } catch {
        return false
    }
}

export const DEMO_CONFIG_ERROR =
    DEMO_MODE && !isAbsoluteHttpUrl(demoApiUrl)
        ? 'Demo mode is enabled, but VITE_DEMO_API_URL must be set to the dedicated demo API URL.'
        : null

// Never fall back to the production API when demo mode is enabled.
export const API_BASE_URL = DEMO_MODE
    ? (DEMO_CONFIG_ERROR ? '/__demo_api_not_configured__' : demoApiUrl.replace(/\/$/, ''))
    : (import.meta.env.VITE_API_URL ?? '')
