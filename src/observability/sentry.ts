import * as Sentry from '@sentry/react'

type InitOptions = NonNullable<Parameters<typeof Sentry.init>[0]>
export type SentryEvent = Parameters<NonNullable<InitOptions['beforeSend']>>[0]

const SENSITIVE_TEXT_PATTERNS = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    /(?:\+?254|0)7\d{8}\b/g,
    /\bKES\s?[\d,]+(?:\.\d{1,2})?\b/gi,
    /\b\d{7,12}\b/g,
]

const SAFE_ROUTES = new Set([
    '/login',
    '/dashboard',
    '/employees',
    '/departments',
    '/leave',
    '/payroll',
    '/announcements',
    '/users',
    '/employee/dashboard',
    '/employee/profile',
    '/employee/leave',
    '/employee/attendance',
    '/employee/payroll',
    '/employee/notifications',
    '/employee/change-password',
])

export function redactSensitiveText(value: string): string {
    return SENSITIVE_TEXT_PATTERNS.reduce(
        (result, pattern) => result.replace(pattern, '[Filtered]'),
        value,
    )
}

function sanitizeTransaction(value: string | undefined): string | undefined {
    if (!value) return undefined

    const path = value.split('?')[0].split('#')[0]
    return SAFE_ROUTES.has(path) ? path : '/[filtered-route]'
}

export function scrubSentryEvent(event: SentryEvent): SentryEvent | null {
    // Do not transmit any request, identity, arbitrary context, or breadcrumb data.
    delete event.user
    delete event.request
    delete event.extra
    delete event.contexts
    delete event.breadcrumbs
    delete event.tags
    delete event.fingerprint

    event.transaction = sanitizeTransaction(event.transaction)

    if (event.message) {
        event.message = redactSensitiveText(event.message)
    }

    if (event.logentry?.message) {
        event.logentry.message = redactSensitiveText(event.logentry.message)
    }

    event.exception?.values?.forEach((exception) => {
        if (exception.value) {
            exception.value = redactSensitiveText(exception.value)
        }

        exception.stacktrace?.frames?.forEach((frame) => {
            delete frame.vars
            delete frame.pre_context
            delete frame.post_context
        })
    })

    return event
}

export function initializeSentry(): boolean {
    const dsn = import.meta.env.VITE_SENTRY_DSN?.trim()

    if (!dsn) return false

    Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_RELEASE || undefined,
        maxBreadcrumbs: 0,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        beforeSend: scrubSentryEvent,
        beforeBreadcrumb: () => null,
    })

    return true
}
