import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';

export default function AuthenticatedLayout({ children, header }) {
    const { auth, flash } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    React.useEffect(() => {
        if (flash?.success) enqueueSnackbar(flash.success, { variant: 'success' });
        if (flash?.error) enqueueSnackbar(flash.error, { variant: 'error' });
        if (flash?.warning) enqueueSnackbar(flash.warning, { variant: 'warning' });
    }, [flash]);

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
        { label: 'My Files', href: '/files', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
        { label: 'Shared', href: '/shares', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
        { label: 'Trash', href: '/files/trash', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
        { label: 'Activity Log', href: '/activity-log', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    const bottomItems = [
        { label: 'Profile & Settings', href: '/profile', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    const isActive = (href) => {
        const url = usePage().url;
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-surface-50">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-surface-200 bg-surface-100 transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-16 items-center gap-3 border-b border-surface-200 px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-600/25">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-surface-800">Ecvaultz</span>
                </div>

                <nav className="flex flex-1 flex-col justify-between p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                        isActive(item.href)
                                            ? 'bg-primary-600/15 text-primary-400 shadow-sm'
                                            : 'text-surface-500 hover:bg-surface-200 hover:text-surface-700'
                                    }`}
                                >
                                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                    </svg>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <ul className="space-y-1">
                        {bottomItems.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                        isActive(item.href)
                                            ? 'bg-primary-600/15 text-primary-400'
                                            : 'text-surface-500 hover:bg-surface-200 hover:text-surface-700'
                                    }`}
                                >
                                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                    </svg>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button onClick={() => router.post('/logout')}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-500 transition-colors hover:bg-red-500/10 hover:text-red-400">
                                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center gap-4 border-b border-surface-200 bg-surface-100 px-6">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-surface-500 hover:bg-surface-200 lg:hidden">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>

                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-lg font-semibold text-surface-800">{header}</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-surface-500">{auth?.user?.name}</span>
                            {auth?.user?.avatar_url
                                ? <img src={auth.user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-surface-200" />
                                : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600/20 text-sm font-medium text-primary-400 ring-2 ring-primary-600/20">
                                    {auth?.user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                            }
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-surface-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
