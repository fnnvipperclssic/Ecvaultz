import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { SnackbarProvider } from 'notistack';
import ErrorBoundary from '@/Components/ErrorBoundary';
import { ThemeProvider } from '@/Hooks/ThemeContext';

const appName = import.meta.env.VITE_APP_NAME || 'Ecvaultz';

// Unregister ALL service workers to prevent network interception issues
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
    }).catch(() => {});
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.jsx`,
        import.meta.glob('./Pages/**/*.jsx')
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ErrorBoundary>
                <ThemeProvider>
                    <SnackbarProvider
                        maxSnack={4}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        autoHideDuration={4000}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        <App {...props} />
                    </SnackbarProvider>
                </ThemeProvider>
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#8b45ff',
        showSpinner: true,
    },
});
