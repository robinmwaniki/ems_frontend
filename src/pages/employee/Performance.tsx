import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { employeeContentApi } from '@/api/employeeContent'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Pager from '@/components/Pager'
import type { PerformanceReview } from '@/types/api'

const ratingLabel = (rating: number) => {
    if (rating >= 5) return 'Outstanding'
    if (rating >= 4) return 'Exceeds expectations'
    if (rating >= 3) return 'Meets expectations'
    if (rating >= 2) return 'Below expectations'
    return 'Needs improvement'
}

export default function MyPerformancePage() {
    const [page, setPage] = useState(0)
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['me-performance', page],
        queryFn: () => employeeContentApi.performance(page, 10),
    })

    return (
        <div>
            <PageHeader title="My Performance" subtitle="Review your feedback, ratings and development goals." />
            <Card>
                {isLoading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading performance reviews…</p>
                ) : isError ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Unable to load your performance reviews.</p>
                        <button type="button" onClick={() => refetch()}>Try again</button>
                    </div>
                ) : !data?.content.length ? (
                    <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                        No performance reviews are available yet.
                    </p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem', padding: '1.25rem' }}>
                        {data.content.map((review: PerformanceReview) => (
                            <article key={review.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1.1rem', minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.75rem' }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Performance review</h2>
                                        <p style={{ margin: '.3rem 0 0', color: 'var(--muted)', fontSize: '.85rem' }}>
                                            {review.reviewDate ? format(new Date(review.reviewDate), 'dd MMMM yyyy') : 'Date not provided'}
                                            {review.reviewer ? ` · Reviewed by ${review.reviewer}` : ''}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <strong style={{ fontSize: '1.2rem' }}>{review.rating}/5</strong>
                                        <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{ratingLabel(review.rating)}</div>
                                    </div>
                                </div>
                                {review.comments && (
                                    <section style={{ marginTop: '1rem' }}>
                                        <h3 style={{ margin: '0 0 .35rem', fontSize: '.85rem' }}>Feedback</h3>
                                        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{review.comments}</p>
                                    </section>
                                )}
                                {review.goals && (
                                    <section style={{ marginTop: '.85rem' }}>
                                        <h3 style={{ margin: '0 0 .35rem', fontSize: '.85rem' }}>Development goals</h3>
                                        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{review.goals}</p>
                                    </section>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </Card>
            {data && <Pager page={page} totalPages={data.totalPages} onPage={setPage} />}
        </div>
    )
}
