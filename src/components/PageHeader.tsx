interface Props {
    title: string
    subtitle?: string
    action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, action }: Props) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}
        >
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{title}</h1>
                {subtitle && (
                    <p style={{ color: 'var(--muted)', margin: '.2rem 0 0', fontSize: '.9rem' }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}