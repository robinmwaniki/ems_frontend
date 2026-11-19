import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Unmount rendered components and clear browser storage after every test,
// so tests stay independent of each other.
afterEach(() => {
    cleanup()
    sessionStorage.clear()
    localStorage.clear()
})