import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { client } from '@/api/client'

interface Props {
    srcPath: string
    alt: string
    fallback: string
    style?: CSSProperties
}

/**
 * Loads protected images through Axios so the request includes the JWT
 * Authorization header. The temporary object URL is revoked on cleanup.
 */
export default function ProtectedImage({
    srcPath,
    alt,
    fallback,
    style,
}: Props) {
    const [src, setSrc] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        let objectUrl: string | null = null

        setSrc(null)

        client
            .get<Blob>(srcPath, { responseType: 'blob' })
            .then(({ data }) => {
                const nextUrl = window.URL.createObjectURL(data)

                if (active) {
                    objectUrl = nextUrl
                    setSrc(nextUrl)
                } else {
                    window.URL.revokeObjectURL(nextUrl)
                }
            })
            .catch(() => {
                if (active) setSrc(null)
            })

        return () => {
            active = false
            if (objectUrl) window.URL.revokeObjectURL(objectUrl)
        }
    }, [srcPath])

    if (!src) {
        return (
            <span
                aria-label={alt}
                style={{
                    ...style,
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                {fallback}
            </span>
        )
    }

    return <img src={src} alt={alt} style={style} />
}
