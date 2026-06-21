import React from 'react';
import { useForm } from '@inertiajs/react';
import { useSnackbar } from 'notistack';

const PREFERENCES = [
    { key: 'email_shared_with_me', label: 'Email on file shared with me', type: 'email' },
    { key: 'email_share_accessed', label: 'Email on share accessed / downloaded', type: 'email' },
    { key: 'email_new_device_login', label: 'Email on new device login', type: 'email' },
    { key: 'email_password_changed', label: 'Email on password changed', type: 'email' },
    { key: 'email_account_lockout', label: 'Email on account lockout', type: 'email' },
    { key: 'inapp_shared_with_me', label: 'In-app notification on file shared', type: 'inapp' },
    { key: 'inapp_share_accessed', label: 'In-app notification on share accessed', type: 'inapp' },
];

export default function NotificationPreferences({ preferences = {} }) {
    const { enqueueSnackbar } = useSnackbar();

    const { data, setData, put, processing, errors } = useForm({
        preferences: {
            email_shared_with_me: preferences.email_shared_with_me ?? true,
            email_share_accessed: preferences.email_share_accessed ?? true,
            email_new_device_login: preferences.email_new_device_login ?? true,
            email_password_changed: preferences.email_password_changed ?? true,
            email_account_lockout: preferences.email_account_lockout ?? true,
            inapp_shared_with_me: preferences.inapp_shared_with_me ?? true,
            inapp_share_accessed: preferences.inapp_share_accessed ?? true,
        },
    });

    const handleToggle = (key) => {
        setData('preferences', {
            ...data.preferences,
            [key]: !data.preferences[key],
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        put('/profile/notification-preferences', {
            preserveScroll: true,
            onSuccess: () => {
                enqueueSnackbar('Notification preferences saved', { variant: 'success' });
            },
            onError: () => {
                enqueueSnackbar('Failed to save preferences', { variant: 'error' });
            },
        });
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-surface-900">Notification Preferences</h3>
            <p className="mt-1 text-sm text-surface-500">Choose how you receive notifications</p>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
                {/* Email notifications */}
                <div>
                    <h4 className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-2">
                        <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        Email Notifications
                    </h4>
                    <div className="space-y-2">
                        {PREFERENCES.filter(p => p.type === 'email').map((pref) => (
                            <ToggleItem
                                key={pref.key}
                                label={pref.label}
                                checked={data.preferences[pref.key]}
                                onChange={() => handleToggle(pref.key)}
                            />
                        ))}
                    </div>
                </div>

                <div className="border-t border-surface-200" />

                {/* In-app notifications */}
                <div>
                    <h4 className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-2">
                        <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        In-App Notifications
                    </h4>
                    <div className="space-y-2">
                        {PREFERENCES.filter(p => p.type === 'inapp').map((pref) => (
                            <ToggleItem
                                key={pref.key}
                                label={pref.label}
                                checked={data.preferences[pref.key]}
                                onChange={() => handleToggle(pref.key)}
                            />
                        ))}
                    </div>
                </div>

                {errors.preferences && (
                    <p className="text-xs text-red-500">{errors.preferences}</p>
                )}

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ToggleItem({ label, checked, onChange }) {
    return (
        <label className="flex items-center justify-between py-2 cursor-pointer group">
            <span className="text-sm text-surface-700 group-hover:text-surface-900 transition-colors">{label}</span>
            <button
                type="button"
                onClick={onChange}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    checked ? 'bg-primary-600' : 'bg-surface-300'
                }`}
                role="switch"
                aria-checked={checked}
            >
                <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                        checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
            </button>
        </label>
    );
}
