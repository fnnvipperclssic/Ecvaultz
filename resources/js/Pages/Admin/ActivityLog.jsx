import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminActivityLog({ logs, actionTypes, filters }) {
    const [action, setAction] = useState(filters?.action || '');
    const [userId, setUserId] = useState(filters?.user_id || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/admin/activity-log', { action, user_id: userId, date_from: dateFrom, date_to: dateTo }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = '/admin/activity-log/export?' + new URLSearchParams({ date_from: dateFrom, date_to: dateTo }).toString();
    };

    return (
        <AdminLayout header="Global Activity Log">
            <div className="space-y-4">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-surface-500 mb-1">Action Type</label>
                        <select value={action} onChange={e => setAction(e.target.value)} className="input">
                            <option value="">All Actions</option>
                            {actionTypes?.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-surface-500 mb-1">User ID</label>
                        <input type="number" value={userId} onChange={e => setUserId(e.target.value)} placeholder="Optional" className="input w-24" />
                    </div>
                    <div>
                        <label className="block text-xs text-surface-500 mb-1">From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" />
                    </div>
                    <div>
                        <label className="block text-xs text-surface-500 mb-1">To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" />
                    </div>
                    <button type="submit" className="btn-secondary">Filter</button>
                    <button type="button" onClick={handleExport} className="btn-secondary">Export CSV</button>
                </form>

                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-200 bg-surface-50">
                                <th className="table-header">ID</th>
                                <th className="table-header">Action</th>
                                <th className="table-header">User</th>
                                <th className="table-header">IP</th>
                                <th className="table-header">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {logs?.data?.map((log) => (
                                <tr key={log.id} className="hover:bg-surface-50">
                                    <td className="table-cell text-xs text-surface-400">{log.id}</td>
                                    <td className="table-cell">
                                        <span className="badge bg-surface-100 text-surface-600 !text-xs">{log.action}</span>
                                    </td>
                                    <td className="table-cell text-sm">{log.user_name}</td>
                                    <td className="table-cell text-xs text-surface-400">{log.ip_address}</td>
                                    <td className="table-cell text-xs text-surface-400">{log.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {logs?.links && (
                    <div className="text-sm text-surface-500">
                        Showing {logs.from} to {logs.to} of {logs.total} entries
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
