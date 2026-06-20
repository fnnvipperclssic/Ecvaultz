import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: false });
    const [showPassword, setShowPassword] = useState(false);

    return (
        <GuestLayout>
            <form onSubmit={(e) => { e.preventDefault(); post('/login'); }} className="space-y-5">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                    <p className="mt-1 text-sm text-surface-500">Sign in to your secure vault</p>
                </div>

                <div>
                    <label htmlFor="email" className="label">Email</label>
                    <input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                        className={errors.email ? 'input-error' : 'input'} placeholder="you@example.com" autoComplete="email" autoFocus required />
                    {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="label">Password</label>
                    <div className="relative">
                        <input id="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={e => setData('password', e.target.value)}
                            className={`${errors.password ? 'input-error' : 'input'} pr-10`} placeholder="Enter your password" autoComplete="current-password" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-600 transition-colors">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                {showPassword
                                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                }
                            </svg>
                        </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={data.remember} onChange={e => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-surface-400 bg-surface-200 text-primary-600 focus:ring-primary-500/30" />
                        <span className="text-sm text-surface-500 group-hover:text-surface-600 transition-colors">Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</Link>
                </div>

                <button type="submit" disabled={processing} className="btn-primary w-full py-3 text-base">
                    {processing ? (
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : 'Sign in'}
                </button>

                <p className="text-center text-sm text-surface-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">Create one</Link>
                </p>
            </form>
        </GuestLayout>
    );
}
