import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function NotFound() {
    const { auth } = usePage().props;
    const homeLink = auth?.user ? '/dashboard' : '/';

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-6 relative overflow-hidden">
            <div className="fixed top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-primary-600/8 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-1/3 -right-32 w-[300px] h-[300px] rounded-full bg-cyan-400/6 blur-[100px] pointer-events-none" />

            <div className="relative text-center space-y-6 animate-fade-in">
                <div className="text-8xl font-extrabold text-gradient">404</div>
                <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
                <p className="text-surface-400 max-w-md">
                    The page you're looking for doesn't exist or has been moved to another location.
                </p>
                <Link href={homeLink} className="btn-primary inline-flex">
                    {auth?.user ? 'Back to Dashboard' : 'Back to Home'}
                </Link>
            </div>
        </div>
    );
}
