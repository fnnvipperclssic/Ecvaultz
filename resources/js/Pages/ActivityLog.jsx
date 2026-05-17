import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ActivityLog({ logs, actionTypes, filters }) {
    const actionLabels = {
        'login': 'Logged in',
        'logout': 'Logged out',
        'register': 'Account created',
        'upload': 'File uploaded',
        'download': 'File downloaded',
        'delete': 'File moved to trash',
        'permanent_delete': 'File permanently deleted',
        'restore': 'File restored',
        'file_shared': 'File shared',
        'file_unshared': 'Share removed',
        'password_changed': 'Password changed',
        'password_reset_complete': 'Password reset',
        'password_reset_requested': 'Password reset requested',
        'profile_updated': 'Profile updated',
        '2fa_enabled': '2FA enabled',
        '2fa_disabled': '2FA disabled',
        '2fa_verified': '2FA verified',
        '2fa_recovery_used': 'Recovery code used',
        '2fa_recovery_regenerated': 'Recovery codes regenerated',
        'account_deleted': 'Account deleted',
        'logged_out_other_devices': 'Signed out other devices',
        'suspicious_ip_change': 'Suspicious activity detected',
        'share_link_accessed': 'Share link accessed',
    };

    const actionIcons = {
        'upload': 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
        'download': 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
        'login': 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
        'delete': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        'default': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    };

    const getActionIcon = (action) => {
        for (const prefix in actionIcons) {
            if (action?.includes(prefix)) return actionIcons[prefix];
        }
        return actionIcons.default;
    };

    const getActionColor = (action) => {
        if (action?.includes('delete') || action?.includes('suspicious')) return 'text-red-500 bg-red-500/10';
        if (action?.includes('login') || action?.includes('register')) return 'text-green-500 bg-security-glow/60';
        if (action?.includes('upload')) return 'text-blue-500 bg-blue-500/10';
        if (action?.includes('download')) return 'text-purple-500 bg-purple-500/10';
        if (action?.includes('2fa') || action?.includes('password')) return 'text-amber-500 bg-amber-500/10';
        return 'text-surface-500 bg-surface-50';
    };

    return (
        <AuthenticatedLayout header="Activity Log">
            <div className="px-6 py-6">
                {/* Filter */}
                {actionTypes?.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        <Link
                            href="/activity-log"
                            className={`badge cursor-pointer ${!filters?.action ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
                        >
                            All
                        </Link>
                        {actionTypes.map((type) => (
                            <Link
                                key={type}
                                href={'/activity-log?action=' + type}
                                className={`badge cursor-pointer ${filters?.action === type ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
                            >
                                {actionLabels[type] || type}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Timeline */}
                <div className="card overflow-hidden !p-0">
                    {logs?.data?.length > 0 ? (
                        <div className="divide-y divide-surface-100">
                            {logs.data.map((log) => (
                                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-surface-50 transition-colors">
                                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${getActionColor(log.action)}`}>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={getActionIcon(log.action)} />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-surface-700">
                                            {actionLabels[log.action] || log.action}
                                            {log.metadata?.original_name && (
                                                <span className="font-normal text-surface-500"> — {log.metadata.original_name}</span>
                                            )}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-surface-400">
                                            <span>{log.created_at_human}</span>
                                            <span>{log.ip_address}</span>
                                            <span>{log.user_agent}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-16 text-center">
                            <svg className="h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-3 text-sm text-surface-500">No activity recorded yet</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {logs?.links && logs.links.length > 3 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-surface-500">
                            Showing {logs.from} to {logs.to} of {logs.total} entries
                        </p>
                        <div className="flex gap-1" dangerouslySetInnerHTML={{ __html: logs.links.join('') }} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
