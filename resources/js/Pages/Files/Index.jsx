import React, { useState, useCallback, useRef } from 'react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function FilesIndex({ files, folders, breadcrumbs, currentFolderId, filters }) {
    const { app } = usePage().props;
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const { post, processing } = useForm();
    const searchTimeout = useRef(null);

    const onDrop = useCallback((acceptedFiles) => {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append('files[]', file);
        });
        if (currentFolderId) {
            formData.append('folder_id', currentFolderId);
        }

        setUploading(true);

        router.post('/files', formData, {
            onProgress: (event) => {
                if (event?.lengthComputable) {
                    setUploadProgress({ current: event.loaded, total: event.total, percent: Math.round((event.loaded / event.total) * 100) });
                }
            },
            onFinish: () => {
                setUploading(false);
                setUploadProgress({});
            },
            onSuccess: () => {
                setUploading(false);
                setUploadProgress({});
            },
            preserveScroll: true,
        });
    }, [currentFolderId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: app?.max_upload_size || 52428800,
    });

    const handleSearch = (value) => {
        setSearchQuery(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get('/files', { search: value, folder_id: currentFolderId }, { preserveState: true, replace: true });
        }, 300);
    };

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

    const handleBulkDelete = () => {
        if (selectedFiles.length === 0) return;
        if (selectedFiles.length > 10) {
            const password = prompt('This action affects ' + selectedFiles.length + ' files. Enter your password to confirm:');
            if (!password) return;
            router.post('/files/bulk', {
                file_uuids: selectedFiles,
                action: 'delete',
                password: password,
            }, { preserveScroll: true });
        } else {
            if (!confirm('Move ' + selectedFiles.length + ' file(s) to trash?')) return;
            router.post('/files/bulk', {
                file_uuids: selectedFiles,
                action: 'delete',
            }, { preserveScroll: true, onSuccess: () => setSelectedFiles([]) });
        }
    };

    const createFolder = (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        router.post('/folders', {
            name: newFolderName,
            parent_id: currentFolderId,
        }, {
            preserveScroll: true,
            onSuccess: () => { setShowNewFolder(false); setNewFolderName(''); },
        });
    };

    const getFileIcon = (mimeType) => {
        if (mimeType?.startsWith('image/')) return (
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        );
        if (mimeType === 'application/pdf') return (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        );
        return (
            <svg className="h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    };

    return (
        <AuthenticatedLayout header="My Files">
            <div className="px-6 py-6">
                {/* Toolbar */}
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search files..."
                            className="input pl-10"
                        />
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {selectedFiles.length > 0 && (
                            <button onClick={handleBulkDelete} className="btn-danger text-sm">
                                Delete ({selectedFiles.length})
                            </button>
                        )}
                        <button onClick={() => setShowNewFolder(!showNewFolder)} className="btn-secondary text-sm">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-8 4V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                            New Folder
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                            className="btn-secondary text-sm !px-2.5"
                            title="Toggle view"
                        >
                            {viewMode === 'list' ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* New folder form */}
                {showNewFolder && (
                    <form onSubmit={createFolder} className="mb-4 flex items-center gap-3 rounded-lg border border-surface-200 bg-surface-100 p-3">
                        <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Folder name"
                            className="input flex-1"
                            autoFocus
                        />
                        <button type="submit" className="btn-primary text-sm">Create</button>
                        <button type="button" onClick={() => setShowNewFolder(false)} className="btn-ghost text-sm">Cancel</button>
                    </form>
                )}

                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={`mb-6 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                        isDragActive ? 'border-primary-400 bg-primary-50' : 'border-surface-300 hover:border-surface-400 bg-surface-50'
                    }`}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div className="space-y-3">
                            <svg className="mx-auto h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-sm text-surface-600">Uploading...</p>
                            {uploadProgress.percent && (
                                <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-surface-200">
                                    <div className="h-full bg-primary-500 transition-all" style={{ width: uploadProgress.percent + '%' }} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <svg className="mx-auto h-10 w-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-surface-700">
                                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                            </p>
                            <p className="mt-1 text-xs text-surface-500">
                                or click to browse. Max 50 MB per file. Allowed: {app?.allowed_extensions?.join(', ')}
                            </p>
                        </>
                    )}
                </div>

                {/* Breadcrumbs */}
                {breadcrumbs?.length > 0 && (
                    <nav className="mb-4 flex items-center gap-1 text-sm text-surface-500">
                        <Link href="/files" className="hover:text-primary-600">Files</Link>
                        {breadcrumbs.map((crumb) => (
                            <React.Fragment key={crumb.uuid}>
                                <span>/</span>
                                <Link href={'/files?folder_id=' + crumb.uuid} className="hover:text-primary-600">{crumb.name}</Link>
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                {/* Folders */}
                {folders?.length > 0 && (
                    <div className="mb-6">
                        <h4 className="mb-3 text-sm font-medium text-surface-500 uppercase tracking-wider">Folders</h4>
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'
                            : 'space-y-1'
                        }>
                            {folders.map((folder) => (
                                <Link
                                    key={folder.uuid}
                                    href={'/files?folder_id=' + folder.uuid}
                                    className={`flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-surface-100 ${
                                        viewMode === 'grid' ? 'flex-col text-center border border-surface-200' : ''
                                    }`}
                                >
                                    <svg className={`${viewMode === 'grid' ? 'h-10 w-10' : 'h-5 w-5'} text-amber-500 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    <div className={viewMode === 'grid' ? '' : ''}>
                                        <p className="text-sm font-medium text-surface-700">{folder.name}</p>
                                        <p className="text-xs text-surface-400">{folder.file_count} files</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files table */}
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
                                    <th className="table-header hidden lg:table-cell">Modified</th>
                                    <th className="table-header w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {files.data.map((file) => (
                                    <tr key={file.uuid} className="hover:bg-surface-50 transition-colors group">
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
                                                {getFileIcon(file.mime_type)}
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-surface-700">{file.name}</p>
                                                    <p className="text-xs text-surface-400 md:hidden">{file.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell hidden md:table-cell">{file.size}</td>
                                        <td className="table-cell hidden lg:table-cell">{file.uploaded_at_human}</td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {file.can_preview && (
                                                    <Link href={'/files/' + file.uuid} className="rounded p-1 text-surface-400 hover:text-primary-600 hover:bg-primary-50" title="Preview">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                )}
                                                <a href={'/files/' + file.uuid + '/download'} className="rounded p-1 text-surface-400 hover:text-primary-600 hover:bg-primary-50" title="Download">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                </a>
                                                <Link href={'/shares'} className="rounded p-1 text-surface-400 hover:text-amber-500 hover:bg-amber-500/10" title="Share" data={{ file_uuid: file.uuid }}>
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                </Link>
                                                <Link href={'/files/' + file.uuid} className="rounded p-1 text-surface-400 hover:text-red-600 hover:bg-red-500/10" title="Delete" as="button" method="delete">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center py-16 text-center">
                            <svg className="h-16 w-16 text-surface-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <p className="mt-4 text-sm font-medium text-surface-500">No files in this folder</p>
                            <p className="mt-1 text-xs text-surface-400">Drag & drop files above to upload</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {files?.links && files.links.length > 3 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-surface-500">
                            Showing {files.from} to {files.to} of {files.total} files
                        </p>
                        <div className="flex gap-1" dangerouslySetInnerHTML={{ __html: files.links.join('') }} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
