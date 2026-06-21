/**
 * Admin Notifications Index — Semua Notifikasi Sistem
 * @security OWASP A01 — Admin-only access
 */
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminNotificationsIndex({ notifications, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [read, setRead] = useState(filters?.read || '');
    const handleFilter = (e) => { e.preventDefault(); router.get('/admin/notifications', { search, read }, { preserveState: true }); };
    const handleDelete = (id) => { if (confirm('Delete this notification?')) router.delete(`/admin/notifications/${id}`); };

    return (
        <AdminLayout header="Notification Management">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="card p-4 bg-blue-50"><p className="text-xs text-blue-600">Total</p><p className="text-xl font-bold text-blue-700">{stats?.total}</p></div>
                    <div className="card p-4 bg-amber-50"><p className="text-xs text-amber-600">Unread</p><p className="text-xl font-bold text-amber-700">{stats?.unread}</p></div>
                    <div className="card p-4 bg-green-50"><p className="text-xs text-green-600">Read</p><p className="text-xl font-bold text-green-700">{stats?.read}</p></div>
                </div>
                <form onSubmit={handleFilter} className="flex gap-3">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications..." className="input flex-1" />
                    <select value={read} onChange={(e) => setRead(e.target.value)} className="input w-32">
                        <option value="">All</option><option value="unread">Unread</option><option value="read">Read</option>
                    </select>
                    <button type="submit" className="btn-secondary">Filter</button>
                </form>
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-200 bg-surface-50">
                            <th className="table-header">Type</th><th className="table-header">Recipient</th><th className="table-header">Data</th><th className="table-header">Status</th><th className="table-header">Created</th><th className="table-header">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {notifications?.data?.map((n) => (
                                <tr key={n.id} className="hover:bg-surface-50 text-sm">
                                    <td className="table-cell font-mono text-xs">{n.type?.split('\\').pop()}</td>
                                    <td className="table-cell text-surface-500">{n.notifiable?.name || n.notifiable?.email || 'System'}</td>
                                    <td className="table-cell text-surface-400 text-xs max-w-xs truncate">{JSON.stringify(n.data)?.substring(0, 60)}</td>
                                    <td className="table-cell">{n.read_at ? <span className="text-green-500 text-xs">Read {n.read_at}</span> : <span className="badge bg-amber-50 text-amber-600 text-xs">Unread</span>}</td>
                                    <td className="table-cell text-surface-400 text-xs">{n.created_at}</td>
                                    <td className="table-cell"><button onClick={() => handleDelete(n.id)} className="text-xs text-red-500 hover:underline">Delete</button></td>
                                </tr>
                            ))}
                            {notifications?.data?.length === 0 && <tr><td colSpan="6" className="table-cell text-center text-surface-400 py-8">No notifications found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {notifications?.links && <div className="text-sm text-surface-500">Showing {notifications.from} to {notifications.to} of {notifications.total}</div>}
            </div>
        </AdminLayout>
    );
}
