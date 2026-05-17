import React from 'react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function RecoveryCodes({ codes = [] }) {
    const { flash } = usePage().props;
    const [copied, setCopied] = React.useState(false);

    const copyAll = () => {
        navigator.clipboard.writeText(codes.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AuthenticatedLayout header="Recovery Codes">
            <div className="mx-auto max-w-2xl px-6 py-8">
                <div className="card space-y-6">
                    <div>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-5.636l-2.121 2.121a9 9 0 11-12.728 0l-2.121-2.12a9 9 0 0112.728 0z" />
                            </svg>
                        </div>
                        <h3 className="text-center text-lg font-semibold text-surface-900">Save your recovery codes</h3>
                        <p className="mt-2 text-center text-sm text-surface-500">
                            Store these codes in a safe place. Each code can only be used once.
                            You will not be able to view them again.
                        </p>
                    </div>

                    {codes.length > 0 && (
                        <div className="rounded-lg bg-surface-50 p-4">
                            <div className="grid grid-cols-2 gap-2">
                                {codes.map((code, index) => (
                                    <div
                                        key={index}
                                        className="rounded border border-surface-200 bg-white px-3 py-2 text-center font-mono text-sm text-surface-700"
                                    >
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={copyAll} className="btn-secondary flex-1">
                            {copied ? 'Copied!' : 'Copy all codes'}
                        </button>
                        <a href="/" className="btn-primary flex-1 text-center">
                            I've saved them
                        </a>
                    </div>

                    {flash?.success && (
                        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{flash.success}</div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
