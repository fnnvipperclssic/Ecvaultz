import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import CommandPalette from '@/Components/CommandPalette';
import GlobalSearch from '@/Components/GlobalSearch';
import StorageQuotaBar from '@/Components/StorageQuotaBar';
import KeyboardShortcuts from '@/Components/KeyboardShortcuts';

export default function AuthenticatedLayout({ children, header }) {
    const { auth, flash, storageUsed, storageQuota } = usePage().props;
    const { enqueueSnackbar } = useSnackbar();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    // Listen for "?" key to open keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // "?" is Shift+/
            if (e.key === '/' && e.shiftKey) {
                // Only if not focused on an input/textarea
                const tag = document.activeElement?.tagName?.toLowerCase();
                if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
                    e.preventDefault();
                    setShowShortcuts(true);
                }
            }
            // Space hotkey is delegated to individual pages via their own handlers
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    React.useEffect(() => {
        if (flash?.success) enqueueSnackbar(flash.success, { variant: 'success' });
        if (flash?.error) enqueueSnackbar(flash.error, { variant: 'error' });
        if (flash?.warning) enqueueSnackbar(flash.warning, { variant: 'warning' });
    }, [flash]);

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
        { label: 'My Files', href: '/files', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
        { label: 'Shared', href: '/shares', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
        { label: 'Notifications', href: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { label: 'Trash', href: '/files/trash', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
        { label: 'Data Rooms', href: '/data-rooms', icon: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z' },
        { label: 'Activity Log', href: '/activity-log', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    if (auth?.user?.is_admin || auth?.user?.roles?.includes('Admin')) {
        navItems.push({ label: 'Admin Panel', href: '/admin/dashboard', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' });
    }

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
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-surface-300 bg-surface-100/95 backdrop-blur-md transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-16 items-center gap-3 border-b border-surface-300 px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-glow-sm shadow-primary-600/30">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">Ecvaultz</span>
                </div>

                <nav className="flex flex-1 flex-col justify-between p-4" data-onboard="sidebar-nav">
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

                        {/* Storage Quota (sidebar compact) */}
                        {storageUsed !== undefined && storageQuota !== undefined && (
                            <li className="px-0">
                                <StorageQuotaBar used={storageUsed} quota={storageQuota} variant="compact" />
                            </li>
                        )}

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
                <header className="relative z-20 flex h-16 items-center gap-4 border-b border-surface-300 bg-surface-100/80 backdrop-blur-md px-6">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-surface-500 hover:bg-surface-200 hover:text-surface-700 lg:hidden">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>

                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-lg font-semibold text-white">{header}</h1>
                        <div className="flex items-center gap-4">
                            {/* Global Search in header */}
                            <div className="hidden sm:block w-64">
                                <GlobalSearch placeholder="Search..." />
                            </div>

                            <Link href="/notifications" className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-200 transition-colors">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                            </Link>
                            <div className="relative" data-onboard="profile-menu">
                                <button
                                    className="flex items-center gap-2 cursor-pointer rounded-lg p-1.5 hover:bg-surface-200 transition-colors"
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    onBlur={() => setTimeout(() => setProfileMenuOpen(false), 150)}
                                >
                                    <span className="text-sm text-surface-600 hidden sm:block">{auth?.user?.name}</span>
                                    {auth?.user?.avatar_url
                                        ? <img src={auth.user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-surface-200" />
                                        : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600/20 text-sm font-medium text-primary-400 ring-2 ring-primary-600/20">
                                            {auth?.user?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    }
                                    <svg className={`h-4 w-4 text-surface-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {profileMenuOpen && (
                                    <div className="absolute right-0 top-full z-[100] mt-2 w-56 rounded-xl border border-surface-300 bg-surface-100 shadow-elevation-3 py-1">
                                        <div className="px-3 py-2 border-b border-surface-300">
                                            <p className="text-sm font-medium text-white">{auth?.user?.name}</p>
                                            <p className="text-xs text-surface-500 truncate">{auth?.user?.email}</p>
                                        </div>
                                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-200 hover:text-surface-800 transition-colors">
                                            <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                            Profile & Settings
                                        </Link>
                                        <button
                                            onClick={() => { setShowShortcuts(true); setProfileMenuOpen(false); }}
                                            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-200 hover:text-surface-800 transition-colors"
                                        >
                                            <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                            </svg>
                                            Keyboard Shortcuts
                                        </button>
                                        {auth?.user?.is_admin && (
                                            <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-200 hover:text-surface-800 transition-colors">
                                                <svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Admin Panel
                                            </Link>
                                        )}
                                        <div className="mx-3 my-1 border-t border-surface-300" />
                                        <button onClick={() => router.post('/logout')} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-surface-50">
                    {children}
                </main>
            </div>
            <CommandPalette />
            <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
        </div>
    );
}
