import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function FilePreview({ file }) {
    const isImage = file.mime_type?.startsWith('image/');
    const isPDF = file.mime_type === 'application/pdf';

    return (
        <AuthenticatedLayout header={'Preview: ' + file.name}>
            <div className="px-6 py-4">
                {/* File info bar */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-200 bg-white p-3">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm font-medium text-surface-700">{file.name}</p>
                            <p className="text-xs text-surface-500">{file.size}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={'/files/' + file.uuid + '/download'}
                            className="btn-primary text-sm"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </a>
                        <Link href="/files" className="btn-secondary text-sm">Back to files</Link>
                    </div>
                </div>

                {/* Preview area */}
                <div className="card flex items-center justify-center overflow-hidden !p-0 min-h-[60vh]">
                    {isImage && (
                        <img
                            src={file.content}
                            alt={file.name}
                            className="max-h-[70vh] object-contain"
                        />
                    )}
                    {isPDF && (
                        <iframe
                            src={file.content}
                            className="h-[70vh] w-full border-0"
                            title={file.name}
                        />
                    )}
                    {!isImage && !isPDF && (
                        <div className="flex flex-col items-center py-16 text-center">
                            <svg className="h-16 w-16 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-sm text-surface-500">Preview not available for this file type</p>
                            <a href={'/files/' + file.uuid + '/download'} className="mt-3 btn-primary">
                                Download instead
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
