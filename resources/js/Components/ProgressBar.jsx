import React from 'react';

export default function ProgressBar({ value = 0, max = 100, size = 'md', color = 'primary', label, showPercent = true, animate = true }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
    const colors = {
        primary: 'bg-primary-600',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
    };

    return (
        <div className="w-full">
            {(label || showPercent) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && <span className="text-xs font-medium text-surface-400">{label}</span>}
                    {showPercent && <span className="text-xs font-medium text-surface-500">{Math.round(pct)}%</span>}
                </div>
            )}
            <div className={`w-full ${heights[size]} bg-surface-300 rounded-full overflow-hidden`}>
                <div
                    className={`${heights[size]} ${colors[color] || colors.primary} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export function CircularProgress({ value = 0, max = 100, size = 48, strokeWidth = 3, color = 'primary' }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (pct / 100) * circumference;
    const strokeColors = { primary: '#8b45ff', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor"
                    className="text-surface-300" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={strokeColors[color] || strokeColors.primary} strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" className="transition-all duration-700 ease-out" />
            </svg>
            <span className="absolute text-xs font-semibold text-surface-300">{Math.round(pct)}%</span>
        </div>
    );
}
