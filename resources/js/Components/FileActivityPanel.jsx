import React, { useState, useEffect, useCallback } from 'react';

const ACTION_ICONS = {
    uploaded: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    downloaded: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    deleted: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    shared: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    renamed: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    moved: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    restored: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    favorite: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
    viewed: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
};

const ACTION_COLORS = {
    uploaded: 'text-green-500 bg-green-500/10',
    downloaded: 'text-blue-500 bg-blue-500/10',
    deleted: 'text-red-500 bg-red-500/10',
    shared: 'text-purple-500 bg-purple-500/10',
    renamed: 'text-yellow-500 bg-yellow-500/10',
    moved: 'text-orange-500 bg-orange-500/10',
    restored: 'text-emerald-500 bg-emerald-500/10',
    favorite: 'text-yellow-500 bg-yellow-500/10',
    viewed: 'text-surface-500 bg-surface-200/50',
};

export default function FileActivityPanel({ fileUuid }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = useCallback(() => {
        setLoading(true);
        fetch(`/files/${fileUuid}/activity`)
            .then((res) => res.json())
            .then((data) => {
                const items = Array.isArray(data) ? data : data.activities || data.data || [];
                setActivities(items);
            })
            .catch(() => {
                setActivities([]);
            })
            .finally(() => setLoading(false));
    }, [fileUuid]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const getActionIcon = (action) => {
        return ACTION_ICONS[action] || ACTION_ICONS.viewed;
    };

    const getActionColor = (action) => {
        return ACTION_COLORS[action] || 'text-surface-500 bg-surface-200/50';
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-skeleton">
                        <div className="skeleton h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <div className="skeleton h-3 w-48" />
                            <div className="skeleton h-2.5 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center py-6 text-center">
                <svg className="h-10 w-10 text-surface-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-surface-500">No activity recorded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {activities.map((entry, i) => (
                <div key={entry.id || i} className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-200/30 transition-colors">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${getActionColor(entry.action)}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={getActionIcon(entry.action)} />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-surface-200">
                            {entry.description || entry.action || 'Unknown action'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            {entry.user && (
                                <span className="text-xs text-surface-500">{entry.user}</span>
                            )}
                            {entry.timestamp && (
                                <>
                                    {entry.user && <span className="text-surface-600">·</span>}
                                    <span className="text-xs text-surface-500">{entry.timestamp}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
