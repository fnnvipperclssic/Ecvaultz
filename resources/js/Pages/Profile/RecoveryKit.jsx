import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function RecoveryKit({ recoveryPhrase = [] }) {
    const { enqueueSnackbar } = useSnackbar();
    const [savedConfirmed, setSavedConfirmed] = useState(false);

    // Ensure we have 12 words, pad with empty if needed
    const words = Array.from({ length: 12 }, (_, i) => recoveryPhrase[i] || '');

    const handleCopy = () => {
        const phraseText = words.map((w, i) => `${i + 1}. ${w}`).join('\n');
        navigator.clipboard.writeText(phraseText);
        enqueueSnackbar('Recovery phrase copied to clipboard', { variant: 'success' });
    };

    const handleDownload = () => {
        router.get('/profile/recovery-kit/download');
        enqueueSnackbar('Downloading recovery kit...', { variant: 'info' });
    };

    return (
        <AuthenticatedLayout header="Encryption Recovery Kit">
            <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
                {/* Warning banner */}
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-400">Important: Store these words securely</h3>
                            <p className="mt-1 text-sm text-red-300/80">
                                This recovery phrase is the only way to recover your encrypted files if you lose your password.
                                If you lose both your password and this recovery phrase, your encrypted files will be permanently unrecoverable.
                                Do not share these words with anyone. Store them in a safe, offline location.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recovery phrase grid */}
                <div className="card">
                    <h3 className="text-base font-semibold text-surface-900 mb-1">Your Recovery Phrase</h3>
                    <p className="text-sm text-surface-500 mb-6">
                        Write down these 12 words in order and keep them safe. Do not store them digitally.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                        {words.map((word, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2.5"
                            >
                                <span className="text-xs font-medium text-surface-400 w-5 text-right">{i + 1}.</span>
                                <span className="text-sm font-mono font-medium text-surface-800">{word}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button onClick={handleCopy} className="btn-secondary text-sm">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy to Clipboard
                        </button>
                        <button onClick={handleDownload} className="btn-secondary text-sm">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            Download as PDF
                        </button>
                    </div>
                </div>

                {/* Confirmation */}
                <div className="card border-amber-500/30">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={savedConfirmed}
                            onChange={(e) => setSavedConfirmed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-surface-300 text-primary-600"
                        />
                        <div>
                            <span className="text-sm font-medium text-surface-900">
                                I have saved my recovery phrase in a secure location
                            </span>
                            <p className="text-xs text-surface-500 mt-0.5">
                                Checking this confirms you have stored the 12-word recovery phrase safely.
                                You will need it to recover your encrypted files if you forget your password.
                            </p>
                        </div>
                    </label>

                    {savedConfirmed && (
                        <div className="mt-4 rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-green-400">Recovery phrase confirmed as saved.</span>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
