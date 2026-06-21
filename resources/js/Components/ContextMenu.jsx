import React, { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, isOpen, onClose, file, onPreview, onDownload, onShare, onRename, onDuplicate, onMoveToFolder, onTags, onFavorite, onDelete }) {
    const menuRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        // Delay adding listener to avoid the same click that opened the menu
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        window.addEventListener('keydown', handleEsc);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !file) return null;

    // Adjust position so menu does not overflow viewport
    const adjustedX = Math.min(x, window.innerWidth - 220);
    const adjustedY = Math.min(y, window.innerHeight - 420);

    const menuItems = [
        // Group 1: Actions
        {
            group: 'actions',
            items: [
                { label: 'Preview', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', action: () => onPreview?.(file) },
                { label: 'Download', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', action: () => onDownload?.(file) },
                { label: 'Share', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z', action: () => onShare?.(file) },
            ],
        },
        // Group 2: Organization
        {
            group: 'organization',
            items: [
                { label: 'Rename', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125', action: () => onRename?.(file) },
                { label: 'Duplicate', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', action: () => onDuplicate?.(file) },
                { label: 'Move to Folder', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', action: () => onMoveToFolder?.(file) },
                { label: 'Tags', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', action: () => onTags?.(file) },
            ],
        },
        // Group 3: Favorite / Danger
        {
            group: 'favorite',
            items: [
                {
                    label: file.is_favorited ? 'Unfavorite' : 'Favorite',
                    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
                    action: () => onFavorite?.(file),
                    color: file.is_favorited ? 'text-yellow-400' : '',
                },
            ],
        },
        {
            group: 'danger',
            items: [
                { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: () => onDelete?.(file), danger: true },
            ],
        },
    ];

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-56 rounded-xl border border-surface-300 bg-surface-100/95 backdrop-blur-md shadow-xl py-1 animate-scale-in"
            style={{ left: adjustedX, top: adjustedY }}
        >
            {menuItems.map((group) => (
                <div key={group.group}>
                    {group.group !== 'actions' && <div className="mx-2 my-1 border-t border-surface-300" />}
                    {group.items.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                item.action();
                                onClose();
                            }}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${
                                item.danger
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : item.color
                                        ? item.color + ' hover:bg-surface-200/50'
                                        : 'text-surface-700 hover:bg-surface-200/50'
                            }`}
                        >
                            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
