/**
 * Admin Data Rooms Index — Daftar Semua Data Room
 * @security OWASP A01 — Admin-only access
 */
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDataRoomsIndex({ dataRooms, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const handleSearch = (e) => { e.preventDefault(); router.get('/admin/data-rooms', { search }, { preserveState: true }); };
    const handleDelete = (roomId) => {
        if (confirm('Delete this Data Room permanently? This cannot be undone.')) {
            const password = prompt('Enter your admin password to confirm:');
            if (password) router.delete(`/admin/data-rooms/${roomId}`, { data: { password } });
        }
    };

    return (
        <AdminLayout header="Data Room Management">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 bg-blue-50"><p className="text-xs text-blue-600">Total Rooms</p><p className="text-xl font-bold text-blue-700">{stats?.total_rooms}</p></div>
                    <div className="card p-4 bg-green-50"><p className="text-xs text-green-600">Active</p><p className="text-xl font-bold text-green-700">{stats?.active_rooms}</p></div>
                </div>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search data rooms..." className="input flex-1" />
                    <button type="submit" className="btn-secondary">Search</button>
                </form>
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-200 bg-surface-50">
                            <th className="table-header">Name</th><th className="table-header">Owner</th><th className="table-header">Files</th><th className="table-header">Invites</th><th className="table-header">Active</th><th className="table-header">Expires</th><th className="table-header">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {dataRooms?.data?.map((room) => (
                                <tr key={room.id} className="hover:bg-surface-50">
                                    <td className="table-cell font-medium">{room.name}</td>
                                    <td className="table-cell text-surface-500">{room.user?.name || '—'}</td>
                                    <td className="table-cell">{room.files_count}</td>
                                    <td className="table-cell">{room.invites_count}</td>
                                    <td className="table-cell">{room.is_active ? '✅' : '❌'}</td>
                                    <td className="table-cell text-surface-400 text-xs">{room.expires_at || 'Never'}</td>
                                    <td className="table-cell">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/data-rooms/${room.id}`} className="text-xs text-primary-600 hover:underline">View</Link>
                                            <button onClick={() => handleDelete(room.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {dataRooms?.data?.length === 0 && <tr><td colSpan="7" className="table-cell text-center text-surface-400 py-8">No data rooms found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {dataRooms?.links && <div className="text-sm text-surface-500">Showing {dataRooms.from} to {dataRooms.to} of {dataRooms.total}</div>}
            </div>
        </AdminLayout>
    );
}
