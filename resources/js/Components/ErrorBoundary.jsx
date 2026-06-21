import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            const { error, errorInfo } = this.state;

            return (
                <div className="min-h-screen bg-surface-950 flex items-center justify-center p-8">
                    <div className="glass-light rounded-3xl p-10 max-w-2xl w-full space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-surface-100">Something went wrong</h2>
                                <p className="text-sm text-surface-400 mt-1">
                                    An unexpected error occurred. Please refresh the page or try again later.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="text-left space-y-3 bg-red-500/5 rounded-xl border border-red-500/30 p-4">
                                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Error Message</p>
                                <p className="text-sm font-mono text-red-300 break-all leading-relaxed">
                                    {error.message || error.name || String(error)}
                                </p>
                                {error.stack && (
                                    <details open>
                                        <summary className="cursor-pointer text-xs font-medium text-surface-500 hover:text-surface-400 transition-colors select-none">
                                            Stack Trace
                                        </summary>
                                        <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-surface-600 bg-surface-900 p-3 text-xs font-mono text-surface-400 whitespace-pre-wrap break-all leading-relaxed">
                                            {error.stack}
                                        </pre>
                                    </details>
                                )}
                                {errorInfo?.componentStack && (
                                    <details open>
                                        <summary className="cursor-pointer text-xs font-medium text-surface-500 hover:text-surface-400 transition-colors select-none">
                                            Component Stack
                                        </summary>
                                        <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-surface-600 bg-surface-900 p-3 text-xs font-mono text-surface-400 whitespace-pre-wrap break-all leading-relaxed">
                                            {errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center pt-2">
                            <button onClick={() => window.location.reload()} className="btn-primary">
                                Refresh Page
                            </button>
                            <button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })} className="btn-secondary">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
