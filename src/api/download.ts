import { client } from './client'

/**
 * Downloads a protected PDF through the shared Axios client so the stored
 * Bearer token is attached to the request.
 */
export async function downloadPdf(path: string, filename: string): Promise<void> {
    const response = await client.get<Blob>(path, { responseType: 'blob' })
    const objectUrl = window.URL.createObjectURL(response.data)
    const anchor = window.document.createElement('a')

    anchor.href = objectUrl
    anchor.download = filename
    anchor.style.display = 'none'
    window.document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000)
}
