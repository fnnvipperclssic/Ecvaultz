import React, { useState } from 'react';
import { useForm, usePage, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AvatarUpload from '@/Components/AvatarUpload';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import NotificationPreferences from '@/Components/NotificationPreferences';

export default function Profile({ sessions = [] }) {
    const { auth, flash } = usePage().props;

    const profileForm = useForm({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        current_password: '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
        two_factor_code: '',
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const updateProfile = (e) => {
        e.preventDefault();
        profileForm.patch('/profile');
    };

    const updatePassword = (e) => {
        e.preventDefault();
        passwordForm.put('/profile/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const deleteAccount = (e) => {
        e.preventDefault();
        deleteForm.delete('/profile/account', {
            onSuccess: () => router.visit('/login'),
            onError: () => {},
        });
    };

    const logoutOtherDevices = () => {
        const password = prompt('Enter your password to sign out of other devices:');
        if (!password) return;
        router.post('/profile/logout-others', { password });
    };

    return (
        <AuthenticatedLayout header="Profile & Settings">
            <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
                {/* Profile */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-surface-900">Profile information</h3>
                    <p className="mt-1 text-sm text-surface-500">Update your account profile details</p>

                    {/* Avatar Upload */}
                    <div className="mt-6 mb-6 pb-6 border-b border-surface-200">
                        <AvatarUpload currentAvatarUrl={auth?.user?.avatar_url} />
                    </div>

                    <form onSubmit={updateProfile} className="space-y-4">
                        <div>
                            <label className="label">Name</label>
                            <input
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className={`input ${profileForm.errors.name ? 'input-error' : ''}`}
                                required
                            />
                            {profileForm.errors.name && <p className="mt-1 text-xs text-red-500">{profileForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                className={`input ${profileForm.errors.email ? 'input-error' : ''}`}
                                required
                            />
                            {profileForm.errors.email && <p className="mt-1 text-xs text-red-500">{profileForm.errors.email}</p>}
                        </div>

                        {profileForm.data.email !== auth?.user?.email && (
                            <div>
                                <label className="label">Current password (required for email change)</label>
                                <input
                                    type="password"
                                    value={profileForm.data.current_password}
                                    onChange={(e) => profileForm.setData('current_password', e.target.value)}
                                    className={`input ${profileForm.errors.current_password ? 'input-error' : ''}`}
                                    placeholder="Enter current password"
                                />
                                {profileForm.errors.current_password && (
                                    <p className="mt-1 text-xs text-red-500">{profileForm.errors.current_password}</p>
                                )}
                            </div>
                        )}

                        <button type="submit" disabled={profileForm.processing} className="btn-primary">
                            Save changes
                        </button>
                    </form>
                </div>

                {/* Password */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-surface-900">Change password</h3>
                    <p className="mt-1 text-sm text-surface-500">Use a strong password (min 12 characters)</p>

                    <form onSubmit={updatePassword} className="mt-6 space-y-4">
                        <div>
                            <label className="label">Current password</label>
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                className={`input ${passwordForm.errors.current_password ? 'input-error' : ''}`}
                                required
                            />
                            {passwordForm.errors.current_password && <p className="mt-1 text-xs text-red-500">{passwordForm.errors.current_password}</p>}
                        </div>
                        <div>
                            <label className="label">New password</label>
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                className={`input ${passwordForm.errors.password ? 'input-error' : ''}`}
                                required
                            />
                            {passwordForm.errors.password && <p className="mt-1 text-xs text-red-500">{passwordForm.errors.password}</p>}
                            {/* Password strength meter */}
                            <PasswordStrengthMeter password={passwordForm.data.password} />
                        </div>
                        <div>
                            <label className="label">Confirm new password</label>
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        <button type="submit" disabled={passwordForm.processing} className="btn-primary">
                            Update password
                        </button>
                    </form>
                </div>

                {/* Two-Factor Auth */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-surface-900">Two-Factor Authentication</h3>
                    <p className="mt-1 text-sm text-surface-500">
                        Add an extra layer of security to your account
                    </p>

                    <div className="mt-4">
                        {auth?.user?.two_factor_enabled ? (
                            <div className="flex items-center justify-between rounded-lg bg-security-glow/60 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-green-700">Enabled</span>
                                </div>
                                <button onClick={() => {
                                    const password = prompt('Enter your password to disable 2FA:');
                                    if (password) router.post('/2fa/disable', { password });
                                }} className="btn-secondary text-sm">
                                    Disable 2FA
                                </button>
                            </div>
                        ) : (
                            <a href="/2fa/setup" className="btn-secondary">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Set up 2FA
                            </a>
                        )}
                    </div>
                </div>

                {/* Recovery Kit */}
                <div className="card border-amber-500/20">
                    <h3 className="text-lg font-semibold text-surface-900">Encryption Recovery Kit</h3>
                    <p className="mt-1 text-sm text-surface-500">
                        Your 12-word recovery phrase can restore access to encrypted files if you lose your password
                    </p>
                    <Link href="/profile/recovery-kit" className="btn-secondary mt-4 text-sm inline-flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                        View Recovery Phrase
                    </Link>
                </div>

                {/* Sessions */}
                {sessions.length > 0 && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-surface-900">Active sessions</h3>
                        <p className="mt-1 text-sm text-surface-500">Devices currently signed in to your account</p>

                        <div className="mt-4 space-y-3">
                            {sessions.map((session) => (
                                <div key={session.id} className="flex items-center justify-between rounded-lg border border-surface-200 p-3">
                                    <div>
                                        <p className="text-sm font-medium text-surface-700">
                                            {session.ip_address}
                                            {session.is_current && (
                                                <span className="ml-2 badge badge-success">Current</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-surface-500">Last active {session.last_activity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={logoutOtherDevices} className="btn-secondary mt-4 text-sm">
                            Sign out all other devices
                        </button>
                    </div>
                )}

                {/* Notification Preferences */}
                <NotificationPreferences preferences={auth?.notification_preferences || {}} />

                {/* Danger Zone */}
                <div className="card border-red-200">
                    <h3 className="text-lg font-semibold text-red-600">Danger zone</h3>
                    <p className="mt-1 text-sm text-surface-500">
                        Permanently delete your account and all associated data
                    </p>

                    {!showDeleteConfirm ? (
                        <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger mt-4">
                            Delete account
                        </button>
                    ) : (
                        <form onSubmit={deleteAccount} className="mt-4 space-y-4 rounded-lg border border-red-200 bg-red-500/10 p-4">
                            <p className="text-sm text-red-700">This action is irreversible. All your files will be permanently deleted.</p>
                            <div>
                                <label className="label text-red-700">Confirm your password</label>
                                <input
                                    type="password"
                                    value={deleteForm.data.password}
                                    onChange={(e) => deleteForm.setData('password', e.target.value)}
                                    className="input"
                                    required
                                />
                                {deleteForm.errors.password && <p className="mt-1 text-xs text-red-500">{deleteForm.errors.password}</p>}
                            </div>
                            {auth?.user?.two_factor_enabled && (
                                <div>
                                    <label className="label text-red-700">2FA code</label>
                                    <input
                                        type="text"
                                        value={deleteForm.data.two_factor_code}
                                        onChange={(e) => deleteForm.setData('two_factor_code', e.target.value)}
                                        className="input"
                                        placeholder="6-digit code"
                                    />
                                    {deleteForm.errors.two_factor_code && <p className="mt-1 text-xs text-red-500">{deleteForm.errors.two_factor_code}</p>}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button type="submit" className="btn-danger flex-1">
                                    Confirm deletion
                                </button>
                                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
