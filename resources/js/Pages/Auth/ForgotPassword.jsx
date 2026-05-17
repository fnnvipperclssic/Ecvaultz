import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({ email: '' });
    return (
        <GuestLayout>
            <form onSubmit={(e) => { e.preventDefault(); post('/forgot-password'); }} className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold text-surface-800">Reset your password</h2>
                    <p className="mt-1 text-sm text-surface-500">Enter your email and we'll send you a reset link. Link expires in 60 minutes.</p>
                </div>
                <div>
                    <label htmlFor="email" className="label">Email address</label>
                    <input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                        className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" autoComplete="email" autoFocus required />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>
                <button type="submit" disabled={processing} className="btn-primary w-full">
                    {processing ? 'Sending...' : 'Send reset link'}
                </button>
                <p className="text-center text-sm text-surface-500">
                    <Link href="/login" className="font-medium text-primary-400 hover:text-primary-300">Back to sign in</Link>
                </p>
            </form>
        </GuestLayout>
    );
}
