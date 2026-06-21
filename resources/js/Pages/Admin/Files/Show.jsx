/**
 * Admin File Detail — Metadata Lengkap + Aktivitas File
 * @security OWASP A01/A09 — Admin-only access + audit log visibility
 */
import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminFilesShow({ file, activities }) {
    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
        return bytes.toFixed(1) + ' ' + units[i];
    };

    return (
        <AdminLayout header={`File: ${file.original_name}`}>
            <div className="space-y-6">
                {/* Metadata */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">File Metadata</h3>
                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><dt className="text-surface-400">UUID</dt><dd className="font-mono text-xs">{file.uuid}</dd></div>
                        <div><dt className="text-surface-400">Original Name</dt><dd className="font-medium">{file.original_name}</dd></div>
                        <div><dt className="text-surface-400">Owner</dt><dd>{file.user?.name} ({file.user?.email})</dd></div>
                        <div><dt className="text-surface-400">Size</dt><dd>{formatSize(file.size)}</dd></div>
                        <div><dt className="text-surface-400">MIME Type</dt><dd>{file.mime_type}</dd></div>
                        <div><dt className="text-surface-400">Downloads</dt><dd>{file.download_count}</dd></div>
                        <div><dt className="text-surface-400">Encrypted</dt><dd>{file.is_encrypted ? '✅ AES-256-GCM' : '❌'}</dd></div>
                        <div><dt className="text-surface-400">Checksum</dt><dd className="font-mono text-xs">{file.checksum_sha256?.substring(0, 32)}...</dd></div>
                        <div><dt className="text-surface-400">Folder</dt><dd>{file.folder?.name || 'Root'}</dd></div>
                        <div><dt className="text-surface-400">Favorited</dt><dd>{file.is_favorited ? '⭐' : '—'}</dd></div>
                        <div><dt className="text-surface-400">Expires</dt><dd>{file.expires_at || 'Never'}</dd></div>
                        <div><dt className="text-surface-400">Uploaded</dt><dd>{file.created_at}</dd></div>
                        {file.deleted_at && <div><dt className="text-surface-400">Deleted</dt><dd className="text-red-500">{file.deleted_at}</dd></div>}
                    </dl>
                </div>

                {/* Shares */}
                {file.shares?.length > 0 && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold mb-3">Shares ({file.shares.length})</h3>
                        <div className="space-y-2">
                            {file.shares.map((share) => (
                                <div key={share.uuid} className="text-sm p-2 bg-surface-50 rounded">
                                    {share.type === 'internal' ? `${share.shared_with_user?.name} (${share.permission})` : `External: ${share.external_email} (${share.permission})`}
                                    {share.expires_at && <span className="ml-2 text-surface-400">Expires: {share.expires_at}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activity Log */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-3">Recent Activity ({activities?.length || 0})</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {activities?.map((log) => (
                            <div key={log.id} className="text-sm p-2 bg-surface-50 rounded flex justify-between">
                                <span><span className="font-medium">{log.user?.name || 'System'}</span> — <span className="text-surface-500">{log.action}</span></span>
                                <span className="text-surface-400 text-xs">{log.created_at}</span>
                            </div>
                        ))}
                        {(!activities || activities.length === 0) && <p className="text-surface-400 text-sm">No activity recorded.</p>}
                    </div>
                </div>

                <Link href="/admin/files" className="text-sm text-primary-600 hover:underline">← Back to Files</Link>
            </div>
        </AdminLayout>
    );
}
