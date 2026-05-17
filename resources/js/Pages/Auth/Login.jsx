import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: false });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => { e.preventDefault(); post('/login'); };

    return (
        <GuestLayout>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold text-surface-800">Welcome back</h2>
                    <p className="text-sm text-surface-500">Sign in to access your secure vault</p>
                </div>

                <div>
                    <label htmlFor="email" className="label">Email address</label>
                    <input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                        className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" autoComplete="email" autoFocus required />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="label">Password</label>
                    <div className="relative">
                        <input id="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={(e) => setData('password', e.target.value)}
                            className={`input pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Enter your password" autoComplete="current-password" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {showPassword
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a10.04 10.04 0 013.24-4.74M6.72 6.72A9.86 9.86 0 0112 5c5 0 9.27 3.11 11 7.5a10.04 10.04 0 01-1.08 1.56M9.88 9.88a3 3 0 104.24 4.24" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                }
                            </svg>
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-surface-300 bg-surface-100 text-primary-600 focus:ring-primary-500/30" />
                        <span className="text-sm text-surface-500">Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-sm font-medium text-primary-400 hover:text-primary-300">Forgot password?</Link>
                </div>

                <button type="submit" disabled={processing} className="btn-primary w-full">
                    {processing ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : 'Sign in'}
                </button>

                <p className="text-center text-sm text-surface-500">
                    Don't have an account? <Link href="/register" className="font-medium text-primary-400 hover:text-primary-300">Create one</Link>
                </p>
            </form>
        </GuestLayout>
    );
}
