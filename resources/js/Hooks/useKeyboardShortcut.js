import { useEffect } from 'react';

/**
 * Register global keyboard shortcuts.
 * Usage: useKeyboardShortcut('k', true, () => openCommandPalette());
 */
export default function useKeyboardShortcut(key, ctrlOrMeta, callback) {
    useEffect(() => {
        const handler = (e) => {
            const modifier = ctrlOrMeta ? (e.ctrlKey || e.metaKey) : true;
            if (modifier && e.key.toLowerCase() === key.toLowerCase()) {
                e.preventDefault();
                callback(e);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [key, ctrlOrMeta, callback]);
}
