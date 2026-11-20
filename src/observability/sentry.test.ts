import * as Sentry from '@sentry/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeSentry, redactSensitiveText, scrubSentryEvent } from './sentry'

vi.mock('@sentry/react', () => ({
    init: vi.fn(),
}))

describe('Sentry initialization', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubEnv('VITE_SENTRY_DSN', '')
    })

    it('does not initialize when the DSN is absent', () => {
        expect(initializeSentry()).toBe(false)
        expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('initializes with privacy protections when a DSN exists', () => {
        vi.stubEnv('VITE_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1')

        expect(initializeSentry()).toBe(true)
        expect(Sentry.init).toHaveBeenCalledWith(
            expect.objectContaining({
                dsn: 'https://public@example.ingest.sentry.io/1',
                sendDefaultPii: false,
                tracesSampleRate: 0,
                profilesSampleRate: 0,
                maxBreadcrumbs: 0,
                replaysSessionSampleRate: 0,
                replaysOnErrorSampleRate: 0,
                beforeSend: scrubSentryEvent,
                beforeBreadcrumb: expect.any(Function),
            }),
        )
    })
})

describe('Sentry event scrubbing', () => {
    it('redacts email, phone, currency, and numeric identifiers', () => {
        expect(
            redactSensitiveText('alice@example.com +254712345678 KES 25,000.00 ID 12345678'),
        ).toBe('[Filtered] [Filtered] [Filtered] ID [Filtered]')
    })

    it('redacts credentials, auth headers, employee fields, and payroll values', () => {
        const text = 'Authorization: Bearer abc.def.ghi cookie=session123 employeeId=123456 salary=KES 85000 password=hunter2';
        expect(redactSensitiveText(text)).not.toMatch(/abc\\.def\\.ghi|session123|123456|85000|hunter2/);
        expect(redactSensitiveText(text).match(/\\[Filtered\\]/g)).toHaveLength(5)
    })

    it('removes user, request, context, extras, tags, and breadcrumbs', () => {
        const event = {
            user: { email: 'alice@example.com' },
            request: { headers: { Authorization: 'Bearer secret' }, data: 'payroll' },
            contexts: { employee: { id: '12345678' } },
            extra: { salary: 100000 },
            tags: { employeeId: '12345678' },
            breadcrumbs: [{ message: 'opened payroll' }],
            logentry: { message: 'Employee error', params: ['salary=50000'] },
            transaction: '/employees/12345678?search=alice@example.com',
            message: 'Failed for alice@example.com',
        } as unknown as Parameters<typeof scrubSentryEvent>[0]

        const result = scrubSentryEvent(event)

        expect(result).not.toBeNull()
        expect(result?.user).toBeUndefined()
        expect(result?.request).toBeUndefined()
        expect(result?.contexts).toBeUndefined()
        expect(result?.extra).toBeUndefined()
        expect(result?.tags).toBeUndefined()
        expect(result?.breadcrumbs).toBeUndefined()
        expect(result?.logentry?.params).toBeUndefined()
        expect(result?.transaction).toBe('/[filtered-route]')
        expect(result?.message).toBe('Failed for [Filtered]')
    })

    it('preserves known static application routes without query strings', () => {
        const event = {
            transaction: '/employee/dashboard?tab=payroll',
        } as unknown as Parameters<typeof scrubSentryEvent>[0]

        expect(scrubSentryEvent(event)?.transaction).toBe('/employee/dashboard')
    })
})
