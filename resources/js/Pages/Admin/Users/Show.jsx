/**
 * Admin User Detail — Informasi Lengkap User + Audit Trail
 * @security OWASP A01/A09 — Admin-only visibility + activity tracking
 */
import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminUsersShow({ user }) {
    return (
        <AdminLayout header={`User: ${user.name}`}>
            <div className="space-y-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">User Profile</h3>
                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><dt className="text-surface-400">ID</dt><dd>{user.id}</dd></div>
                        <div><dt className="text-surface-400">Name</dt><dd className="font-medium">{user.name}</dd></div>
                        <div><dt className="text-surface-400">Email</dt><dd>{user.email}</dd></div>
                        <div><dt className="text-surface-400">Roles</dt><dd>{user.roles?.map(r => <span key={r} className="badge bg-primary-50 text-primary-600 text-xs mr-1">{r}</span>)}</dd></div>
                        <div><dt className="text-surface-400">2FA Enabled</dt><dd>{user.two_factor_enabled ? '✅' : '❌'}</dd></div>
                        <div><dt className="text-surface-400">Email Verified</dt><dd>{user.email_verified_at ? `✅ ${user.email_verified_at}` : '❌'}</dd></div>
                        <div><dt className="text-surface-400">Files Count</dt><dd>{user.files_count || 0}</dd></div>
                        <div><dt className="text-surface-400">Storage Used</dt><dd>{user.storage_used || '0 B'}</dd></div>
                        <div><dt className="text-surface-400">Storage Quota</dt><dd>{user.storage_quota ? (user.storage_quota / 1073741824).toFixed(1) + ' GB' : '5 GB'}</dd></div>
                        <div><dt className="text-surface-400">Last Login</dt><dd>{user.last_login_at || 'Never'}</dd></div>
                        <div><dt className="text-surface-400">Last Login IP</dt><dd className="font-mono">{user.last_login_ip || 'N/A'}</dd></div>
                        <div><dt className="text-surface-400">Password Changed</dt><dd>{user.password_changed_at || 'Never'}</dd></div>
                        <div><dt className="text-surface-400">Joined</dt><dd>{user.created_at}</dd></div>
                        {user.deleted_at && <div><dt className="text-surface-400">Banned</dt><dd className="text-red-500">{user.deleted_at}</dd></div>}
                    </dl>
                </div>

                {/* Activity Logs placeholder */}
                {user.activity_logs && user.activity_logs.length > 0 && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {user.activity_logs.slice(0, 20).map((log) => (
                                <div key={log.id} className="text-sm p-2 bg-surface-50 rounded flex justify-between">
                                    <span className="text-surface-600">{log.action}</span>
                                    <span className="text-surface-400 text-xs">{log.created_at}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <Link href="/admin/users" className="text-sm text-primary-600 hover:underline">← Back to Users</Link>
                    <Link href={`/admin/users/${user.id}/edit`} className="text-sm text-primary-600 hover:underline">Edit User</Link>
                </div>
            </div>
        </AdminLayout>
    );
}
