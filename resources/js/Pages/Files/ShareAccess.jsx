import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function ShareAccess({ fileName, fileSize, sharedBy, downloadUrl, expiresAt, needsPassword, error, mimeType, fileContentUrl, watermark }) {
    const { data, setData, post, processing, errors } = useForm({ password: '' });
    const [expiryCountdown, setExpiryCountdown] = useState('');

    const isImage = mimeType?.startsWith('image/');
    const isPDF = mimeType === 'application/pdf';
    const canPreview = isImage || isPDF;

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        post(window.location.pathname);
    };

    // Expiry countdown
    useEffect(() => {
        if (!expiresAt) return;

        const target = new Date(expiresAt).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setExpiryCountdown('Expired');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 24) {
                const days = Math.floor(hours / 24);
                setExpiryCountdown(days + ' days remaining');
            } else {
                setExpiryCountdown(hours + 'h ' + minutes + 'm ' + seconds + 's remaining');
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-surface-900">Link Expired</h2>
                    <p className="mt-2 text-sm text-surface-500">{error}</p>
                </div>
            </div>
        );
    }

    if (needsPassword) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold text-surface-900">Password Required</h1>
                        <p className="mt-1 text-sm text-surface-500">
                            This file is password protected. Enter the password shared by {sharedBy}.
                        </p>
                    </div>

                    <div className="card">
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="label">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`input ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter password"
                                    autoFocus
                                    required
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <button type="submit" disabled={processing} className="btn-primary w-full">
                                Unlock file
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-8">
            <div className="w-full max-w-2xl">
                {/* File metadata card */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600">
                        {isImage ? (
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        ) : isPDF ? (
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        ) : (
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>
                    <h1 className="text-xl font-semibold text-surface-900">{fileName}</h1>
                    <p className="mt-1 text-sm text-surface-500">
                        Shared by {sharedBy} &middot; {fileSize}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-3">
                        {mimeType && (
                            <span className="badge bg-surface-100 text-surface-600 text-xs">{mimeType}</span>
                        )}
                        {expiresAt && (
                            <span className={`text-xs font-medium ${expiryCountdown === 'Expired' ? 'text-red-500' : 'text-amber-500'}`}>
                                {expiryCountdown}
                            </span>
                        )}
                    </div>
                </div>

                {/* Preview area */}
                {canPreview && fileContentUrl ? (
                    <div className="card overflow-hidden !p-0 mb-6 relative">
                        {watermark && (
                            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-[0.08] select-none">
                                <span className="text-4xl font-bold text-surface-900 -rotate-30 whitespace-nowrap" style={{ transform: 'rotate(-30deg)' }}>
                                    {watermark}
                                </span>
                            </div>
                        )}
                        {isImage && (
                            <img
                                src={fileContentUrl}
                                alt={fileName}
                                className="w-full max-h-[60vh] object-contain"
                            />
                        )}
                        {isPDF && (
                            <iframe
                                src={fileContentUrl}
                                className="w-full h-[60vh] border-0"
                                title={fileName}
                            />
                        )}
                    </div>
                ) : (
                    <div className="card mb-6">
                        <div className="flex flex-col items-center py-10 text-center">
                            <svg className="h-16 w-16 text-surface-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm font-medium text-surface-500">Preview not available for this file type</p>
                            <p className="text-xs text-surface-400 mt-1">Download the file to view its contents</p>
                        </div>
                    </div>
                )}

                {/* Download button */}
                <div className="card">
                    <a href={downloadUrl} className="btn-primary w-full flex items-center justify-center gap-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download file
                    </a>
                    {canPreview && (
                        <p className="mt-2 text-center text-xs text-surface-400">
                            Secure preview and download from Ecvaultz
                        </p>
                    )}
                    {!canPreview && (
                        <p className="mt-2 text-center text-xs text-surface-400">
                            Secure download from Ecvaultz
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
