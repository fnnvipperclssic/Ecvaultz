import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function ConfirmModal({
    isOpen,
    onClose,
    title = 'Confirm action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    action,
    method = 'POST',
    requirePassword = false,
}) {
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
            setProcessing(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const handleEsc = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => window.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (requirePassword && !password) {
            setError('Password is required');
            return;
        }

        setProcessing(true);
        setError('');

        if (typeof action === 'function') {
            // Callback function
            try {
                action(password);
            } catch (e) {
                setError(e.message || 'An error occurred');
            } finally {
                setProcessing(false);
                onClose();
            }
        } else if (typeof action === 'string') {
            // Inertia URL
            const data = {};
            if (requirePassword && password) {
                data.password = password;
            }

            router[method.toLowerCase()](action, data, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                },
                onError: (errors) => {
                    setProcessing(false);
                    const msg = Object.values(errors).flat().join(', ') || 'An error occurred';
                    setError(msg);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            });
        } else {
            setProcessing(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-surface-100 p-6 shadow-xl animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-surface-400 hover:text-surface-600 hover:bg-surface-200 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-surface-500">{message}</p>

                    {requirePassword && (
                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                className={`input ${error ? 'input-error' : ''}`}
                                placeholder="Enter your password to confirm"
                                autoFocus
                                required
                            />
                            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="btn-secondary flex-1" disabled={processing}>
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={processing}
                        className="btn-danger flex-1"
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
