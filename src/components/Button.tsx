import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variants: Record<Variant, React.CSSProperties> = {
    primary: { background: 'var(--brand)', color: '#fff', border: '1px solid var(--brand)' },
    secondary: { background: 'var(--surface-muted)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' },
    ghost: { background: 'transparent', color: 'var(--brand)', border: '1px solid var(--border)' },
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: 'sm' | 'md'
}

export default function Button({ variant = 'primary', size = 'md', style, ...props }: Props) {
    return (
        <button
            style={{
                ...variants[variant],
                padding: size === 'sm' ? '.35rem .7rem' : '.6rem 1rem',
                borderRadius: size === 'sm' ? 8 : 10,
                fontSize: size === 'sm' ? '.8125rem' : '.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.4rem',
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                transition: 'opacity .15s',
                ...style,
            }}
            onMouseEnter={(e) => { if (!props.disabled) e.currentTarget.style.opacity = '.85' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            {...props}
        />
    )
}