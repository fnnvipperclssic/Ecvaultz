/**
 * Admin Data Room Detail — Detail Room + Files + Invites
 * @security OWASP A01 — Admin-only access
 */
import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDataRoomsShow({ dataRoom }) {
    return (
        <AdminLayout header={`Data Room: ${dataRoom.name}`}>
            <div className="space-y-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Room Details</h3>
                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><dt className="text-surface-400">Name</dt><dd className="font-medium">{dataRoom.name}</dd></div>
                        <div><dt className="text-surface-400">Owner</dt><dd>{dataRoom.user?.name} ({dataRoom.user?.email})</dd></div>
                        <div><dt className="text-surface-400">Description</dt><dd>{dataRoom.description || '—'}</dd></div>
                        <div><dt className="text-surface-400">Active</dt><dd>{dataRoom.is_active ? '✅ Yes' : '❌ No'}</dd></div>
                        <div><dt className="text-surface-400">Color</dt><dd><span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: dataRoom.primary_color }}></span> {dataRoom.primary_color}</dd></div>
                        <div><dt className="text-surface-400">Expires</dt><dd>{dataRoom.expires_at || 'Never'}</dd></div>
                        <div><dt className="text-surface-400">Created</dt><dd>{dataRoom.created_at}</dd></div>
                    </dl>
                </div>

                {/* Files */}
                {dataRoom.files?.length > 0 && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold mb-3">Files ({dataRoom.files.length})</h3>
                        <div className="space-y-2">{dataRoom.files.map((file) => <div key={file.uuid} className="text-sm p-2 bg-surface-50 rounded">{file.original_name} — {file.user?.name}</div>)}</div>
                    </div>
                )}

                {/* Invites */}
                {dataRoom.invites?.length > 0 && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold mb-3">Invites ({dataRoom.invites.length})</h3>
                        <div className="space-y-2">{dataRoom.invites.map((inv) => <div key={inv.id} className="text-sm p-2 bg-surface-50 rounded flex justify-between"><span>{inv.email} (code: {inv.access_code})</span><span className="text-xs text-surface-400">Accessed {inv.access_count}x</span></div>)}</div>
                    </div>
                )}

                <Link href="/admin/data-rooms" className="text-sm text-primary-600 hover:underline">← Back to Data Rooms</Link>
            </div>
        </AdminLayout>
    );
}
