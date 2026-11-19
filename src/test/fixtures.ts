import type { MeResponse, Role } from '@/types/api'

// Builds an authenticated user for tests. Pass overrides for specific fields.
export function makeUser(
    role: Role,
    overrides: Partial<MeResponse> = {},
): MeResponse {
    return {
        userId: 1,
        username: 'test.user',
        role,
        employeeId: role === 'ROLE_EMPLOYEE' ? 10 : null,
        firstName: 'Test',
        lastName: 'User',
        profilePhoto: null,
        ...overrides,
    }
}