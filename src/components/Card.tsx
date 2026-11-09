import type { CSSProperties, ReactNode } from 'react'

interface Props {
    children: ReactNode
    style?: CSSProperties
}

export default function Card({ children, style }: Props) {
    return (
        <div
            style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                ...style,
            }}
        >
            {children}
        </div>
    )
}