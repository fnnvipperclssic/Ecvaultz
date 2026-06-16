import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function VersionHistory({ file, versions }) {
    const [restoringId, setRestoringId] = useState(null);

    const handleRestore = (versionId) => {
        if (!confirm('Restore this version? Current file will be saved as a new version.')) return;
        setRestoringId(versionId);
        router.post('/files/versions/' + versionId + '/restore', {}, {
            preserveScroll: true,
            onFinish: () => setRestoringId(null),
        });
    };

    return (
        <AuthenticatedLayout header="File Version History">
            <div className="max-w-3xl mx-auto px-6 py-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-surface-800">{file?.name || 'File'}</h2>
                    <p className="text-sm text-surface-500">{versions?.length || 0} version(s)</p>
                </div>

                <div className="space-y-3">
                    {versions?.map((version) => (
                        <div key={version.id} className="card p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-surface-700">Version {version.version_number}</p>
                                <p className="text-xs text-surface-400">{version.size_human} — {version.created_at}</p>
                                <p className="text-xs text-surface-400">by {version.user_name}</p>
                            </div>
                            <button
                                onClick={() => handleRestore(version.id)}
                                disabled={restoringId === version.id}
                                className="btn-secondary text-sm"
                            >
                                {restoringId === version.id ? 'Restoring...' : 'Restore'}
                            </button>
                        </div>
                    ))}

                    {(!versions || versions.length === 0) && (
                        <div className="text-center py-12 text-surface-400">
                            <p className="text-sm">No previous versions available.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
