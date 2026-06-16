import React from 'react';
import { usePage } from '@inertiajs/react';
import { useSnackbar } from 'notistack';

export default function GuestLayout({ children }) {
    const { flash } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();

    React.useEffect(() => {
        if (flash?.success) enqueueSnackbar(flash.success, { variant: 'success' });
        if (flash?.error) enqueueSnackbar(flash.error, { variant: 'error' });
        if (flash?.warning) enqueueSnackbar(flash.warning, { variant: 'warning' });
    }, [flash]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient background glow orbs */}
            <div className="fixed top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[150px] pointer-events-none animate-pulse-glow" />
            <div className="fixed bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-cyan-400/8 blur-[120px] pointer-events-none animate-pulse-glow" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

            <div className="relative w-full max-w-md animate-fade-in">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/20 border border-primary-500/20 shadow-glow-sm">
                        <svg className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Ecvaultz</h1>
                    <p className="mt-1 text-sm text-surface-400">Digital Vault with Maximum Security</p>
                </div>
                <div className="card p-6">
                    {children}
                </div>
                <p className="mt-6 text-center text-xs text-surface-500">
                    Protected by enterprise-grade encryption &mdash; AES-256-GCM
                </p>
            </div>
        </div>
    );
}
