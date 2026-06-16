import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminUsersEdit({ targetUser, allRoles, allPermissions }) {
    const [selectedRoles, setSelectedRoles] = useState([...targetUser.roles]);
    const [selectedPermissions, setSelectedPermissions] = useState([...targetUser.permissions]);
    const { data, setData, patch, processing, errors } = useForm({
        name: targetUser.name,
        email: targetUser.email,
        roles: targetUser.roles,
        permissions: targetUser.permissions,
    });

    const toggleRole = (role) => {
        const updated = selectedRoles.includes(role)
            ? selectedRoles.filter(r => r !== role)
            : [...selectedRoles, role];
        setSelectedRoles(updated);
        setData('roles', updated);
    };

    const togglePermission = (perm) => {
        const updated = selectedPermissions.includes(perm)
            ? selectedPermissions.filter(p => p !== perm)
            : [...selectedPermissions, perm];
        setSelectedPermissions(updated);
        setData('permissions', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch('/admin/users/' + targetUser.id, {
            onSuccess: () => {},
        });
    };

    return (
        <AdminLayout header="Edit User">
            <div className="max-w-3xl space-y-6">
                <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-surface-800">User Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Name</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="input w-full" />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="input w-full" />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={processing} className="btn-primary">Save Changes</button>
                    </div>
                </form>

                <div className="card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-surface-800">Roles</h3>
                    <div className="flex flex-wrap gap-2">
                        {allRoles.map(role => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => toggleRole(role)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    selectedRoles.includes(role)
                                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                                        : 'bg-surface-100 text-surface-600 border border-surface-200 hover:bg-surface-200'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-surface-800">Direct Permissions</h3>
                    <p className="text-sm text-surface-500">Note: Role-based permissions are inherited automatically.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {allPermissions.map(perm => (
                            <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-surface-50 p-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm)}
                                    onChange={() => togglePermission(perm)}
                                    className="h-4 w-4 rounded border-surface-300 text-primary-600"
                                />
                                <span className="text-surface-700">{perm}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
