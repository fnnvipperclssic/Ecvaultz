import React from 'react';
import { Link, router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function VersionDiff({ file, versionA, versionB, isText = false, contentDiff = null, prevVersion, nextVersion }) {
    const { enqueueSnackbar } = useSnackbar();

    if (!versionA || !versionB) {
        return (
            <AuthenticatedLayout header="Version Comparison">
                <div className="px-6 py-6">
                    <div className="card flex flex-col items-center py-16 text-center">
                        <svg className="h-12 w-12 text-surface-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-surface-500">Select two file versions to compare</p>
                        <Link href={'/files/' + (file?.uuid || '') + '/versions'} className="mt-3 btn-secondary text-sm">
                            Back to versions
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const formatBytes = (bytes) => {
        if (!bytes && bytes !== 0) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleRestore = (versionUuid) => {
        if (!confirm('Restore this version? The current file will be replaced.')) return;
        router.post('/files/' + (file?.uuid || '') + '/versions/' + versionUuid + '/restore', {}, {
            preserveScroll: true,
            onSuccess: () => enqueueSnackbar('Version restored successfully', { variant: 'success' }),
            onError: () => enqueueSnackbar('Failed to restore version', { variant: 'error' }),
        });
    };

    const metaRows = [
        { label: 'Name', a: versionA.name, b: versionB.name },
        { label: 'Size', a: formatBytes(versionA.size), b: formatBytes(versionB.size) },
        { label: 'Type', a: versionA.mime_type || versionA.mime, b: versionB.mime_type || versionB.mime },
        { label: 'Created', a: versionA.created_at || versionA.created, b: versionB.created_at || versionB.created },
    ];

    const isBinary = !isText && !contentDiff;

    return (
        <AuthenticatedLayout header={'Compare: ' + (file?.name || 'File Versions')}>
            <div className="px-6 py-6 max-w-6xl mx-auto">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        {prevVersion && (
                            <Link
                                href={'/files/' + (file?.uuid || '') + '/versions/diff?version_a=' + prevVersion.uuid + '&version_b=' + versionB.uuid}
                                className="btn-ghost text-sm"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleRestore(versionA.uuid || versionA.id)} className="btn-primary text-sm">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Restore Version {versionA.version_number || 'A'}
                        </button>
                        {nextVersion && (
                            <Link
                                href={'/files/' + (file?.uuid || '') + '/versions/diff?version_a=' + versionA.uuid + '&version_b=' + nextVersion.uuid}
                                className="btn-ghost text-sm"
                            >
                                Next
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Metadata comparison */}
                <div className="card mb-6">
                    <h3 className="text-sm font-semibold text-surface-900 mb-4">Metadata Comparison</h3>
                    <div className="grid grid-cols-3 gap-0">
                        {/* Header row */}
                        <div className="px-3 py-2 text-xs font-medium text-surface-500 uppercase tracking-wider">Field</div>
                        <div className="px-3 py-2 text-xs font-medium text-surface-500 uppercase tracking-wider bg-surface-50/50">
                            Version {versionA.version_number || 'A'}
                        </div>
                        <div className="px-3 py-2 text-xs font-medium text-surface-500 uppercase tracking-wider bg-surface-50/50">
                            Version {versionB.version_number || 'B'}
                        </div>

                        {/* Data rows */}
                        {metaRows.map((row) => {
                            const isDifferent = row.a !== row.b;
                            return (
                                <React.Fragment key={row.label}>
                                    <div className="px-3 py-2.5 text-sm text-surface-500 border-t border-surface-200">{row.label}</div>
                                    <div className={`px-3 py-2.5 text-sm border-t border-surface-200 bg-surface-50/50 ${isDifferent ? 'text-red-500 bg-red-500/5' : 'text-surface-700'}`}>
                                        {row.a || '—'}
                                    </div>
                                    <div className={`px-3 py-2.5 text-sm border-t border-surface-200 bg-surface-50/50 ${isDifferent ? 'text-green-500 bg-green-500/5' : 'text-surface-700'}`}>
                                        {row.b || '—'}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Content diff */}
                {isBinary ? (
                    <div className="card flex flex-col items-center py-12 text-center">
                        <svg className="h-12 w-12 text-surface-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium text-surface-500">Binary files cannot be compared</p>
                        <p className="text-xs text-surface-400 mt-1">Content diff is only available for text-based files</p>
                    </div>
                ) : contentDiff ? (
                    <div className="card overflow-hidden !p-0">
                        <div className="grid grid-cols-2 divide-x divide-surface-200">
                            {/* Version A */}
                            <div>
                                <div className="sticky top-0 px-4 py-2 bg-surface-50 border-b border-surface-200 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Version {versionA.version_number || 'A'}
                                </div>
                                <pre className="p-4 text-xs leading-relaxed overflow-x-auto max-h-96 overflow-y-auto font-mono">
                                    {contentDiff.linesA?.map((line, i) => (
                                        <div
                                            key={i}
                                            className={`${
                                                line.type === 'removed'
                                                    ? 'bg-red-500/10 text-red-400 -mx-4 px-4'
                                                    : line.type === 'added'
                                                        ? 'bg-green-500/10 text-green-400 -mx-4 px-4'
                                                        : 'text-surface-600'
                                            }`}
                                        >
                                            {line.content}
                                        </div>
                                    )) || (
                                        <div className="text-surface-400 italic">No content available</div>
                                    )}
                                </pre>
                            </div>

                            {/* Version B */}
                            <div>
                                <div className="sticky top-0 px-4 py-2 bg-surface-50 border-b border-surface-200 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Version {versionB.version_number || 'B'}
                                </div>
                                <pre className="p-4 text-xs leading-relaxed overflow-x-auto max-h-96 overflow-y-auto font-mono">
                                    {contentDiff.linesB?.map((line, i) => (
                                        <div
                                            key={i}
                                            className={`${
                                                line.type === 'removed'
                                                    ? 'bg-red-500/10 text-red-400 -mx-4 px-4'
                                                    : line.type === 'added'
                                                        ? 'bg-green-500/10 text-green-400 -mx-4 px-4'
                                                        : 'text-surface-600'
                                            }`}
                                        >
                                            {line.content}
                                        </div>
                                    )) || (
                                        <div className="text-surface-400 italic">No content available</div>
                                    )}
                                </pre>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 px-4 py-2 border-t border-surface-200 bg-surface-50 text-xs text-surface-500">
                            <span className="flex items-center gap-1">
                                <span className="inline-block h-3 w-3 rounded bg-red-500/20" />
                                Removed
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="inline-block h-3 w-3 rounded bg-green-500/20" />
                                Added
                            </span>
                            <span className="text-surface-400 ml-auto">
                                Showing differences between two versions
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="card flex flex-col items-center py-12 text-center">
                        <p className="text-sm text-surface-500">No content diff available for this file type</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
