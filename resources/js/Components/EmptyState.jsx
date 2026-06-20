import React from 'react';
import { Link } from '@inertiajs/react';

const ICONS = {
    files: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    activity: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
};

export default function EmptyState({ type = 'files', title, description, action, actionHref, icon }) {
    const iconPath = icon || ICONS[type] || ICONS.files;

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-200/50">
                <svg className="h-10 w-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-600 mb-2">{title || 'Nothing here yet'}</h3>
            {description && <p className="text-sm text-surface-500 max-w-sm mb-6">{description}</p>}
            {action && actionHref && (
                <Link href={actionHref} className="btn-primary">
                    {action}
                </Link>
            )}
        </div>
    );
}
