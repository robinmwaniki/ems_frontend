import Button from './Button'

interface Props {
    page: number
    totalPages: number
    onPage: (p: number) => void
}

export default function Pager({ page, totalPages, onPage }: Props) {
    if (totalPages <= 1) return null
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '.5rem',
                marginTop: '1.5rem',
            }}
        >
            <Button
                variant="ghost"
                size="sm"
                disabled={page === 0}
                onClick={() => onPage(page - 1)}
            >
                Previous
            </Button>
            <span style={{ color: 'var(--muted)', fontSize: '.875rem' }}>
        Page {page + 1} of {totalPages}
      </span>
            <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => onPage(page + 1)}
            >
                Next
            </Button>
        </div>
    )
}