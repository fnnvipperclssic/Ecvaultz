/**
 * Admin Shares Index — Daftar Semua File Share
 * @security OWASP A01 — Admin-only access
 */
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminSharesIndex({ shares, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const handleSearch = (e) => { e.preventDefault(); router.get('/admin/shares', { search }, { preserveState: true }); };
    const handleRevoke = (shareId) => { if (confirm('Revoke this share?')) router.delete(`/admin/shares/${shareId}`); };

    return (
        <AdminLayout header="Share Management">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="card p-4 bg-blue-50"><p className="text-xs text-blue-600">Total Shares</p><p className="text-xl font-bold text-blue-700">{stats?.total_shares}</p></div>
                    <div className="card p-4 bg-green-50"><p className="text-xs text-green-600">Internal</p><p className="text-xl font-bold text-green-700">{stats?.internal_shares}</p></div>
                    <div className="card p-4 bg-amber-50"><p className="text-xs text-amber-600">External</p><p className="text-xl font-bold text-amber-700">{stats?.external_shares}</p></div>
                </div>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email, user, or filename..." className="input flex-1" />
                    <button type="submit" className="btn-secondary">Search</button>
                </form>
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-200 bg-surface-50">
                            <th className="table-header">File</th><th className="table-header">Shared By</th><th className="table-header">Shared With</th><th className="table-header">Type</th><th className="table-header">Permission</th><th className="table-header">Access Count</th><th className="table-header">Expires</th><th className="table-header">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {shares?.data?.map((share) => (
                                <tr key={share.uuid} className="hover:bg-surface-50">
                                    <td className="table-cell font-medium text-sm">{share.file?.original_name || '—'}</td>
                                    <td className="table-cell text-surface-500">{share.shared_by_user?.name || '—'}</td>
                                    <td className="table-cell text-surface-500">{share.type === 'internal' ? share.shared_with_user?.name : share.external_email}</td>
                                    <td className="table-cell"><span className={`badge text-xs ${share.type === 'internal' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{share.type}</span></td>
                                    <td className="table-cell"><span className="badge text-xs bg-surface-100">{share.permission}</span></td>
                                    <td className="table-cell">{share.access_count}</td>
                                    <td className="table-cell text-surface-400 text-xs">{share.expires_at || 'Never'}</td>
                                    <td className="table-cell"><button onClick={() => handleRevoke(share.uuid)} className="text-xs text-red-500 hover:underline">Revoke</button></td>
                                </tr>
                            ))}
                            {shares?.data?.length === 0 && <tr><td colSpan="8" className="table-cell text-center text-surface-400 py-8">No shares found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {shares?.links && <div className="text-sm text-surface-500">Showing {shares.from} to {shares.to} of {shares.total}</div>}
            </div>
        </AdminLayout>
    );
}
