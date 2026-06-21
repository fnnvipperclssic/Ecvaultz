/**
 * Admin Tags Index — Daftar Semua Tag
 * @security OWASP A01 — Admin-only access
 */
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminTagsIndex({ tags, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const handleSearch = (e) => { e.preventDefault(); router.get('/admin/tags', { search }, { preserveState: true }); };
    const handleDelete = (tagId) => { if (confirm('Delete this tag?')) router.delete(`/admin/tags/${tagId}`); };

    return (
        <AdminLayout header="Tag Management">
            <div className="space-y-4">
                <div className="card p-4 bg-blue-50 inline-block"><p className="text-xs text-blue-600">Total Tags</p><p className="text-xl font-bold text-blue-700">{stats?.total_tags}</p></div>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tags..." className="input flex-1" />
                    <button type="submit" className="btn-secondary">Search</button>
                </form>
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-200 bg-surface-50">
                            <th className="table-header">Tag</th><th className="table-header">Owner</th><th className="table-header">Files</th><th className="table-header">Created</th><th className="table-header">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {tags?.data?.map((tag) => (
                                <tr key={tag.uuid} className="hover:bg-surface-50">
                                    <td className="table-cell font-medium"><span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }}></span>{tag.name}</td>
                                    <td className="table-cell text-surface-500">{tag.user?.name || '—'}</td>
                                    <td className="table-cell">{tag.files_count}</td>
                                    <td className="table-cell text-surface-400 text-sm">{tag.created_at}</td>
                                    <td className="table-cell"><button onClick={() => handleDelete(tag.uuid)} className="text-xs text-red-500 hover:underline">Delete</button></td>
                                </tr>
                            ))}
                            {tags?.data?.length === 0 && <tr><td colSpan="5" className="table-cell text-center text-surface-400 py-8">No tags found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {tags?.links && <div className="text-sm text-surface-500">Showing {tags.from} to {tags.to} of {tags.total}</div>}
            </div>
        </AdminLayout>
    );
}
