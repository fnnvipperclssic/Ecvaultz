import React, { useMemo } from 'react';

export default function StorageQuotaBar({ used, quota, variant = 'full' }) {
    const { usedGB, quotaGB, percentage } = useMemo(() => {
        const usedGB = used > 0 ? (used / (1024 * 1024 * 1024)).toFixed(2) : '0.00';
        const quotaGB = quota > 0 ? (quota / (1024 * 1024 * 1024)).toFixed(2) : '0.00';
        const percentage = quota > 0 ? Math.min((used / quota) * 100, 100) : 0;
        return { usedGB, quotaGB, percentage };
    }, [used, quota]);

    const getBarColor = () => {
        if (percentage > 95) return 'bg-red-500 animate-pulse';
        if (percentage > 80) return 'bg-red-500';
        if (percentage > 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getLabelColor = () => {
        if (percentage > 80) return 'text-red-400';
        if (percentage > 50) return 'text-yellow-400';
        return 'text-green-400';
    };

    if (variant === 'compact') {
        return (
            <div className="px-4 py-3 border-t border-surface-300">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-surface-500">Storage</span>
                    <span className={`text-xs font-medium ${getLabelColor()}`}>{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-300">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-xs text-surface-500 mt-1">
                    {usedGB} GB of {quotaGB} GB used
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-surface-300 bg-surface-100/80 p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-surface-700">Storage Usage</span>
                <span className={`text-sm font-semibold ${getLabelColor()}`}>{percentage.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-300">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-surface-500 mt-2">
                {usedGB} GB of {quotaGB} GB used
            </p>
            {percentage > 80 && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Storage is running low — consider cleaning up old files
                </p>
            )}
        </div>
    );
}
