import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import useKeyboardShortcut from '@/Hooks/useKeyboardShortcut';

const COMMANDS = [
    { name: 'Go to Dashboard', keys: 'G D', action: () => router.visit('/dashboard') },
    { name: 'Go to Files', keys: 'G F', action: () => router.visit('/files') },
    { name: 'Go to Shared', keys: 'G S', action: () => router.visit('/shares') },
    { name: 'Go to Trash', keys: 'G T', action: () => router.visit('/files/trash') },
    { name: 'Go to Notifications', keys: 'G N', action: () => router.visit('/notifications') },
    { name: 'Go to Activity Log', keys: 'G L', action: () => router.visit('/activity-log') },
    { name: 'Upload File', keys: 'Ctrl U', action: () => router.visit('/files') },
    { name: 'Go to Profile', keys: 'G P', action: () => router.visit('/profile') },
];

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useKeyboardShortcut('k', true, useCallback(() => setOpen(o => !o), []));

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [open]);

    const filtered = COMMANDS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.keys.toLowerCase().includes(query.toLowerCase())
    );

    const execute = (cmd) => { cmd.action(); setOpen(false); };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && filtered[selectedIndex]) { e.preventDefault(); execute(filtered[selectedIndex]); }
        if (e.key === 'Escape') setOpen(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative glass-light rounded-2xl w-full max-w-lg shadow-glow-lg animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                    <svg className="h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder="Type a command..." className="flex-1 bg-transparent text-surface-200 placeholder-surface-500 outline-none text-sm" />
                    <kbd className="text-xs text-surface-500 bg-surface-200 px-2 py-0.5 rounded-md">ESC</kbd>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                    {filtered.map((cmd, i) => (
                        <button key={i} onClick={() => execute(cmd)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                i === selectedIndex ? 'bg-primary-600/15 text-primary-400' : 'text-surface-400 hover:bg-surface-200/50 hover:text-surface-300'
                            }`}>
                            <span>{cmd.name}</span>
                            <kbd className="text-xs text-surface-500">{cmd.keys}</kbd>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
