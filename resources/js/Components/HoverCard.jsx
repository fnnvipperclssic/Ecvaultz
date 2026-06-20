import React, { useState, useRef } from 'react';

export default function HoverCard({ children, preview, width = 'w-72' }) {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const timeoutRef = useRef(null);

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.top });
        timeoutRef.current = setTimeout(() => setShow(true), 400);
    };
    const handleMouseLeave = () => { clearTimeout(timeoutRef.current); setShow(false); };

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
            {children}
            {show && (
                <div className="fixed z-[550] animate-scale-in" style={{ left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)' }}>
                    <div className={`${width} glass-light rounded-2xl p-4 shadow-glow-lg`}>
                        {preview}
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 rotate-45 bg-surface-100/80 backdrop-blur-xl border-r border-b border-white/[0.06]" />
                </div>
            )}
        </div>
    );
}
