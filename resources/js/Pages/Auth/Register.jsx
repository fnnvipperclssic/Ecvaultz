import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({ name: '', email: '', password: '', password_confirmation: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => { e.preventDefault(); post('/register'); };

    const commonErrors = {
        'email already exists': 'This email is already registered. Try logging in instead.',
        'the email has already been taken': 'This email is already registered. Try logging in instead.',
        'the password field is required': 'Password is required.',
        'the name field is required': 'Name is required.',
        'password confirmation does not match': 'Passwords do not match.',
    };

    const getReadableError = (key, message) => {
        const lower = message?.toLowerCase() || '';
        for (const [pattern, readable] of Object.entries(commonErrors)) {
            if (lower.includes(pattern)) return readable;
        }
        return message;
    };

    return (
        <GuestLayout>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold text-surface-800">Create your vault</h2>
                    <p className="text-sm text-surface-500">Secure. Private. Yours.</p>
                </div>

                {errors.name && (
                    <div className="rounded-lg bg-red-500/10 border border-red-200 p-3">
                        <p className="text-xs text-red-500">{getReadableError('name', errors.name)}</p>
                    </div>
                )}
                {errors.email && (
                    <div className="rounded-lg bg-red-500/10 border border-red-200 p-3">
                        <p className="text-xs text-red-500">{getReadableError('email', errors.email)}</p>
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="label">Full name</label>
                    <input id="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                        className={`input ${errors.name ? 'input-error' : ''}`} placeholder="John Doe" autoComplete="name" required />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{getReadableError('name', errors.name)}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="label">Email address</label>
                    <input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                        className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" autoComplete="email" required />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{getReadableError('email', errors.email)}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="label">Password</label>
                    <div className="relative">
                        <input id="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={(e) => setData('password', e.target.value)}
                            className={`input pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Min. 12 characters" autoComplete="new-password" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {showPassword
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a10.04 10.04 0 013.24-4.74M6.72 6.72A9.86 9.86 0 0112 5c5 0 9.27 3.11 11 7.5a10.04 10.04 0 01-1.08 1.56M9.88 9.88a3 3 0 104.24 4.24" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                }
                            </svg>
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400">{getReadableError('password', errors.password)}</p>}
                    {/* Password Strength Meter */}
                    <PasswordStrengthMeter password={data.password} />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="label">Confirm password</label>
                    <input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                        className={`input ${errors.password_confirmation ? 'input-error' : ''}`} placeholder="Re-enter your password" autoComplete="new-password" required />
                    {errors.password_confirmation && <p className="mt-1 text-xs text-red-400">{getReadableError('password_confirmation', errors.password_confirmation)}</p>}
                </div>

                <button type="submit" disabled={processing} className="btn-primary w-full">
                    {processing ? 'Creating vault...' : 'Create vault'}
                </button>

                <p className="text-center text-sm text-surface-500">
                    Already have an account? <Link href="/login" className="font-medium text-primary-400 hover:text-primary-300">Sign in</Link>
                </p>

                <div className="text-center pt-2">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-300 transition-colors">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
