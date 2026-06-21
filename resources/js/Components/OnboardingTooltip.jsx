import React, { useState, useEffect, useCallback } from 'react';

const STEPS = [
    {
        targetSelector: '[data-onboard="dashboard"]',
        title: 'Welcome to Ecvaultz!',
        description: 'Your secure file storage and sharing platform. This quick tour will show you the essentials.',
        position: 'bottom',
    },
    {
        targetSelector: '[data-onboard="upload-area"]',
        title: 'Upload Files',
        description: 'Drag & drop files here or click to browse. Supported formats include images, documents, PDFs, and more.',
        position: 'bottom',
    },
    {
        targetSelector: '[data-onboard="storage-bar"]',
        title: 'Storage Usage',
        description: 'Keep an eye on your storage quota here. Upgrade your plan when you need more space.',
        position: 'top',
    },
    {
        targetSelector: '[data-onboard="sidebar-nav"]',
        title: 'Sidebar Navigation',
        description: 'Quickly navigate between sections: Dashboard, My Files, Shared, Notifications, and Trash.',
        position: 'right',
    },
    {
        targetSelector: '[data-onboard="search-bar"]',
        title: 'Global Search',
        description: 'Search across all your files instantly using the search bar in the header.',
        position: 'bottom',
    },
    {
        targetSelector: '[data-onboard="new-folder"]',
        title: 'Organize with Folders',
        description: 'Create folders to keep your files organized. You can also add tags and descriptions.',
        position: 'bottom',
    },
    {
        targetSelector: '[data-onboard="file-table"]',
        title: 'File Management',
        description: 'Click the star to favorite files, use checkboxes for bulk actions, or right-click for more options.',
        position: 'top',
    },
    {
        targetSelector: '[data-onboard="profile-menu"]',
        title: 'Profile & Settings',
        description: 'Access your profile, notification preferences, security settings, and more from here.',
        position: 'left',
    },
];

const STORAGE_KEY = 'ecvaultz-onboarding-completed';

export default function OnboardingTooltip() {
    const [currentStep, setCurrentStep] = useState(0);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const isCompleted = localStorage.getItem(STORAGE_KEY) === 'true';

    const updatePosition = useCallback((stepIndex) => {
        const step = STEPS[stepIndex];
        if (!step) return;

        const target = document.querySelector(step.targetSelector);
        if (!target) {
            // Fall back to center of viewport if target not found
            setPosition({ top: window.innerHeight / 2 - 80, left: window.innerWidth / 2 - 160 });
            return;
        }

        const rect = target.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 180;
        const gap = 12;

        let top, left;

        switch (step.position) {
            case 'top':
                top = rect.top - tooltipHeight - gap;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'bottom':
                top = rect.bottom + gap;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - tooltipWidth - gap;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + gap;
                break;
            default:
                top = rect.bottom + gap;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
        }

        // Keep in viewport
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
        top = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));

        setPosition({ top, left });
    }, []);

    useEffect(() => {
        if (!isCompleted) {
            // Delay showing to let the page render
            const showTimer = setTimeout(() => {
                setVisible(true);
                updatePosition(0);
            }, 800);
            return () => clearTimeout(showTimer);
        }
    }, [isCompleted, updatePosition]);

    // Recalculate on resize
    useEffect(() => {
        if (!visible) return;
        const handleResize = () => updatePosition(currentStep);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [visible, currentStep, updatePosition]);

    // Scroll to target when step changes
    useEffect(() => {
        if (!visible) return;
        const step = STEPS[currentStep];
        if (!step) return;
        const target = document.querySelector(step.targetSelector);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const timer = setTimeout(() => updatePosition(currentStep), 400);
        return () => clearTimeout(timer);
    }, [currentStep, visible, updatePosition]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeTour = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setVisible(false);
    };

    if (!visible || isCompleted) return null;

    const step = STEPS[currentStep];
    const isLast = currentStep === STEPS.length - 1;
    const isFirst = currentStep === 0;

    // Arrow direction
    const arrowClass = step.position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-8 border-r-8 border-t-8 border-transparent border-t-surface-100' :
        step.position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-8 border-r-8 border-b-8 border-transparent border-b-surface-100' :
        step.position === 'left' ? 'right-0 top-1/2 translate-x-full -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-transparent border-l-surface-100' :
        'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-transparent border-r-surface-100';

    return (
        <>
            {/* Overlay highlight */}
            <div className="fixed inset-0 z-[400] pointer-events-none">
                {(() => {
                    const target = document.querySelector(step.targetSelector);
                    if (target) {
                        const r = target.getBoundingClientRect();
                        return (
                            <div
                                className="absolute rounded-lg ring-2 ring-primary-500 ring-offset-2 ring-offset-black/40 transition-all duration-300"
                                style={{
                                    top: r.top - 4,
                                    left: r.left - 4,
                                    width: r.width + 8,
                                    height: r.height + 8,
                                }}
                            />
                        );
                    }
                    return null;
                })()}
            </div>

            {/* Tooltip */}
            <div
                className="fixed z-[500] w-80 rounded-2xl bg-surface-100 shadow-2xl border border-surface-300 animate-fade-in"
                style={{ top: position.top, left: position.left }}
            >
                {/* Arrow */}
                <div className={`absolute ${arrowClass}`} />

                <div className="p-5">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-surface-500">
                            {currentStep + 1} of {STEPS.length}
                        </span>
                        <div className="flex gap-1">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                        i === currentStep ? 'bg-primary-500' : 'bg-surface-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-semibold text-surface-900 mb-1">{step.title}</h4>

                    {/* Description */}
                    <p className="text-sm text-surface-500 leading-relaxed">{step.description}</p>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={completeTour}
                            className="text-xs text-surface-500 hover:text-surface-700 transition-colors"
                        >
                            Skip
                        </button>
                        <div className="flex items-center gap-2">
                            {!isFirst && (
                                <button
                                    onClick={handlePrev}
                                    className="btn-ghost text-xs px-3 py-1.5"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="btn-primary text-xs px-4 py-1.5"
                            >
                                {isLast ? 'Done' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
