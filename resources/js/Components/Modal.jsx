import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [open, onClose]);

    if (!open) return null;

    const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative glass-light rounded-2xl ${sizes[size]} w-full max-h-[90vh] overflow-y-auto animate-slide-up`}>
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                        <h3 className="text-lg font-semibold text-surface-100">{title}</h3>
                        <button onClick={onClose} className="p-1 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}
                <div className="px-6 py-4">{children}</div>
                {footer && (
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">{footer}</div>
                )}
            </div>
        </div>
    );
}

// Confirmation dialog convenience wrapper
Modal.Confirm = function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) {
    return (
        <Modal open={open} onClose={onClose} size="sm">
            <div className="text-center space-y-4">
                {title && <h4 className="text-lg font-semibold text-surface-100">{title}</h4>}
                <p className="text-sm text-surface-400">{message}</p>
            </div>
            <div className="flex justify-center gap-3 mt-6">
                <button onClick={onClose} className="btn-secondary">Cancel</button>
                <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn-danger' : 'btn-primary'}>
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};
