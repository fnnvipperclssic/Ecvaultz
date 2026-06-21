import React, { useState, useCallback, useRef } from 'react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GlobalSearch from '@/Components/GlobalSearch';
import FavoriteStar from '@/Components/FavoriteStar';
import TagBadge from '@/Components/TagBadge';
import TagSelector from '@/Components/TagSelector';
import ContextMenu from '@/Components/ContextMenu';
import BreadcrumbNav from '@/Components/BreadcrumbNav';

export default function FilesIndex({ files, folders, breadcrumbs, currentFolderId, filters }) {
    const { app, auth } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [activeFilter, setActiveFilter] = useState(filters?.filter || 'all');
    const [editingDescription, setEditingDescription] = useState(null);
    const [descriptionText, setDescriptionText] = useState('');
    const [showExpiryModal, setShowExpiryModal] = useState(null);
    const [expiryDate, setExpiryDate] = useState('');
    const [draggedFileUuid, setDraggedFileUuid] = useState(null);
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, isOpen: false, file: null });
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
                enqueueSnackbar('Files uploaded successfully', { variant: 'success' });
            },
            onError: (errors) => {
                setUploading(false);
                setUploadProgress({});
                enqueueSnackbar('Upload failed: ' + (typeof errors === 'string' ? errors : 'File type or size not allowed.'), { variant: 'error' });
            },
            preserveScroll: true,
        });
    }, [currentFolderId, enqueueSnackbar]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: app?.max_upload_size || 52428800,
    });

    const handleSearch = (value) => {
        setSearchQuery(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get('/files', { search: value, folder_id: currentFolderId, filter: activeFilter }, { preserveState: true, replace: true });
        }, 300);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        router.get('/files', { filter, folder_id: currentFolderId, search: searchQuery }, { preserveState: true, replace: true });
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

    const handleDuplicate = (fileUuid) => {
        router.post('/files/' + fileUuid + '/duplicate', {}, {
            preserveScroll: true,
            onSuccess: () => enqueueSnackbar('File duplicated', { variant: 'success' }),
            onError: () => enqueueSnackbar('Failed to duplicate file', { variant: 'error' }),
        });
    };

    const handleSetExpiry = (fileUuid) => {
        if (!expiryDate) return;
        router.post('/files/' + fileUuid + '/expiry', {
            expires_at: expiryDate,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowExpiryModal(null);
                setExpiryDate('');
                enqueueSnackbar('Expiry date set', { variant: 'success' });
            },
            onError: () => enqueueSnackbar('Failed to set expiry', { variant: 'error' }),
        });
    };

    const handleSaveDescription = (fileUuid) => {
        router.post('/files/' + fileUuid + '/description', {
            description: descriptionText,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setEditingDescription(null);
                setDescriptionText('');
                enqueueSnackbar('Description updated', { variant: 'success' });
            },
            onError: () => enqueueSnackbar('Failed to update description', { variant: 'error' }),
        });
    };

    // Context menu handler
    const handleContextMenu = (e, file) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            isOpen: true,
            file,
        });
    };

    const closeContextMenu = () => {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
    };

    // Context menu action handlers
    const handlePreviewFromMenu = (file) => {
        router.visit('/files/' + file.uuid);
    };

    const handleDownloadFromMenu = (file) => {
        window.location.href = '/files/' + file.uuid + '/download';
    };

    const handleShareFromMenu = (file) => {
        router.visit('/shares?file_uuid=' + file.uuid);
    };

    const handleRenameFromMenu = (file) => {
        // Trigger inline rename by focusing name or use a prompt
        const newName = prompt('Rename file:', file.name);
        if (newName && newName.trim() && newName !== file.name) {
            router.post('/files/' + file.uuid + '/rename', { name: newName.trim() }, {
                preserveScroll: true,
                onSuccess: () => enqueueSnackbar('File renamed', { variant: 'success' }),
                onError: () => enqueueSnackbar('Failed to rename file', { variant: 'error' }),
            });
        }
    };

    const handleDuplicateFromMenu = (file) => {
        handleDuplicate(file.uuid);
    };

    const handleMoveToFolderFromMenu = (file) => {
        const folderId = prompt('Enter target folder UUID (leave empty for root):');
        router.post('/files/' + file.uuid + '/move', { folder_id: folderId || '' }, {
            preserveScroll: true,
            onSuccess: () => enqueueSnackbar('File moved', { variant: 'success' }),
            onError: () => enqueueSnackbar('Failed to move file', { variant: 'error' }),
        });
    };

    const handleTagsFromMenu = (file) => {
        // Focus the tag selector for this file - already available in the UI
        enqueueSnackbar('Use the tag icon next to the file to manage tags', { variant: 'info' });
    };

    const handleFavoriteFromMenu = (file) => {
        // The FavoriteStar component handles its own routing, so we trigger it indirectly
        router.post('/files/' + file.uuid + '/favorite', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDeleteFromMenu = (file) => {
        if (confirm('Move "' + file.name + '" to trash?')) {
            router.delete('/files/' + file.uuid, { preserveScroll: true });
        }
    };

    // Drag & drop handlers for file rows
    const handleDragStart = (e, fileUuid) => {
        e.dataTransfer.setData('text/plain', fileUuid);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedFileUuid(fileUuid);
    };

    const handleDragEnd = () => {
        setDraggedFileUuid(null);
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
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    {/* Global Search */}
                    <div className="flex-1 min-w-[200px] max-w-md">
                        <GlobalSearch placeholder="Search files..." />
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1">
                        {['all', 'favorites'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => handleFilterChange(filter)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    activeFilter === filter
                                        ? 'bg-primary-600/15 text-primary-400'
                                        : 'text-surface-500 hover:text-surface-700 hover:bg-surface-200'
                                }`}
                            >
                                {filter === 'all' ? 'All' : (
                                    <span className="flex items-center gap-1">
                                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                                            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                        </svg>
                                        Favorites
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

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
                        <button onClick={() => setShowNewFolder(!showNewFolder)} className="btn-secondary text-sm" data-onboard="new-folder">
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
                    data-onboard="upload-area"
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

                {/* Breadcrumb Navigation */}
                <BreadcrumbNav
                    currentFolder={breadcrumbs?.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null}
                    ancestors={breadcrumbs?.slice(0, -1) || []}
                />

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
                <div className="card overflow-hidden !p-0" data-onboard="file-table">
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
                                    <th className="table-header hidden md:table-cell">Tags</th>
                                    <th className="table-header hidden md:table-cell">Size</th>
                                    <th className="table-header hidden lg:table-cell">Modified</th>
                                    <th className="table-header w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {files.data.map((file) => (
                                    <tr
                                        key={file.uuid}
                                        className={`hover:bg-surface-50 transition-colors group ${
                                            draggedFileUuid === file.uuid ? 'opacity-50' : ''
                                        }`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, file.uuid)}
                                        onDragEnd={handleDragEnd}
                                        onContextMenu={(e) => handleContextMenu(e, file)}
                                    >
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
                                                    {/* Inline description edit */}
                                                    {editingDescription === file.uuid ? (
                                                        <div className="mt-1 flex items-center gap-1">
                                                            <input
                                                                type="text"
                                                                value={descriptionText}
                                                                onChange={(e) => setDescriptionText(e.target.value)}
                                                                className="input text-xs py-0.5 px-1.5 flex-1"
                                                                placeholder="Add description..."
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSaveDescription(file.uuid);
                                                                    if (e.key === 'Escape') setEditingDescription(null);
                                                                }}
                                                            />
                                                            <button onClick={() => handleSaveDescription(file.uuid)} className="text-xs text-primary-500 hover:text-primary-600">Save</button>
                                                            <button onClick={() => setEditingDescription(null)} className="text-xs text-surface-500 hover:text-surface-600">Cancel</button>
                                                        </div>
                                                    ) : file.description ? (
                                                        <p
                                                            className="text-xs text-surface-500 mt-0.5 cursor-pointer hover:text-surface-400"
                                                            onClick={() => {
                                                                setEditingDescription(file.uuid);
                                                                setDescriptionText(file.description || '');
                                                            }}
                                                        >
                                                            {file.description}
                                                        </p>
                                                    ) : (
                                                        <p
                                                            className="text-xs text-surface-400 mt-0.5 cursor-pointer hover:text-surface-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                setEditingDescription(file.uuid);
                                                                setDescriptionText('');
                                                            }}
                                                        >
                                                            + Add description
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 hidden md:table-cell">
                                            {file.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {file.tags.map((tag) => (
                                                        <TagBadge key={tag.id || tag.name} tag={tag} />
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="table-cell hidden md:table-cell">{file.size}</td>
                                        <td className="table-cell hidden lg:table-cell">{file.uploaded_at_human}</td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-1">
                                                <FavoriteStar fileUuid={file.uuid} isFavorited={file.is_favorited || false} />
                                                <TagSelector fileUuid={file.uuid} initialTags={file.tags || []} />
                                                {file.can_preview && (
                                                    <Link href={'/files/' + file.uuid} className="rounded p-1 text-surface-400 hover:text-primary-600 hover:bg-primary-50" title="Preview">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                )}
                                                <a href={'/files/' + file.uuid + '/download'} className="rounded p-1 text-surface-400 hover:text-primary-600 hover:bg-primary-50" title="Download">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                </a>
                                                {/* File action menu */}
                                                <div className="relative group/menu">
                                                    <button className="rounded p-1 text-surface-400 hover:text-surface-600 hover:bg-surface-200" title="More actions">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                                    </button>
                                                    <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-surface-300 bg-surface-100 shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all py-1">
                                                        <Link href={'/shares?file_uuid=' + file.uuid} className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-200/50">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                            Share
                                                        </Link>
                                                        <button onClick={() => handleDuplicate(file.uuid)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-200/50">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                            Duplicate
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowExpiryModal(file.uuid);
                                                                setExpiryDate(file.expires_at || '');
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-200/50"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            Set Expiry
                                                        </button>
                                                        <Link href={'/files/' + file.uuid} className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-200/50" as="button" method="delete">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            Move to Trash
                                                        </Link>
                                                    </div>
                                                </div>
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

                {/* Expiry Modal */}
                {showExpiryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExpiryModal(null)} />
                        <div className="relative w-full max-w-sm rounded-2xl bg-surface-100 p-6 shadow-xl animate-slide-up">
                            <h3 className="text-lg font-semibold text-surface-900 mb-4">Set File Expiry</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Expires at</label>
                                    <input
                                        type="datetime-local"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="input"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowExpiryModal(null)} className="btn-secondary flex-1">Cancel</button>
                                    <button onClick={() => handleSetExpiry(showExpiryModal)} className="btn-primary flex-1">
                                        Set Expiry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

            {/* Context Menu */}
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                isOpen={contextMenu.isOpen}
                file={contextMenu.file}
                onClose={closeContextMenu}
                onPreview={handlePreviewFromMenu}
                onDownload={handleDownloadFromMenu}
                onShare={handleShareFromMenu}
                onRename={handleRenameFromMenu}
                onDuplicate={handleDuplicateFromMenu}
                onMoveToFolder={handleMoveToFolderFromMenu}
                onTags={handleTagsFromMenu}
                onFavorite={handleFavoriteFromMenu}
                onDelete={handleDeleteFromMenu}
            />
        </AuthenticatedLayout>
    );
}
