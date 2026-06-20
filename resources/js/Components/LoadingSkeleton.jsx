import React from 'react';

export function CardSkeleton() {
    return (
        <div className="card p-5 space-y-3 animate-skeleton">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-8 w-16" />
            <div className="skeleton h-3 w-32" />
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className="card overflow-hidden !p-0 animate-skeleton">
            <div className="border-b border-surface-300 bg-surface-200/50 px-4 py-3 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => <div key={i} className="skeleton h-3 flex-1" />)}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="border-b border-surface-200/50 px-4 py-3 flex gap-4">
                    {Array.from({ length: cols }).map((_, c) => <div key={c} className="skeleton h-4 flex-1" />)}
                </div>
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <div className="card overflow-hidden !p-0">
                <div className="px-5 py-4 border-b border-surface-300"><div className="skeleton h-4 w-24" /></div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-surface-200/50">
                        <div className="skeleton h-8 w-8 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                            <div className="skeleton h-3 w-48" />
                            <div className="skeleton h-2.5 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FormSkeleton({ fields = 4 }) {
    return (
        <div className="card p-6 space-y-5 animate-skeleton">
            <div className="skeleton h-5 w-32 mb-2" />
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="skeleton h-3 w-20" />
                    <div className="skeleton h-10 w-full" />
                </div>
            ))}
            <div className="skeleton h-10 w-24 ml-auto" />
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6 animate-skeleton">
            <div className="card p-6 flex items-center gap-5">
                <div className="skeleton h-20 w-20 rounded-full" />
                <div className="space-y-2 flex-1">
                    <div className="skeleton h-5 w-40" />
                    <div className="skeleton h-3 w-56" />
                </div>
            </div>
            <div className="card p-6 space-y-4">
                <div className="skeleton h-5 w-28" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="skeleton h-3 w-16" />
                        <div className="skeleton h-10 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
