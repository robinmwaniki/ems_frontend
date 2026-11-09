import type { ReactNode } from 'react'

interface Props {
    head: string[]
    children: ReactNode
    empty?: string
}

export default function Table({ head, children, empty = 'No records found.' }: Props) {
    return (
        <div style={{ overflowX: 'auto' }}>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '.9rem',
                }}
            >
                <thead>
                <tr style={{ background: '#f9fafb' }}>
                    {head.map((h) => (
                        <th
                            key={h}
                            style={{
                                padding: '.9rem 1.1rem',
                                textAlign: 'left',
                                fontSize: '.72rem',
                                fontWeight: 600,
                                letterSpacing: '.05em',
                                textTransform: 'uppercase',
                                color: 'var(--muted)',
                                borderBottom: '1px solid var(--border)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {h}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
            {!children && (
                <div
                    style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: 'var(--muted)',
                    }}
                >
                    {empty}
                </div>
            )}
        </div>
    )
}

export function Td({ children }: { children: ReactNode }) {
    return (
        <td
            style={{
                padding: '.9rem 1.1rem',
                borderBottom: '1px solid var(--border)',
                verticalAlign: 'middle',
            }}
        >
            {children}
        </td>
    )
}