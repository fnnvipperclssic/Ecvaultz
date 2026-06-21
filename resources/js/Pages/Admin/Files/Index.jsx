/**
 * Admin Files Index — Daftar Semua File di Sistem
 * Admin dapat mencari, filter, dan menghapus file dari user manapun.
 * @security OWASP A01 — Admin-only access via permission middleware
 */
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminFilesIndex({ files, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [trashed, setTrashed] = useState(filters?.trashed || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/files', { search, trashed }, { preserveState: true });
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
        return bytes.toFixed(1) + ' ' + units[i];
    };

    const handleDelete = (fileId) => {
        if (confirm('Permanently delete this file? This cannot be undone.')) {
            const password = prompt('Enter your admin password to confirm:');
            if (password) {
                router.delete(`/admin/files/${fileId}`, { data: { password } });
            }
        }
    };

    return (
        <AdminLayout header="File Management">
            <div className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card p-4 bg-blue-50"><p className="text-xs text-blue-600">Total Files</p><p className="text-xl font-bold text-blue-700">{stats?.total_files}</p></div>
                    <div className="card p-4 bg-purple-50"><p className="text-xs text-purple-600">Total Storage</p><p className="text-xl font-bold text-purple-700">{formatSize(stats?.total_size)}</p></div>
                    <div className="card p-4 bg-red-50"><p className="text-xs text-red-600">Trashed</p><p className="text-xl font-bold text-red-700">{stats?.trashed_files}</p></div>
                </div>

                {/* Search & Filter */}
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." className="input flex-1" />
                    <select value={trashed} onChange={(e) => setTrashed(e.target.value)} className="input w-40">
                        <option value="">All Files</option>
                        <option value="only">Trashed Only</option>
                    </select>
                    <button type="submit" className="btn-secondary">Filter</button>
                </form>

                {/* Table */}
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-200 bg-surface-50">
                                <th className="table-header">File Name</th>
                                <th className="table-header">Owner</th>
                                <th className="table-header">Size</th>
                                <th className="table-header">Type</th>
                                <th className="table-header">Downloads</th>
                                <th className="table-header">Uploaded</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {files?.data?.map((file) => (
                                <tr key={file.uuid} className="hover:bg-surface-50">
                                    <td className="table-cell font-medium text-surface-700">{file.original_name}{file.deleted_at && <span className="ml-2 badge bg-red-100 text-red-600 text-xs">Trashed</span>}</td>
                                    <td className="table-cell text-surface-500">{file.user?.name || 'Unknown'}</td>
                                    <td className="table-cell text-surface-500">{formatSize(file.size)}</td>
                                    <td className="table-cell text-surface-500 text-xs">{file.mime_type}</td>
                                    <td className="table-cell">{file.download_count}</td>
                                    <td className="table-cell text-surface-400 text-sm">{file.created_at}</td>
                                    <td className="table-cell">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/files/${file.uuid}`} className="text-xs text-primary-600 hover:underline">View</Link>
                                            <button onClick={() => handleDelete(file.uuid)} className="text-xs text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {files?.data?.length === 0 && <tr><td colSpan="7" className="table-cell text-center text-surface-400 py-8">No files found.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {files?.links && <div className="text-sm text-surface-500">Showing {files.from} to {files.to} of {files.total} files</div>}
            </div>
        </AdminLayout>
    );
}
