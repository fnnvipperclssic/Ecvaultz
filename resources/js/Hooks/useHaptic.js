export default function useHaptic() {
    const vibrate = (pattern = 10) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    return {
        tap: () => vibrate(10),
        doubleTap: () => vibrate([10, 50, 10]),
        success: () => vibrate([20, 50, 20, 50, 50]),
        error: () => vibrate([50, 100, 50]),
        warning: () => vibrate([30, 100, 30]),
    };
}
