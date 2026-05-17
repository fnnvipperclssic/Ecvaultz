import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function ShareAccess({ fileName, fileSize, sharedBy, downloadUrl, expiresAt, needsPassword, error }) {
    const { data, setData, post, processing, errors } = useForm({ password: '' });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        post(window.location.pathname);
    };

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
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-surface-900">{fileName}</h1>
                    <p className="mt-1 text-sm text-surface-500">
                        Shared by {sharedBy} · {fileSize}
                    </p>
                    {expiresAt && (
                        <p className="mt-1 text-xs text-amber-500">Expires {expiresAt}</p>
                    )}
                </div>

                <div className="card space-y-4">
                    <a
                        href={downloadUrl}
                        className="btn-primary w-full"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download file
                    </a>
                    <p className="text-center text-xs text-surface-400">
                        Secure download from Ecvaultz
                    </p>
                </div>
            </div>
        </div>
    );
}
