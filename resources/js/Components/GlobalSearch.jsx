import React, { useState, useRef, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function GlobalSearch({ placeholder = 'Search files...' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [noResults, setNoResults] = useState(false);
    const debounceRef = useRef(null);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const fetchResults = useCallback(
        (searchQuery) => {
            if (searchQuery.length < 2) {
                setResults([]);
                setOpen(false);
                setNoResults(false);
                return;
            }

            setLoading(true);
            setNoResults(false);

            fetch(`/files/search?q=${encodeURIComponent(searchQuery)}`)
                .then((res) => res.json())
                .then((data) => {
                    const items = Array.isArray(data) ? data : data.files || data.results || [];
                    setResults(items);
                    setOpen(true);
                    setSelectedIndex(-1);
                    setNoResults(items.length === 0);
                })
                .catch(() => {
                    setResults([]);
                    setNoResults(true);
                })
                .finally(() => setLoading(false));
        },
        []
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchResults(value);
        }, 300);
    };

    const handleSelect = (file) => {
        setOpen(false);
        setQuery('');
        setResults([]);
        if (file.uuid) {
            router.visit(`/files/${file.uuid}`);
        } else if (file.id) {
            router.visit(`/files/${file.id}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => clearTimeout(debounceRef.current);
    }, []);

    const getFileIcon = (file) => {
        const mime = file.mime_type || file.mime || '';
        if (mime.startsWith('image/')) {
            return (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        }
        if (mime === 'application/pdf') {
            return (
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }
        return (
            <svg className="h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    };

    const getFolderPath = (file) => {
        if (file.folder_path) return file.folder_path;
        if (file.path) return file.path;
        return '';
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (query.length >= 2 && results.length > 0) setOpen(true);
                    }}
                    placeholder={placeholder}
                    aria-label="Search files"
                    className="input pl-10 w-full"
                    data-onboard="search-bar"
                />
                {loading && (
                    <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-surface-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
            </div>

            {open && (
                <div className="absolute left-0 right-0 top-full z-[500] mt-1 max-h-80 overflow-y-auto rounded-xl border border-surface-300 bg-surface-100 shadow-xl">
                    {noResults ? (
                        <div className="flex flex-col items-center py-6 text-center">
                            <svg className="h-8 w-8 text-surface-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-sm text-surface-500">No results found</p>
                            <p className="text-xs text-surface-400 mt-0.5">Try a different search term</p>
                        </div>
                    ) : (
                        results.map((file, i) => (
                            <button
                                key={file.uuid || file.id || i}
                                onClick={() => handleSelect(file)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                    i === selectedIndex
                                        ? 'bg-primary-600/15 text-primary-400'
                                        : 'text-surface-700 hover:bg-surface-200/50'
                                }`}
                            >
                                <div className="flex-shrink-0">{getFileIcon(file)}</div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm truncate ${i === selectedIndex ? 'text-primary-400' : 'text-surface-200'}`}>
                                        {file.name}
                                    </p>
                                    {getFolderPath(file) && (
                                        <p className={`text-xs truncate ${i === selectedIndex ? 'text-primary-400/70' : 'text-surface-500'}`}>
                                            {getFolderPath(file)}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
