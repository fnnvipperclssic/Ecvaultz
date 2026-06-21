import React, { useEffect } from 'react';

const SHORTCUT_GROUPS = [
    {
        category: 'Navigation',
        shortcuts: [
            { keys: 'Ctrl+K / Cmd+K', description: 'Command palette' },
            { keys: '?', description: 'Show keyboard shortcuts' },
            { keys: '/', description: 'Focus search' },
            { keys: 'Escape', description: 'Close modal / menu' },
        ],
    },
    {
        category: 'Files',
        shortcuts: [
            { keys: 'U', description: 'Upload files' },
            { keys: 'N', description: 'New folder' },
            { keys: 'Ctrl+F', description: 'Filter files' },
            { keys: 'F2', description: 'Rename selected file' },
            { keys: 'Delete', description: 'Move to trash' },
            { keys: 'Space', description: 'Preview file' },
        ],
    },
    {
        category: 'General',
        shortcuts: [
            { keys: 'G then D', description: 'Go to Dashboard' },
            { keys: 'G then F', description: 'Go to Files' },
            { keys: 'G then S', description: 'Go to Shared' },
            { keys: 'G then T', description: 'Go to Trash' },
            { keys: 'G then N', description: 'Go to Notifications' },
        ],
    },
];

export default function KeyboardShortcuts({ isOpen, onClose }) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-surface-100 shadow-xl animate-slide-up">
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-300">
                    <h2 className="text-lg font-semibold text-surface-900">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-200 hover:text-surface-600 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-4 space-y-6">
                    {SHORTCUT_GROUPS.map((group) => (
                        <div key={group.category}>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">
                                {group.category}
                            </h3>
                            <div className="space-y-2">
                                {group.shortcuts.map((shortcut) => (
                                    <div
                                        key={shortcut.keys + shortcut.description}
                                        className="flex items-center justify-between py-1.5"
                                    >
                                        <span className="text-sm text-surface-700">{shortcut.description}</span>
                                        <kbd className="inline-flex items-center gap-1 rounded-lg border border-surface-300 bg-surface-50 px-2.5 py-1 text-xs font-medium text-surface-600 shadow-sm">
                                            {shortcut.keys}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-6 py-4 border-t border-surface-300">
                    <p className="text-xs text-surface-500 text-center">
                        Press <kbd className="inline-flex items-center rounded border border-surface-300 bg-surface-50 px-1.5 py-0.5 text-xs font-medium text-surface-500">?</kbd> at any time to open this dialog
                    </p>
                </div>
            </div>
        </div>
    );
}
