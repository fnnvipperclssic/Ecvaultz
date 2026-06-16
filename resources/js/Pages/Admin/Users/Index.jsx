import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminUsersIndex({ users, roles, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedRole, setSelectedRole] = useState(filters?.role || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/users', { search, role: selectedRole }, { preserveState: true });
    };

    return (
        <AdminLayout header="User Management">
            <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="input flex-1"
                    />
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="input w-40">
                        <option value="">All Roles</option>
                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="submit" className="btn-secondary">Filter</button>
                </form>

                <div className="card overflow-hidden !p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-200 bg-surface-50">
                                <th className="table-header">Name</th>
                                <th className="table-header">Email</th>
                                <th className="table-header">Roles</th>
                                <th className="table-header">2FA</th>
                                <th className="table-header">Files</th>
                                <th className="table-header">Last Login</th>
                                <th className="table-header">Joined</th>
                                <th className="table-header"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {users?.data?.map((user) => (
                                <tr key={user.id} className="hover:bg-surface-50">
                                    <td className="table-cell font-medium text-surface-700">
                                        {user.name}
                                        {user.is_deleted && <span className="ml-2 badge bg-red-100 text-red-600 text-xs">Banned</span>}
                                    </td>
                                    <td className="table-cell text-surface-500">{user.email}</td>
                                    <td className="table-cell">
                                        {user.roles?.map((role) => (
                                            <span key={role} className="badge bg-primary-50 text-primary-600 text-xs mr-1">{role}</span>
                                        ))}
                                    </td>
                                    <td className="table-cell">{user.two_factor_enabled ? '✅' : '❌'}</td>
                                    <td className="table-cell">{user.files_count}</td>
                                    <td className="table-cell text-surface-400">{user.last_login_at || 'Never'}</td>
                                    <td className="table-cell text-surface-400">{user.created_at}</td>
                                    <td className="table-cell">
                                        <div className="flex gap-1">
                                            <Link href={'/admin/users/' + user.id} className="text-xs text-primary-600 hover:underline">View</Link>
                                            <Link href={'/admin/users/' + user.id + '/edit'} className="text-xs text-primary-600 hover:underline">Edit</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users?.links && (
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-surface-500">Showing {users.from} to {users.to} of {users.total} users</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
