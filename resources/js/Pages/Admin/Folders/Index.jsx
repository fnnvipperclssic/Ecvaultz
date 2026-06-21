/**
 * Admin Folders Index — Daftar Semua Folder
 * @security OWASP A01 — Admin-only access
 */
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminFoldersIndex({ folders, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const handleSearch = (e) => { e.preventDefault(); router.get('/admin/folders', { search }, { preserveState: true }); };
    const handleDelete = (folderId) => {
        if (confirm('Delete this folder and all its contents permanently?')) {
            const password = prompt('Enter your admin password to confirm:');
            if (password) router.delete(`/admin/folders/${folderId}`, { data: { password } });
        }
    };

    return (
        <AdminLayout header="Folder Management">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 bg-blue-50"><p className="text-xs text-blue-600">Total Folders</p><p className="text-xl font-bold text-blue-700">{stats?.total_folders}</p></div>
                    <div className="card p-4 bg-green-50"><p className="text-xs text-green-600">Root Folders</p><p className="text-xl font-bold text-green-700">{stats?.root_folders}</p></div>
                </div>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search folders..." className="input flex-1" />
                    <button type="submit" className="btn-secondary">Search</button>
                </form>
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-200 bg-surface-50">
                            <th className="table-header">Name</th><th className="table-header">Owner</th><th className="table-header">Parent</th><th className="table-header">Files</th><th className="table-header">Sub-folders</th><th className="table-header">Created</th><th className="table-header">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {folders?.data?.map((folder) => (
                                <tr key={folder.uuid} className="hover:bg-surface-50">
                                    <td className="table-cell font-medium">{folder.name}</td>
                                    <td className="table-cell text-surface-500">{folder.user?.name || '—'}</td>
                                    <td className="table-cell text-surface-400">{folder.parent?.name || 'Root'}</td>
                                    <td className="table-cell">{folder.files_count}</td>
                                    <td className="table-cell">{folder.children_count}</td>
                                    <td className="table-cell text-surface-400 text-sm">{folder.created_at}</td>
                                    <td className="table-cell"><button onClick={() => handleDelete(folder.uuid)} className="text-xs text-red-500 hover:underline">Delete</button></td>
                                </tr>
                            ))}
                            {folders?.data?.length === 0 && <tr><td colSpan="7" className="table-cell text-center text-surface-400 py-8">No folders found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {folders?.links && <div className="text-sm text-surface-500">Showing {folders.from} to {folders.to} of {folders.total}</div>}
            </div>
        </AdminLayout>
    );
}
