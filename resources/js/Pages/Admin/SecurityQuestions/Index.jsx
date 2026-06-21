/**
 * Admin Security Questions Index — Status Security Questions per User
 * Menampilkan user mana yang sudah/belum setup security questions.
 * @security Jawaban TIDAK PERNAH ditampilkan — hanya jumlah pertanyaan
 */
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminSecurityQuestionsIndex({ users, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const handleSearch = (e) => { e.preventDefault(); router.get('/admin/security-questions', { search }, { preserveState: true }); };

    return (
        <AdminLayout header="Security Questions Status">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="card p-4 bg-green-50"><p className="text-xs text-green-600">Users With Questions</p><p className="text-xl font-bold text-green-700">{stats?.users_with_questions}</p></div>
                    <div className="card p-4 bg-red-50"><p className="text-xs text-red-600">Users Without Questions</p><p className="text-xl font-bold text-red-700">{stats?.users_without_questions}</p></div>
                    <div className="card p-4 bg-blue-50"><p className="text-xs text-blue-600">Total Questions</p><p className="text-xl font-bold text-blue-700">{stats?.total_questions}</p></div>
                </div>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input flex-1" />
                    <button type="submit" className="btn-secondary">Search</button>
                </form>
                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-200 bg-surface-50">
                            <th className="table-header">User</th><th className="table-header">Email</th><th className="table-header">Questions Set</th><th className="table-header">Last Updated</th>
                        </tr></thead>
                        <tbody className="divide-y divide-surface-100">
                            {users?.data?.map((user) => (
                                <tr key={user.id} className="hover:bg-surface-50">
                                    <td className="table-cell font-medium">{user.name}</td>
                                    <td className="table-cell text-surface-500">{user.email}</td>
                                    <td className="table-cell"><span className={`badge text-xs ${user.security_questions_count >= 2 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{user.security_questions_count} questions</span></td>
                                    <td className="table-cell text-surface-400 text-sm">{user.security_questions?.[0]?.updated_at || '—'}</td>
                                </tr>
                            ))}
                            {users?.data?.length === 0 && <tr><td colSpan="4" className="table-cell text-center text-surface-400 py-8">No users with security questions found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {users?.links && <div className="text-sm text-surface-500">Showing {users.from} to {users.to} of {users.total}</div>}
            </div>
        </AdminLayout>
    );
}
