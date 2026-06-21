/**
 * Admin File Versions Index — Riwayat Versi Semua File
 * @security OWASP A01/A09 — Admin-only visibility
 */
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminFileVersionsIndex({ versions, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const handleSearch = (e) => { e.preventDefault(); router.get('/admin/file-versions', { search }, { preserveState: true }); };
    const formatSize = (bytes) => { if (!bytes) return '0 B'; const units = ['B', 'KB', 'MB', 'GB']; let i = 0; while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; } return bytes.toFixed(1) + ' ' + units[i]; };

    return (
        <AdminLayout header="File Version History">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="card p-4 bg-blue-50"><p className="text-xs text-blue-600">Total Versions</p><p className="text-xl font-bold text-blue-700">{stats?.total_versions}</p></div>
                    <div className="card p-4 bg-purple-50"><p className="text-xs text-purple-600">Total Size</p><p className="text-xl font-bold text-purple-700">{formatSize(stats?.total_size)}</p></div>
                    <div className="card p-4 bg-green-50"><p className="text-xs text-green-600">Unique Files</p><p className="text-xl font-bold text-green-700">{stats?.unique_files}</p></div>
                </div>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by file or user..." className="input flex-1" />
                    <button type="submit" className="btn-secondary">Search</button>
                </form>
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-200 bg-surface-50">
                            <th className="table-header">File</th><th className="table-header">Version</th><th className="table-header">Uploaded By</th><th className="table-header">Size</th><th className="table-header">Checksum</th><th className="table-header">Created</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {versions?.data?.map((v) => (
                                <tr key={v.id} className="hover:bg-surface-50 text-sm">
                                    <td className="table-cell font-medium">{v.file?.original_name || '—'}</td>
                                    <td className="table-cell">v{v.version_number}</td>
                                    <td className="table-cell text-surface-500">{v.user?.name || '—'}</td>
                                    <td className="table-cell">{formatSize(v.size)}</td>
                                    <td className="table-cell font-mono text-xs text-surface-400">{v.checksum_sha256?.substring(0, 16)}...</td>
                                    <td className="table-cell text-surface-400">{v.created_at}</td>
                                </tr>
                            ))}
                            {versions?.data?.length === 0 && <tr><td colSpan="6" className="table-cell text-center text-surface-400 py-8">No versions found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {versions?.links && <div className="text-sm text-surface-500">Showing {versions.from} to {versions.to} of {versions.total}</div>}
            </div>
        </AdminLayout>
    );
}
