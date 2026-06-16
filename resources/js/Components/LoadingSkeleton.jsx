import React from 'react';

export function CardSkeleton() {
    return (
        <div className="card p-5 space-y-3 animate-pulse">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-8 w-16" />
            <div className="skeleton h-3 w-32" />
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className="card overflow-hidden !p-0 animate-pulse">
            <div className="border-b border-white/[0.06] bg-surface-850/50 px-4 py-3 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="skeleton h-3 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="border-b border-white/[0.04] px-4 py-3 flex gap-4">
                    {Array.from({ length: cols }).map((_, c) => (
                        <div key={c} className="skeleton h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <div className="card p-5 space-y-3">
                <div className="skeleton h-5 w-32" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="skeleton h-4 w-8" />
                        <div className="skeleton h-4 flex-1" />
                        <div className="skeleton h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
