import { useState } from 'react'
import { authApi } from '@/api/auth'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import toast from 'react-hot-toast'

export default function ChangePasswordPage() {
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirm: '',
    })
    const [loading, setLoading] = useState(false)

    const inputStyle = {
        padding: '.65rem .9rem',
        border: '1px solid var(--border)',
        borderRadius: 10,
        fontSize: '.9rem',
        width: '100%',
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.newPassword !== form.confirm) {
            toast.error('New passwords do not match.')
            return
        }
        setLoading(true)
        try {
            await authApi.changePassword(form.currentPassword, form.newPassword)
            toast.success('Password updated.')
            setForm({ currentPassword: '', newPassword: '', confirm: '' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <PageHeader
                title="Change Password"
                subtitle="Choose a strong password you don't use elsewhere."
            />
            <Card style={{ maxWidth: 480, padding: '1.5rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '.75rem' }}>
                    <div>
                        <label style={{ fontSize: '.85rem', fontWeight: 500 }}>
                            Current Password
                        </label>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={form.currentPassword}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, currentPassword: e.target.value }))
                            }
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '.85rem', fontWeight: 500 }}>
                            New Password
                        </label>
                        <input
                            type="password"
                            required
                            autoComplete="new-password"
                            minLength={10}
                            value={form.newPassword}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, newPassword: e.target.value }))
                            }
                            style={inputStyle}
                        />
                        <p style={{ color: 'var(--muted)', fontSize: '.8rem', margin: '.3rem 0 0' }}>
                            At least 10 characters, with a letter and a digit.
                        </p>
                    </div>
                    <div>
                        <label style={{ fontSize: '.85rem', fontWeight: 500 }}>
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            required
                            autoComplete="new-password"
                            value={form.confirm}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, confirm: e.target.value }))
                            }
                            style={inputStyle}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        style={{ marginTop: '.5rem' }}
                    >
                        {loading ? 'Updating…' : 'Update Password'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}