import React from 'react';
import { Link } from '@inertiajs/react';

export default function BreadcrumbNav({ currentFolder, ancestors }) {
    if (!currentFolder && (!ancestors || ancestors.length === 0)) return null;

    return (
        <nav className="mb-4 flex items-center gap-1.5 text-sm">
            {/* Root link */}
            <Link
                href="/files"
                className="text-surface-500 hover:text-primary-400 transition-colors flex items-center gap-1"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                My Files
            </Link>

            {/* Ancestors */}
            {ancestors?.length > 0 && ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.uuid}>
                    <ChevronRightIcon />
                    <Link
                        href={'/files?folder_id=' + ancestor.uuid}
                        className="text-surface-500 hover:text-primary-400 transition-colors"
                    >
                        {ancestor.name}
                    </Link>
                </React.Fragment>
            ))}

            {/* Current folder (last segment, not clickable) */}
            {currentFolder && (
                <>
                    <ChevronRightIcon />
                    <span className="font-semibold text-white truncate max-w-[200px]">
                        {currentFolder.name}
                    </span>
                </>
            )}
        </nav>
    );
}

function ChevronRightIcon() {
    return (
        <svg className="h-4 w-4 text-surface-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}
