import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Trash({ files, retentionDays }) {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedFiles(files.data.map(f => f.uuid));
        } else {
            setSelectedFiles([]);
        }
    };

    const toggleSelectFile = (uuid) => {
        setSelectedFiles(prev =>
            prev.includes(uuid) ? prev.filter(f => f !== uuid) : [...prev, uuid]
        );
    };

    const handleRestore = (uuid) => {
        router.post('/files/' + uuid + '/restore', {}, { preserveScroll: true });
    };

    const handlePermanentDelete = (uuid) => {
        const password = prompt('Enter your password to permanently delete this file:');
        if (!password) return;
        router.delete('/files/' + uuid + '/force', {
            data: { password },
            preserveScroll: true,
        });
    };

    const handleBulkRestore = () => {
        if (selectedFiles.length === 0) return;
        router.post('/files/bulk', {
            file_uuids: selectedFiles,
            action: 'restore',
        }, { preserveScroll: true, onSuccess: () => setSelectedFiles([]) });
    };

    const handleBulkPermanentDelete = () => {
        if (selectedFiles.length === 0) return;
        const password = prompt('This will PERMANENTLY delete ' + selectedFiles.length + ' file(s). Enter your password to confirm:');
        if (!password) return;
        router.post('/files/bulk', {
            file_uuids: selectedFiles,
            action: 'permanent_delete',
            password,
        }, { preserveScroll: true, onSuccess: () => setSelectedFiles([]) });
    };

    return (
        <AuthenticatedLayout header="Trash">
            <div className="px-6 py-6">
                <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-200 p-3">
                    <p className="text-sm text-amber-700">
                        Files in trash will be automatically deleted after {retentionDays} days.
                        You can restore them before that time.
                    </p>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="mb-4 flex items-center gap-2">
                        <button onClick={handleBulkRestore} className="btn-primary text-sm">
                            Restore ({selectedFiles.length})
                        </button>
                        <button onClick={handleBulkPermanentDelete} className="btn-danger text-sm">
                            Delete permanently ({selectedFiles.length})
                        </button>
                    </div>
                )}

                <div className="card overflow-hidden !p-0">
                    {files?.data?.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-200 bg-surface-50">
                                    <th className="table-header w-10">
                                        <input
                                            type="checkbox"
                                            onChange={toggleSelectAll}
                                            checked={selectedFiles.length === files.data.length && files.data.length > 0}
                                            className="h-4 w-4 rounded border-surface-300 text-primary-600"
                                        />
                                    </th>
                                    <th className="table-header">Name</th>
                                    <th className="table-header hidden md:table-cell">Size</th>
                                    <th className="table-header">Deleted</th>
                                    <th className="table-header hidden lg:table-cell">Days left</th>
                                    <th className="table-header w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {files.data.map((file) => (
                                    <tr key={file.uuid} className="hover:bg-surface-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedFiles.includes(file.uuid)}
                                                onChange={() => toggleSelectFile(file.uuid)}
                                                className="h-4 w-4 rounded border-surface-300 text-primary-600"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <svg className="h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm font-medium text-surface-700">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell hidden md:table-cell">{file.size}</td>
                                        <td className="table-cell text-surface-500">{file.deleted_at_human}</td>
                                        <td className="table-cell hidden lg:table-cell">
                                            <span className={`badge ${file.days_until_permanent <= 3 ? 'badge-danger' : file.days_until_permanent <= 7 ? 'badge-warning' : 'badge-info'}`}>
                                                {file.days_until_permanent}d
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleRestore(file.uuid)} className="rounded p-1 text-surface-400 hover:text-green-600 hover:bg-security-glow/60" title="Restore">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                </button>
                                                <button onClick={() => handlePermanentDelete(file.uuid)} className="rounded p-1 text-surface-400 hover:text-red-600 hover:bg-red-500/10" title="Delete permanently">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center py-16 text-center">
                            <svg className="h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <p className="mt-3 text-sm text-surface-500">Trash is empty</p>
                            <Link href="/files" className="mt-2 text-sm text-primary-600 hover:text-primary-700">
                                Back to files
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
