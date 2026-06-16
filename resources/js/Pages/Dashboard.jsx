import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DashboardSkeleton } from '@/Components/LoadingSkeleton';

export default function Dashboard({ totalFiles, totalSize, trashedFiles, sharedWithMe, recentFiles }) {
    const stats = [
        { label: 'Total Files', value: totalFiles ?? 0, icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', color: 'text-primary-400 bg-primary-500/10', href: '/files' },
        { label: 'Storage Used', value: (totalSize ?? 0) + ' GB', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16', color: 'text-purple-400 bg-purple-500/10' },
        { label: 'Shared With Me', value: sharedWithMe ?? 0, icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316', color: 'text-emerald-400 bg-emerald-500/10', href: '/shares' },
        { label: 'In Trash', value: trashedFiles ?? 0, icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'text-red-400 bg-red-500/10', href: '/files/trash' },
    ];

    // Initial load detection
    const isLoading = totalFiles === undefined || totalFiles === null;

    if (isLoading) {
        return (
            <AuthenticatedLayout header="Dashboard">
                <div className="px-6 py-6">
                    <DashboardSkeleton />
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header="Dashboard">
            <div className="px-6 py-6 space-y-6 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="card p-5 glass-hover">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                    </svg>
                                </div>
                            </div>
                            {stat.href && (
                                <Link href={stat.href} className="mt-3 text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                                    View all <span aria-hidden="true">&rarr;</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Recent Files */}
                <div className="card overflow-hidden !p-0">
                    <div className="px-5 py-4 border-b border-white/[0.06]">
                        <h3 className="text-sm font-semibold text-white">Recent Files</h3>
                    </div>
                    {recentFiles?.length > 0 ? (
                        <div className="divide-y divide-white/[0.04]">
                            {recentFiles.map((file, i) => (
                                <Link key={i} href={'/files/' + file.uuid} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-100/60 transition-colors">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${file.type?.startsWith('image/') ? 'bg-emerald-500/10 text-emerald-400' : file.type === 'application/pdf' ? 'bg-red-500/10 text-red-400' : 'bg-surface-300 text-surface-500'}`}>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-surface-700 truncate">{file.name}</p>
                                        <p className="text-xs text-surface-500">{file.size} &middot; {file.date}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-12 text-center">
                            <svg className="h-12 w-12 text-surface-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                            <p className="text-sm text-surface-500">No files yet.</p>
                            <Link href="/files" className="mt-2 text-sm text-primary-400 hover:text-primary-300">Upload your first file &rarr;</Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
