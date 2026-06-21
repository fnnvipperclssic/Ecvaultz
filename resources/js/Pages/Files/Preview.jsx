import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FavoriteStar from '@/Components/FavoriteStar';
import TagBadge from '@/Components/TagBadge';
import TagSelector from '@/Components/TagSelector';
import FileActivityPanel from '@/Components/FileActivityPanel';

export default function FilePreview({ file }) {
    const { enqueueSnackbar } = useSnackbar();
    const [editingDescription, setEditingDescription] = useState(false);
    const [descriptionText, setDescriptionText] = useState(file.description || '');

    const isImage = file.mime_type?.startsWith('image/');
    const isPDF = file.mime_type === 'application/pdf';

    const handleSaveDescription = () => {
        router.post('/files/' + file.uuid + '/description', {
            description: descriptionText,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setEditingDescription(false);
                enqueueSnackbar('Description updated', { variant: 'success' });
            },
            onError: () => {
                enqueueSnackbar('Failed to update description', { variant: 'error' });
            },
        });
    };

    return (
        <AuthenticatedLayout header={'Preview: ' + file.name}>
            <div className="px-6 py-4">
                {/* File info bar */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-200 bg-white p-3">
                    <div className="flex items-center gap-4">
                        <FavoriteStar fileUuid={file.uuid} isFavorited={file.is_favorited || false} />
                        <div>
                            <p className="text-sm font-medium text-surface-700">{file.name}</p>
                            <p className="text-xs text-surface-500">{file.size}</p>
                        </div>
                        {/* Tags */}
                        {file.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {file.tags.map((tag) => (
                                    <TagBadge key={tag.id || tag.name} tag={tag} />
                                ))}
                            </div>
                        )}
                        <TagSelector fileUuid={file.uuid} initialTags={file.tags || []} />
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

                {/* Description */}
                <div className="mb-4 rounded-lg border border-surface-200 bg-white p-3">
                    {editingDescription ? (
                        <div className="space-y-2">
                            <label className="label text-xs">Description</label>
                            <textarea
                                value={descriptionText}
                                onChange={(e) => setDescriptionText(e.target.value)}
                                className="input w-full text-sm"
                                rows={2}
                                placeholder="Add a description for this file..."
                            />
                            <div className="flex gap-2">
                                <button onClick={handleSaveDescription} className="btn-primary text-xs">Save</button>
                                <button onClick={() => {
                                    setEditingDescription(false);
                                    setDescriptionText(file.description || '');
                                }} className="btn-ghost text-xs">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-medium text-surface-500">Description</span>
                                <p className="text-sm text-surface-700 mt-0.5">
                                    {file.description || 'No description'}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingDescription(true)}
                                className="text-xs text-primary-500 hover:text-primary-600"
                            >
                                Edit
                            </button>
                        </div>
                    )}
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

                {/* Activity Panel */}
                <div className="card mt-4">
                    <h3 className="text-sm font-semibold text-surface-900 mb-4">Activity History</h3>
                    <FileActivityPanel fileUuid={file.uuid} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
