type Variant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const colors: Record<Variant, { bg: string; color: string }> = {
    success: { bg: '#dcfce7', color: '#166534' },
    danger: { bg: '#fee2e2', color: '#991b1b' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    info: { bg: '#e0f2fe', color: '#075985' },
    neutral: { bg: '#f3f4f6', color: '#374151' },
}

interface Props {
    variant: Variant
    children: React.ReactNode
}

export default function Badge({ variant, children }: Props) {
    const c = colors[variant]
    return (
        <span
            style={{
                display: 'inline-block',
                padding: '.3em .75em',
                borderRadius: 999,
                fontSize: '.78rem',
                fontWeight: 600,
                background: c.bg,
                color: c.color,
            }}
        >
      {children}
    </span>
    )
}