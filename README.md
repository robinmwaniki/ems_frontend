# Employee Management System — Frontend

A role-aware single-page application for the Employee Management System, built with **React, TypeScript, and Vite**. It provides separate staff and employee workspaces and communicates with the EMS backend through HTTP APIs.

> This repository contains the frontend client. The backend is maintained in [employment-management-system](https://github.com/robinmwaniki/employment-management-system).

## Features

**Staff workspace**
- Staff dashboard and employee management.
- Department management.
- Leave and payroll pages.
- Announcements and user administration.

**Employee workspace**
- Employee dashboard and personal profile.
- Leave requests and history.
- Attendance and payroll information.
- Notifications and password change.

**Client capabilities**
- React Router navigation and protected role-aware routes.
- Axios API client with bearer-token attachment.
- Session-based token persistence.
- TanStack Query for server state.
- Zustand for client authentication state.
- Toast notifications.
- Vitest and Testing Library test tooling.

## Architecture

~~~mermaid
flowchart LR
    USER[User] --> APP[React Application]
    APP --> ROUTER[React Router]
    ROUTER --> GUARD[RequireAuth / Role Guard]
    GUARD --> STAFF[Staff Workspace]
    GUARD --> EMP[Employee Workspace]
    STAFF --> API[Axios API Client]
    EMP --> API
    API -->|JSON + Bearer token| SERVER[EMS Backend or Gateway]
    SERVER --> DB[(Backend Database)]
~~~

### Authentication and API request flow

~~~mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant Store as Zustand Store
    participant API as Axios Client
    participant Server as EMS API
    User->>UI: Submit login form
    UI->>Server: POST /api/auth/login
    Server-->>UI: Access token and user details
    UI->>Store: Save authentication state
    UI->>API: Request protected resource
    API->>API: Attach bearer token
    API->>Server: GET /api/...
    Server-->>API: JSON response
    API-->>UI: Update page state
~~~

## Technology stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Language | TypeScript |
| Build / dev server | Vite 8 |
| Routing | React Router |
| HTTP | Axios |
| Server state | TanStack Query |
| Client state | Zustand |
| Notifications | React Hot Toast |
| Date utilities | date-fns |
| Tests | Vitest, Testing Library |
| Linting | ESLint |

## Getting started

### Prerequisites

- Node.js compatible with Vite 8 (Node.js 22.12+ recommended).
- npm.
- A reachable EMS backend or gateway.

### Clone and install

~~~bash
git clone https://github.com/robinmwaniki/ems_frontend.git
cd ems_frontend
npm install
~~~

### Configure the API base URL

Create .env.local in the project root:

~~~dotenv
VITE_API_URL=http://localhost:8080
~~~

When using the local EMS Gateway instead, set VITE_API_URL to http://localhost:9000.

The Axios client defaults to the current origin when VITE_API_URL is not set. Restart Vite after changing environment variables. Only expose non-secret configuration through VITE_ variables because Vite embeds them in the client bundle.

### Run locally

~~~bash
npm run dev
~~~

Vite prints the local URL, normally http://localhost:5173.

## Application routes

| Route | Allowed roles |
| --- | --- |
| /login | Public |
| /dashboard, /employees, /departments | Admin, HR manager |
| /leave, /payroll, /announcements, /users | Admin, HR manager |
| /employee/dashboard | Employee, admin, HR manager |
| /employee/profile, /employee/leave | Employee, admin, HR manager |
| /employee/attendance, /employee/payroll | Employee, admin, HR manager |
| /employee/notifications, /employee/change-password | Employee, admin, HR manager |

Frontend route guards improve navigation and user experience; the backend must independently authorize every protected operation.

## Backend integration

Feature API modules live under src/api/. The shared Axios client reads the access token from sessionStorage, attaches it as a bearer token, handles authentication failures, and displays request errors through toast notifications.

Keep endpoint paths and TypeScript request/response types aligned with the backend API contract.

## Quality checks

~~~bash
npm run typecheck
npm run lint
npm test
npm run build
~~~

Use npm run test:watch for interactive test development.

## Project structure

~~~text
src/
├── api/          # HTTP client and feature API modules
├── components/   # Shared components and route guards
├── layouts/      # Staff and employee layouts
├── pages/
│   ├── staff/    # HR and administration pages
│   └── employee/ # Employee self-service pages
├── store/        # Zustand stores
├── test/         # Test setup and helpers
├── types/        # API and domain types
├── App.tsx       # Route definitions
└── main.tsx      # Application bootstrap
~~~

## Related repositories

- [EMS Backend](https://github.com/robinmwaniki/employment-management-system)
- [EMS Gateway](https://github.com/robinmwaniki/ems-gateway)

## License

No license file is currently declared. Unless a license is added, standard copyright restrictions apply.

## Maintainer

**Robin Mwaniki** · [GitHub](https://github.com/robinmwaniki)


## Privacy-safe error monitoring

The frontend uses the official `@sentry/react` SDK when `VITE_SENTRY_DSN` is configured. If the DSN is empty or absent, monitoring is not initialized and the application runs normally.

Configure these non-secret Vite values in the deployment environment:

~~~dotenv
VITE_SENTRY_DSN=https://public-key@example.ingest.sentry.io/project-id
VITE_APP_RELEASE=your-release-id
~~~

The DSN is a public ingestion identifier, not an authentication secret. Never put a Sentry auth token, API token, or other private credential in a `VITE_` variable.

### Privacy controls

- The SDK is not configured to send default PII; event payloads are additionally scrubbed before transmission.
- Request objects, user context, custom tags, extra context, and breadcrumbs are removed before an event is sent.
- Error messages are scrubbed for email addresses, phone numbers, Kenyan currency amounts, and numeric identifiers.
- Transaction names are restricted to known application routes; unknown paths are replaced with a generic route label.
- Session Replay is not enabled. Both replay sample rates are explicitly zero.
- Error-boundary fallback UI does not display exception messages or employee data.

### Source maps

Production builds generate source maps. To upload them, configure these GitHub Actions secrets: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`. The production deploy workflow uploads source maps only when all three are present. The auth token is used only in GitHub Actions and is never exposed to the browser bundle.

### Verification

Set `VITE_SENTRY_DSN` to a test project's DSN, deploy, and trigger a controlled error in a non-production test environment. Confirm the event appears in Sentry without user data, request payloads, tokens, or breadcrumbs.
## Branch and release workflow

The repository uses a case-sensitive promotion path:

`feature/<short-description>` → `Develop` → `main`

- Open feature pull requests against `Develop`; do not push directly to protected branches.
- A feature PR must pass dependency installation, tests, TypeScript checks, lint, production build, branch-flow validation, and the Vercel preview checks before merging.
- Promote `Develop` to `main` only through a dedicated pull request after release-specific integrations and deployment configuration have been verified.
- Preserve the exact branch capitalization: `Develop` is not the same branch name as `develop`.
