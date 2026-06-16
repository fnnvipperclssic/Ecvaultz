import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDashboard({ stats }) {
    const cards = [
        { label: 'Total Users', value: stats.totalUsers, sub: stats.activeUsers + ' active, ' + stats.deletedUsers + ' deleted', color: 'bg-blue-50 text-blue-700' },
        { label: 'Total Files', value: stats.totalFiles, sub: stats.trashedFiles + ' in trash', color: 'bg-green-50 text-green-700' },
        { label: 'Total Storage', value: stats.totalStorage, color: 'bg-purple-50 text-purple-700' },
        { label: 'Active Shares', value: stats.activeShares, sub: stats.totalShares + ' total', color: 'bg-amber-50 text-amber-700' },
    ];

    return (
        <AdminLayout header="Admin Dashboard">
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((card) => (
                        <div key={card.label} className={`card p-5 ${card.color}`}>
                            <p className="text-sm font-medium opacity-75">{card.label}</p>
                            <p className="text-2xl font-bold mt-1">{card.value}</p>
                            {card.sub && <p className="text-xs opacity-60 mt-1">{card.sub}</p>}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card p-5">
                        <h4 className="text-sm font-semibold text-surface-700 mb-3">Recent Registrations</h4>
                        <div className="space-y-2">
                            {stats.recentRegistrations?.map((user, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-surface-700">{user.name}</span>
                                    <span className="text-surface-400">{user.created_at}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card p-5">
                        <h4 className="text-sm font-semibold text-surface-700 mb-3">Top Storage Users</h4>
                        <div className="space-y-2">
                            {stats.topUploaders?.map((user, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-surface-700">{user.name} ({user.files_count} files)</span>
                                    <span className="text-surface-500">{user.storage_used}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card p-5">
                    <h4 className="text-sm font-semibold text-surface-700 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                        {stats.recentActivity?.map((act, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                <span className="badge bg-surface-100 text-surface-600 !text-xs">{act.action}</span>
                                <span className="text-surface-700">{act.user_name}</span>
                                <span className="text-surface-400 ml-auto">{act.created_at}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
