import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function ServerError() {
    const { auth } = usePage().props;
    const homeLink = auth?.user ? '/dashboard' : '/';

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-6 relative overflow-hidden">
            <div className="fixed top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[120px] pointer-events-none" />

            <div className="relative text-center space-y-6 animate-fade-in">
                <div className="text-8xl font-extrabold" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>500</div>
                <h2 className="text-2xl font-bold text-white">Server Error</h2>
                <p className="text-surface-400 max-w-md">
                    Something went wrong on our end. Our team has been notified. Please try again in a moment.
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => window.location.reload()} className="btn-secondary">Refresh Page</button>
                    <Link href={homeLink} className="btn-primary">
                        {auth?.user ? 'Go to Dashboard' : 'Go Home'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
