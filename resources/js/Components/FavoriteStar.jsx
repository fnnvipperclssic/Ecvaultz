import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function FavoriteStar({ fileUuid, isFavorited }) {
    const [favorited, setFavorited] = useState(isFavorited);
    const [processing, setProcessing] = useState(false);

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (processing) return;

        // Optimistic update
        const previous = favorited;
        setFavorited(!favorited);
        setProcessing(true);

        router.post(
            `/files/${fileUuid}/favorite`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    // Revert on error
                    setFavorited(previous);
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <button
            onClick={handleToggle}
            disabled={processing}
            className={`rounded p-1 transition-colors ${
                favorited
                    ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10'
                    : 'text-surface-400 hover:text-yellow-500 hover:bg-yellow-500/10'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <svg
                className="h-4 w-4"
                fill={favorited ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
            </svg>
        </button>
    );
}
