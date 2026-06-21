import React from 'react';

export default function TagBadge({ tag, onRemove }) {
    const tagColor = tag.color || '#6b7280';

    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
                backgroundColor: `${tagColor}20`,
                color: tagColor,
                borderColor: `${tagColor}40`,
                borderWidth: '1px',
            }}
        >
            {tag.name}
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove(tag);
                    }}
                    className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                    title="Remove tag"
                >
                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </span>
    );
}
