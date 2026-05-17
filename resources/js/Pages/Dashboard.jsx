import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard({ totalFiles, totalSize, trashedFiles, sharedWithMe, recentFiles }) {
    const stats = [
        { label: 'Total Files', value: totalFiles ?? 0, icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', color: 'bg-blue-500/10 text-blue-400', href: '/files' },
        { label: 'Storage Used', value: (totalSize ?? 0) + ' GB', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16', color: 'bg-purple-500/10 text-purple-400' },
        { label: 'Shared With Me', value: sharedWithMe ?? 0, icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', color: 'bg-security-glow text-security-light', href: '/shares' },
        { label: 'In Trash', value: trashedFiles ?? 0, icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'bg-red-500/10 text-red-400', href: '/files/trash' },
    ];

    const fileTypeIcons = {
        'application/pdf': 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
        'image/': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        'default': 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    };
    const getFileIcon = (mimeType) => {
        for (const [prefix, icon] of Object.entries(fileTypeIcons)) {
            if (mimeType?.startsWith(prefix)) return icon;
        }
        return fileTypeIcons.default;
    };

    return (
        <AuthenticatedLayout header="Dashboard">
            <div className="px-6 py-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="card p-6 transition-all hover:border-surface-300 hover:shadow-card-lg">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-surface-800">{stat.value}</p>
                                    <p className="text-sm text-surface-500">{stat.label}</p>
                                </div>
                            </div>
                            {stat.href && (
                                <Link href={stat.href} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                                    View <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-surface-800">Recent files</h3>
                        <Link href="/files" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">View all</Link>
                    </div>

                    <div className="card overflow-hidden !p-0">
                        {recentFiles?.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-200 bg-surface-100">
                                        <th className="table-header">Name</th>
                                        <th className="table-header">Size</th>
                                        <th className="table-header">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-200">
                                    {recentFiles.map((file) => (
                                        <tr key={file.uuid} className="hover:bg-surface-100 transition-colors">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <svg className="h-5 w-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={getFileIcon(file.type)} />
                                                    </svg>
                                                    <span className="font-medium text-surface-700">{file.name}</span>
                                                </div>
                                            </td>
                                            <td className="table-cell text-surface-500">{file.size}</td>
                                            <td className="table-cell text-surface-500">{file.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center py-12 text-center">
                                <svg className="h-12 w-12 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                <p className="mt-3 text-sm text-surface-500">No files yet.</p>
                                <Link href="/files" className="mt-2 btn-primary text-sm">Upload your first file</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
