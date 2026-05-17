import React from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function VerifyEmail() {
    const { auth } = usePage().props;
    const { post, processing } = useForm();

    const resendVerification = () => {
        post('/email/verification-notification');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-surface-900">Verify your email</h2>
                <p className="mt-2 text-sm text-surface-500">
                    A verification link has been sent to <span className="font-medium">{auth?.user?.email}</span>.
                    Please check your inbox and click the link to verify.
                </p>

                <button onClick={resendVerification} disabled={processing} className="btn-primary mt-6">
                    {processing ? 'Sending...' : 'Resend verification email'}
                </button>
            </div>
        </div>
    );
}
