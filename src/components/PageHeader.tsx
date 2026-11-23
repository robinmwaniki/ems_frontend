interface Props {
    title: string
    subtitle?: string
    action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, action }: Props) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', minWidth: 0, marginBottom: '1.5rem' }}>
            <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 750, color: 'var(--text)' }}>{title}</h1>
                {subtitle && <p style={{ color: 'var(--muted)', margin: '.2rem 0 0', fontSize: '.9rem' }}>{subtitle}</p>}
            </div>
            {action && <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '.65rem', maxWidth: '100%' }}>{action}</div>}
        </div>
    )
}