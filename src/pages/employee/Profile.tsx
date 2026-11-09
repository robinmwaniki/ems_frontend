
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meApi } from '@/api/me'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import toast from 'react-hot-toast'

// Profile response returned by the Spring Boot backend.
interface MyProfile {
    profilePhoto?: string | null
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    departmentName?: string | null
    salary?: number | string | null
    hireDate?: string | null
}

// Editable profile fields.
interface ProfileForm {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
}

interface ProfileDetail {
    label: string
    value: string
}

const initialForm: ProfileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
}

export default function MyProfilePage() {
    const qc = useQueryClient()

    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState<ProfileForm>(initialForm)

    // Retrieve the employee's profile.
    const {
        data: profile,
        isLoading,
        isError,
    } = useQuery<MyProfile>({
        queryKey: ['me-profile'],
        queryFn: async () =>
            (await meApi.profile()) as unknown as MyProfile,
    })

    // Populate the form when profile data becomes available.
    useEffect(() => {
        if (profile) {
            setForm({
                firstName: profile.firstName ?? '',
                lastName: profile.lastName ?? '',
                email: profile.email ?? '',
                phoneNumber: profile.phoneNumber ?? '',
            })
        }
    }, [profile])

    // Update profile mutation.
    const updateMutation = useMutation({
        mutationFn: meApi.updateProfile,

        onSuccess: async () => {
            toast.success('Profile updated.')

            await qc.invalidateQueries({
                queryKey: ['me-profile'],
            })

            setEditing(false)
        },

        onError: () => {
            toast.error('Failed to update profile.')
        },
    })

    // Upload profile photo mutation.
    const photoMutation = useMutation({
        mutationFn: meApi.uploadPhoto,

        onSuccess: async () => {
            toast.success('Photo updated.')

            await qc.invalidateQueries({
                queryKey: ['me-profile'],
            })
        },

        onError: () => {
            toast.error('Failed to upload profile photo.')
        },
    })

    const inputStyle = {
        padding: '.65rem .9rem',
        border: '1px solid var(--border)',
        borderRadius: 10,
        fontSize: '.9rem',
        width: '100%',
    }

    // Loading state.
    if (isLoading) {
        return <p>Loading profile...</p>
    }

    // Error state.
    if (isError) {
        return (
            <div>
                <p>Unable to load your profile.</p>
                <Button
                    onClick={() =>
                        qc.invalidateQueries({
                            queryKey: ['me-profile'],
                        })
                    }
                >
                    Retry
                </Button>
            </div>
        )
    }

    if (!profile) {
        return <p>No profile information found.</p>
    }

    // Profile details.
    const details: ProfileDetail[] = [
        {
            label: 'First name',
            value: profile.firstName ?? '—',
        },
        {
            label: 'Last name',
            value: profile.lastName ?? '—',
        },
        {
            label: 'Email',
            value: profile.email ?? '—',
        },
        {
            label: 'Phone',
            value: profile.phoneNumber ?? '—',
        },
        {
            label: 'Department',
            value: profile.departmentName ?? '—',
        },
        {
            label: 'Salary',
            value:
                profile.salary != null
                    ? `KES ${Number(profile.salary).toLocaleString()}`
                    : '—',
        },
        {
            label: 'Hire date',
            value: profile.hireDate ?? '—',
        },
    ]

    return (
        <div>
            <PageHeader
                title="My Profile"
                subtitle="Your details as held by HR."
                action={
                    !editing && (
                        <Button onClick={() => setEditing(true)}>
                            Edit Profile
                        </Button>
                    )
                }
            />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '300px 1fr',
                    gap: '1.5rem',
                    alignItems: 'start',
                }}
            >
                {/* Profile information card */}
                <Card
                    style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            margin: '0 auto 1rem',
                            background: 'var(--brand-soft)',
                            color: 'var(--brand-dark)',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '3rem',
                            fontWeight: 700,
                            overflow: 'hidden',
                            border: '4px solid #fff',
                            boxShadow: 'var(--shadow)',
                        }}
                    >
                        {profile.profilePhoto ? (
                            <img
                                src={meApi.photoUrl()}
                                alt="Profile"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            profile.firstName.charAt(0).toUpperCase()
                        )}
                    </div>

                    <h3 style={{ marginBottom: '.25rem' }}>
                        {profile.firstName} {profile.lastName}
                    </h3>

                    <p
                        style={{
                            color: 'var(--muted)',
                            fontSize: '.875rem',
                        }}
                    >
                        {profile.departmentName ?? 'No department assigned'}
                    </p>

                    <div style={{ marginTop: '1rem' }}>
                        <label
                            htmlFor="profile-photo"
                            style={{
                                fontSize: '.8rem',
                                color: 'var(--muted)',
                            }}
                        >
                            Update photo (JPEG/PNG/WebP, max 2 MB)
                        </label>

                        <input
                            id="profile-photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={photoMutation.isPending}
                            style={{
                                marginTop: '.5rem',
                                fontSize: '.85rem',
                                width: '100%',
                            }}
                            onChange={(e) => {
                                const file = e.target.files?.[0]

                                if (!file) return

                                const allowedTypes = [
                                    'image/jpeg',
                                    'image/png',
                                    'image/webp',
                                ]

                                if (!allowedTypes.includes(file.type)) {
                                    toast.error(
                                        'Please select a JPEG, PNG or WebP image.',
                                    )
                                    e.target.value = ''
                                    return
                                }

                                if (file.size > 2 * 1024 * 1024) {
                                    toast.error(
                                        'Image size must not exceed 2 MB.',
                                    )
                                    e.target.value = ''
                                    return
                                }

                                photoMutation.mutate(file)
                                e.target.value = ''
                            }}
                        />

                        {photoMutation.isPending && (
                            <p
                                style={{
                                    fontSize: '.8rem',
                                    color: 'var(--muted)',
                                }}
                            >
                                Uploading photo...
                            </p>
                        )}
                    </div>
                </Card>

                {/* Profile details card */}
                <Card style={{ padding: '1.5rem' }}>
                    {editing ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                updateMutation.mutate(form)
                            }}
                            style={{
                                display: 'grid',
                                gap: '.75rem',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '1rem',
                                    marginBottom: '.25rem',
                                }}
                            >
                                Edit Contact Details
                            </h3>

                            <p
                                style={{
                                    color: 'var(--muted)',
                                    fontSize: '.85rem',
                                    margin: 0,
                                }}
                            >
                                Salary, department and hire date are managed
                                by HR.
                            </p>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '.75rem',
                                }}
                            >
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        style={{
                                            fontSize: '.8rem',
                                            color: 'var(--muted)',
                                        }}
                                    >
                                        First Name
                                    </label>

                                    <input
                                        id="firstName"
                                        required
                                        value={form.firstName}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                firstName: e.target.value,
                                            }))
                                        }
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lastName"
                                        style={{
                                            fontSize: '.8rem',
                                            color: 'var(--muted)',
                                        }}
                                    >
                                        Last Name
                                    </label>

                                    <input
                                        id="lastName"
                                        required
                                        value={form.lastName}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                lastName: e.target.value,
                                            }))
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    style={{
                                        fontSize: '.8rem',
                                        color: 'var(--muted)',
                                    }}
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            email: e.target.value,
                                        }))
                                    }
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phoneNumber"
                                    style={{
                                        fontSize: '.8rem',
                                        color: 'var(--muted)',
                                    }}
                                >
                                    Phone
                                </label>

                                <input
                                    id="phoneNumber"
                                    required
                                    value={form.phoneNumber}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            phoneNumber: e.target.value,
                                        }))
                                    }
                                    style={inputStyle}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '.5rem',
                                }}
                            >
                                <Button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending
                                        ? 'Saving...'
                                        : 'Save'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setForm({
                                            firstName: profile.firstName ?? '',
                                            lastName: profile.lastName ?? '',
                                            email: profile.email ?? '',
                                            phoneNumber:
                                                profile.phoneNumber ?? '',
                                        })

                                        setEditing(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <dl style={{ margin: 0 }}>
                            {details.map(({ label, value }) => (
                                <div
                                    key={label}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '160px 1fr',
                                        gap: '.5rem',
                                        padding: '.85rem 0',
                                        borderBottom:
                                            '1px solid var(--border)',
                                    }}
                                >
                                    <dt
                                        style={{
                                            color: 'var(--muted)',
                                            fontWeight: 500,
                                            fontSize: '.875rem',
                                        }}
                                    >
                                        {label}
                                    </dt>

                                    <dd
                                        style={{
                                            margin: 0,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </Card>
            </div>
        </div>
    )
}
