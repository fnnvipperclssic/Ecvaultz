import React, { useState, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';

export default function AvatarUpload({ currentAvatarUrl }) {
    const { enqueueSnackbar } = useSnackbar();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = useCallback(
        (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Preview locally
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreview(ev.target.result);
            };
            reader.readAsDataURL(file);

            // Upload
            setUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);

            router.post('/profile/avatar', formData, {
                onSuccess: () => {
                    setUploading(false);
                    enqueueSnackbar('Avatar updated successfully', { variant: 'success' });
                },
                onError: (errors) => {
                    setUploading(false);
                    setPreview(null);
                    const msg = Object.values(errors).flat().join(', ') || 'Failed to upload avatar';
                    enqueueSnackbar(msg, { variant: 'error' });
                },
                onFinish: () => {
                    setUploading(false);
                },
                preserveScroll: true,
            });
        },
        [enqueueSnackbar]
    );

    const avatarSrc = preview || currentAvatarUrl || null;

    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                <div
                    className="h-20 w-20 cursor-pointer overflow-hidden rounded-full ring-2 ring-surface-300 hover:ring-primary-500/50 transition-all"
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleClick();
                    }}
                >
                    {avatarSrc ? (
                        <img
                            src={avatarSrc}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-600/20 text-2xl font-medium text-primary-400">
                            ?
                        </div>
                    )}

                    {/* Upload overlay */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>

                {uploading && (
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600">
                        <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
            </div>

            <div>
                <p className="text-sm font-medium text-surface-700">Profile photo</p>
                <p className="text-xs text-surface-500">Click to upload a new avatar (JPEG, PNG, WEBP)</p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
