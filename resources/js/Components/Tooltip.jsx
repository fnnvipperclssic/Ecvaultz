import React, { useState, useRef, useEffect } from 'react';

export default function Tooltip({ children, content, position = 'top', delay = 300 }) {
    const [show, setShow] = useState(false);
    const timeoutRef = useRef(null);

    const showTooltip = () => { timeoutRef.current = setTimeout(() => setShow(true), delay); };
    const hideTooltip = () => { clearTimeout(timeoutRef.current); setShow(false); };

    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative inline-flex" onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
            {children}
            {show && (
                <div className={`absolute z-[550] ${positions[position]} animate-fade-in pointer-events-none`}>
                    <div className="bg-surface-800 text-surface-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-elevation-3 whitespace-nowrap border border-surface-600">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
}
