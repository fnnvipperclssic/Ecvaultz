import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';

export default function TagSelector({ fileUuid, initialTags = [] }) {
    const { enqueueSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [appliedTagIds, setAppliedTagIds] = useState(new Set(initialTags.map((t) => t.id)));
    const [newTagName, setNewTagName] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const dropdownRef = useRef(null);

    // Load all user tags on mount
    useEffect(() => {
        if (open && allTags.length === 0) {
            const abortController = new AbortController();
            setLoading(true);
            fetch('/tags', { signal: abortController.signal })
                .then((res) => res.json())
                .then((data) => {
                    if (!abortController.signal.aborted) {
                        setAllTags(Array.isArray(data) ? data : data.tags || []);
                    }
                })
                .catch((err) => {
                    if (!abortController.signal.aborted) {
                        enqueueSnackbar('Failed to load tags', { variant: 'error' });
                    }
                })
                .finally(() => {
                    if (!abortController.signal.aborted) {
                        setLoading(false);
                    }
                });
            return () => abortController.abort();
        }
    }, [open, allTags.length, enqueueSnackbar]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    const toggleTag = (tagId) => {
        const wasApplied = appliedTagIds.has(tagId);
        const newSet = new Set(appliedTagIds);

        if (wasApplied) {
            newSet.delete(tagId);
            router.delete(`/files/${fileUuid}/tags/${tagId}`, {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    // Revert
                    setAppliedTagIds((prev) => new Set([...prev, tagId]));
                    enqueueSnackbar('Failed to remove tag', { variant: 'error' });
                },
            });
        } else {
            newSet.add(tagId);
            router.post(
                `/files/${fileUuid}/tags/${tagId}`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError: () => {
                        // Revert
                        setAppliedTagIds((prev) => {
                            const s = new Set(prev);
                            s.delete(tagId);
                            return s;
                        });
                        enqueueSnackbar('Failed to add tag', { variant: 'error' });
                    },
                }
            );
        }

        setAppliedTagIds(newSet);
    };

    const handleCreateTag = (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;
        setCreating(true);

        fetch('/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            body: JSON.stringify({ name: newTagName.trim() }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.tag || data.id) {
                    const tag = data.tag || data;
                    setAllTags((prev) => [...prev, tag]);
                    setNewTagName('');
                    enqueueSnackbar('Tag created', { variant: 'success' });
                } else if (data.errors) {
                    enqueueSnackbar(Object.values(data.errors).flat().join(', '), { variant: 'error' });
                }
            })
            .catch(() => {
                enqueueSnackbar('Failed to create tag', { variant: 'error' });
            })
            .finally(() => setCreating(false));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="rounded p-1 text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Manage tags"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-surface-300 bg-surface-100 shadow-lg">
                    <div className="border-b border-surface-300 px-3 py-2">
                        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Tags</p>
                    </div>

                    <div className="max-h-48 overflow-y-auto p-2 space-y-0.5">
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <svg className="h-5 w-5 animate-spin text-surface-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            </div>
                        ) : allTags.length === 0 ? (
                            <p className="text-xs text-surface-500 text-center py-3">No tags yet. Create one below.</p>
                        ) : (
                            allTags.map((tag) => (
                                <label
                                    key={tag.id}
                                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-200/50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={appliedTagIds.has(tag.id)}
                                        onChange={() => toggleTag(tag.id)}
                                        className="h-4 w-4 rounded border-surface-300 text-primary-600"
                                    />
                                    <span
                                        className="inline-block h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: tag.color || '#6b7280' }}
                                    />
                                    <span className="text-surface-700">{tag.name}</span>
                                </label>
                            ))
                        )}
                    </div>

                    {/* Create new tag */}
                    <div className="border-t border-surface-300 p-2">
                        <form onSubmit={handleCreateTag} className="flex items-center gap-1">
                            <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="New tag name..."
                                className="input flex-1 text-xs py-1.5 px-2"
                                disabled={creating}
                            />
                            <button
                                type="submit"
                                disabled={creating || !newTagName.trim()}
                                className="btn-primary text-xs py-1.5 px-2.5 whitespace-nowrap"
                            >
                                {creating ? (
                                    <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    'Add'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
