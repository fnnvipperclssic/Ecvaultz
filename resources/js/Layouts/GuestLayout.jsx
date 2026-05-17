import React from 'react';
import { usePage } from '@inertiajs/react';
import { useSnackbar } from 'notistack';

export default function GuestLayout({ children }) {
    const { flash } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();

    React.useEffect(() => {
        if (flash?.success) enqueueSnackbar(flash.success, { variant: 'success' });
        if (flash?.error) enqueueSnackbar(flash.error, { variant: 'error' });
    }, [flash]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-12 sm:px-6 lg:px-8">
            {/* Ambient background glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary-600/5 blur-[150px] pointer-events-none" />

            <div className="relative w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900">Ecvaultz</h1>
                    <p className="mt-1 text-sm text-surface-500">Digital Vault with Maximum Security</p>
                </div>
                <div className="card p-6">
                    {children}
                </div>
                <p className="mt-6 text-center text-xs text-surface-500">
                    Protected by enterprise-grade encryption & security
                </p>
            </div>
        </div>
    );
}
