/**
 * Admin Login Attempts Index — Audit Trail Login
 * Menampilkan semua percobaan login (berhasil & gagal) untuk deteksi brute force.
 * @security OWASP A09 — Security logging & monitoring dashboard
 */
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminLoginAttemptsIndex({ attempts, filters, stats }) {
    const [email, setEmail] = useState(filters?.email || '');
    const [success, setSuccess] = useState(filters?.success || '');
    const handleFilter = (e) => { e.preventDefault(); router.get('/admin/login-attempts', { email, success }, { preserveState: true }); };

    return (
        <AdminLayout header="Login Attempts Audit">
            <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="card p-3 bg-surface-50"><p className="text-xs text-surface-500">Total</p><p className="text-lg font-bold">{stats?.total}</p></div>
                    <div className="card p-3 bg-green-50"><p className="text-xs text-green-600">Successful</p><p className="text-lg font-bold text-green-700">{stats?.successful}</p></div>
                    <div className="card p-3 bg-red-50"><p className="text-xs text-red-600">Failed</p><p className="text-lg font-bold text-red-700">{stats?.failed}</p></div>
                    <div className="card p-3 bg-amber-50"><p className="text-xs text-amber-600">Failed Today</p><p className="text-lg font-bold text-amber-700">{stats?.today_failed}</p></div>
                    <div className="card p-3 bg-surface-50"><p className="text-xs text-surface-500">Unique IPs</p><p className="text-lg font-bold">{stats?.unique_ips}</p></div>
                </div>

                {/* Filter */}
                <form onSubmit={handleFilter} className="flex gap-3">
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Filter by email..." className="input flex-1" />
                    <select value={success} onChange={(e) => setSuccess(e.target.value)} className="input w-32">
                        <option value="">All</option>
                        <option value="1">Success</option>
                        <option value="0">Failed</option>
                    </select>
                    <button type="submit" className="btn-secondary">Filter</button>
                </form>

                {/* Table */}
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-200 bg-surface-50">
                            <th className="table-header">Email</th><th className="table-header">User</th><th className="table-header">IP Address</th><th className="table-header">Result</th><th className="table-header">Reason</th><th className="table-header">Time</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {attempts?.data?.map((a) => (
                                <tr key={a.id} className="hover:bg-surface-50 text-sm">
                                    <td className="table-cell font-mono text-xs">{a.email}</td>
                                    <td className="table-cell">{a.user?.name || '—'}</td>
                                    <td className="table-cell font-mono text-xs text-surface-400">{a.ip_address}</td>
                                    <td className="table-cell">{a.success ? <span className="text-green-600">✅ Success</span> : <span className="text-red-500">❌ Failed</span>}</td>
                                    <td className="table-cell text-surface-400 text-xs">{a.failure_reason || '—'}</td>
                                    <td className="table-cell text-surface-400 text-xs">{a.created_at}</td>
                                </tr>
                            ))}
                            {attempts?.data?.length === 0 && <tr><td colSpan="6" className="table-cell text-center text-surface-400 py-8">No login attempts found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {attempts?.links && <div className="text-sm text-surface-500">Showing {attempts.from} to {attempts.to} of {attempts.total}</div>}
            </div>
        </AdminLayout>
    );
}
