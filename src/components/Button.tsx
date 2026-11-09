import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variants: Record<Variant, React.CSSProperties> = {
    primary: {
        background: 'var(--brand)',
        color: '#fff',
        border: 'none',
    },
    secondary: {
        background: '#f3f4f6',
        color: '#374151',
        border: 'none',
    },
    danger: {
        background: '#fee2e2',
        color: '#991b1b',
        border: 'none',
    },
    ghost: {
        background: 'transparent',
        color: 'var(--brand)',
        border: '1px solid #c7d2fe',
    },
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: 'sm' | 'md'
}

export default function Button({
                                   variant = 'primary',
                                   size = 'md',
                                   style,
                                   ...props
                               }: Props) {
    return (
        <button
            style={{
                ...variants[variant],
                padding: size === 'sm' ? '.35rem .7rem' : '.6rem 1rem',
                borderRadius: size === 'sm' ? 8 : 10,
                fontSize: size === 'sm' ? '.8125rem' : '.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                transition: 'opacity .15s',
                ...style,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '.85')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            {...props}
        />
    )
}