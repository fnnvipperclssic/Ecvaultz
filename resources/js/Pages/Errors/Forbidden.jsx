import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Forbidden() {
    const { auth } = usePage().props;
    const homeLink = auth?.user ? '/dashboard' : '/';

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-6 relative overflow-hidden">
            <div className="fixed top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-red-600/8 blur-[120px] pointer-events-none" />

            <div className="relative text-center space-y-6 animate-fade-in">
                <div className="text-8xl font-extrabold" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>403</div>
                <h2 className="text-2xl font-bold text-white">Access Denied</h2>
                <p className="text-surface-400 max-w-md">
                    You don't have permission to access this resource. Contact your administrator if you think this is a mistake.
                </p>
                <Link href={homeLink} className="btn-primary inline-flex">
                    {auth?.user ? 'Back to Dashboard' : 'Back to Home'}
                </Link>
            </div>
        </div>
    );
}
