import * as Sentry from '@sentry/react'

type InitOptions = NonNullable<Parameters<typeof Sentry.init>[0]>
export type SentryEvent = Parameters<NonNullable<InitOptions['beforeSend']>>[0]

const SENSITIVE_TEXT_PATTERNS = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    /(?:\+?254|0)(?:7|1)\d{8}\b/g,
    /\b(?:KES|KSh|Ksh)\s?[\d,]+(?:\.\d{1,2})?\b/gi,
    /\b\d{5,16}\b/g,
    /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi,
    /\bBasic\s+[A-Za-z0-9+/]+=*/gi,
    /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    /\b(authorization|cookie|set-cookie|password|passwd|token|access[_ -]?token|refresh[_ -]?token|secret|api[_ -]?key|employee[_ -]?(?:id|number|no)|staff[_ -]?(?:id|number|no)|national[_ -]?(?:id|idnumber)|payroll|salary|wage|leave[_ -]?(?:reason|details|type)|amount|account[_ -]?(?:number|no)|bank[_ -]?(?:account|number))\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
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
    // Do not transmit identity, request payloads, arbitrary context, or breadcrumbs.
    delete event.user
    delete event.request
    delete event.extra
    delete event.contexts
    delete event.breadcrumbs
    delete event.tags
    delete event.fingerprint

    // Log parameters can contain serialized form values even when the message is safe.
    if (event.logentry) {
        delete event.logentry.params
        if (event.logentry.message) {
            event.logentry.message = redactSensitiveText(event.logentry.message)
        }
    }

    event.transaction = sanitizeTransaction(event.transaction)

    if (event.message) {
        event.message = redactSensitiveText(event.message)
    }

    event.exception?.values?.forEach((exception) => {
        if (exception.value) {
            exception.value = redactSensitiveText(exception.value)
        }

        exception.stacktrace?.frames?.forEach((frame) => {
            delete frame.vars
            delete frame.pre_context
            delete frame.post_context
            if (frame.filename) frame.filename = redactSensitiveText(frame.filename)
            if (frame.abs_path) frame.abs_path = redactSensitiveText(frame.abs_path)
        })
    })

    return event
}

export function initializeSentry(): boolean {
    const dsn = import.meta.env.VITE_SENTRY_DSN?.trim()

    if (!dsn) return false

    Sentry.init({
        dsn,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
        sendDefaultPii: false,
        release: import.meta.env.VITE_APP_RELEASE || undefined,
        tracesSampleRate: 0,
        profileSessionSampleRate: 0,
        maxBreadcrumbs: 0,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        beforeSend: scrubSentryEvent,
        beforeBreadcrumb: () => null,
    })

    return true
}
