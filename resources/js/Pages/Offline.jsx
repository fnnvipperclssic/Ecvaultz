import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Offline() {
    return (
        <>
            <Head title="Offline" />
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
                <div className="text-center max-w-md">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <svg className="h-12 w-12 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.83-2.83a5 5 0 000-7.068m-2.83 2.83a1 1 0 011.414 0M3 9l1.5-1.5L6 9M3 15l1.5 1.5L6 15m9-7.5V3m0 18v-4.5" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        You're Offline
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        It looks like you've lost your internet connection. Some features may not work until you reconnect.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                            </svg>
                            Try Again
                        </button>
                        <div>
                            <Link
                                href="/dashboard"
                                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                    <p className="mt-8 text-xs text-gray-500 dark:text-gray-500">
                        Cached pages may still be accessible while offline.
                    </p>
                </div>
            </div>
        </>
    );
}
