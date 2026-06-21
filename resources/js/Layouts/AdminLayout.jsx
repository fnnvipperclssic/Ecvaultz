/**
 * Admin Layout — Sidebar Navigation & Layout Wrapper
 *
 * Menyediakan navigasi sidebar untuk semua section admin panel
 * dengan 12 menu utama yang dikelompokkan secara logis.
 *
 * OWASP Security:
 * - A01: Hanya user dengan permission admin.access yang bisa akses
 * - Route highlighting otomatis berdasarkan URL saat ini
 *
 * Menu Groups:
 * - Overview: Dashboard
 * - Content: Files, Folders, Data Rooms
 * - Sharing: Shares, Tags
 * - Users & Security: Users, Login Attempts, Security Questions
 * - System: Activity Log, Notifications, File Versions, Settings
 *
 * @param {object} props
 * @param {string} props.header — Page header text
 * @param {ReactNode} props.children — Page content
 */

import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminLayout({ header, children }) {
    const { url } = usePage();

    /** SVG path icons (Heroicons outline style, 24x24) */
    const icons = {
        dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        files: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
        folders: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
        shares: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
        tags: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
        datarooms: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        login: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
        security: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        activity: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
        bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        versions: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    };

    /** Admin navigation grouped by category */
    const navGroups = [
        {
            label: 'Overview',
            items: [
                { name: 'Dashboard', href: '/admin/dashboard', icon: icons.dashboard },
            ],
        },
        {
            label: 'Content',
            items: [
                { name: 'Files', href: '/admin/files', icon: icons.files },
                { name: 'Folders', href: '/admin/folders', icon: icons.folders },
                { name: 'Data Rooms', href: '/admin/data-rooms', icon: icons.datarooms },
            ],
        },
        {
            label: 'Sharing',
            items: [
                { name: 'Shares', href: '/admin/shares', icon: icons.shares },
                { name: 'Tags', href: '/admin/tags', icon: icons.tags },
            ],
        },
        {
            label: 'Users & Security',
            items: [
                { name: 'Users', href: '/admin/users', icon: icons.users },
                { name: 'Login Attempts', href: '/admin/login-attempts', icon: icons.login },
                { name: 'Security Questions', href: '/admin/security-questions', icon: icons.security },
            ],
        },
        {
            label: 'System',
            items: [
                { name: 'Activity Log', href: '/admin/activity-log', icon: icons.activity },
                { name: 'Notifications', href: '/admin/notifications', icon: icons.bell },
                { name: 'File Versions', href: '/admin/file-versions', icon: icons.versions },
                { name: 'Settings', href: '/admin/settings', icon: icons.settings },
            ],
        },
    ];

    /** Render a single navigation icon SVG */
    const NavIcon = ({ d }) => (
        <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );

    /** Determine if a nav item is active based on current URL */
    const isActive = (href) => {
        // Exact match for dashboard, prefix match for others
        if (href === '/admin/dashboard') return url === '/admin/dashboard';
        return url.startsWith(href);
    };

    /** Shared nav link styling */
    const navLinkClass = (active) =>
        `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
            active
                ? 'bg-primary-600/15 text-primary-400'
                : 'text-surface-500 hover:bg-surface-200 hover:text-surface-700'
        }`;

    return (
        <AuthenticatedLayout header={header || 'Admin Panel'}>
            <div className="flex gap-6 px-6 py-6">
                {/* Sidebar Navigation */}
                <aside className="w-56 flex-shrink-0">
                    <nav className="space-y-4">
                        {navGroups.map((group) => (
                            <div key={group.label}>
                                {/* Group label */}
                                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-surface-400">
                                    {group.label}
                                </p>
                                <div className="space-y-0.5">
                                    {group.items.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={navLinkClass(isActive(item.href))}
                                        >
                                            <NavIcon d={item.icon} />
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
