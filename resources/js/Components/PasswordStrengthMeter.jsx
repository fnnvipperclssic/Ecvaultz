import React, { useMemo } from 'react';

export default function PasswordStrengthMeter({ password }) {
    const { criteria, score, maxScore } = useMemo(() => {
        if (!password) return { criteria: [], score: 0, maxScore: 6 };

        const checks = [
            { label: 'At least 8 characters', met: password.length >= 8 },
            { label: 'At least 12 characters', met: password.length >= 12 },
            { label: 'Has uppercase letter', met: /[A-Z]/.test(password) },
            { label: 'Has lowercase letter', met: /[a-z]/.test(password) },
            { label: 'Has a number', met: /[0-9]/.test(password) },
            { label: 'Has a symbol', met: /[^A-Za-z0-9]/.test(password) },
        ];

        const passed = checks.filter((c) => c.met).length;
        return { criteria: checks, score: passed, maxScore: 6 };
    }, [password]);

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    const getBarColor = () => {
        if (!password) return 'bg-surface-300';
        if (score <= 2) return 'bg-red-500';
        if (score <= 4) return 'bg-orange-400';
        return 'bg-green-500';
    };

    const getLabel = () => {
        if (!password) return '';
        if (score <= 2) return 'Weak';
        if (score <= 4) return 'Medium';
        return 'Strong';
    };

    const getLabelColor = () => {
        if (!password) return 'text-surface-500';
        if (score <= 2) return 'text-red-400';
        if (score <= 4) return 'text-orange-400';
        return 'text-green-400';
    };

    if (!password) return null;

    return (
        <div className="mt-3 space-y-2">
            {/* Strength bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-300">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Label */}
            <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${getLabelColor()}`}>
                    {getLabel() && `Password strength: ${getLabel()}`}
                </p>
                <p className="text-xs text-surface-500">{score}/{maxScore} criteria met</p>
            </div>

            {/* Criteria checklist */}
            <ul className="space-y-1">
                {criteria.map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-xs">
                        <svg
                            className={`h-3 w-3 flex-shrink-0 ${
                                password
                                    ? item.met
                                        ? 'text-green-500'
                                        : 'text-surface-500'
                                    : 'text-surface-500'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            {item.met ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            )}
                        </svg>
                        <span
                            className={
                                password
                                    ? item.met
                                        ? 'text-green-400'
                                        : 'text-surface-500'
                                    : 'text-surface-500'
                            }
                        >
                            {item.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
