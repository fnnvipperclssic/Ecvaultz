import React from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ResetPassword({ email, token }) {
    const { data, setData, post, processing, errors } = useForm({ token, email, password: '', password_confirmation: '' });
    return (
        <GuestLayout>
            <form onSubmit={(e) => { e.preventDefault(); post('/reset-password'); }} className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold text-surface-800">Set new password</h2>
                    <p className="mt-1 text-sm text-surface-500">Choose a strong password for your account</p>
                </div>
                <div>
                    <label htmlFor="password" className="label">New password</label>
                    <input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                        className={`input ${errors.password ? 'input-error' : ''}`} placeholder="Min. 12 characters" autoComplete="new-password" autoFocus required />
                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                </div>
                <div>
                    <label htmlFor="password_confirmation" className="label">Confirm password</label>
                    <input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                        className={`input ${errors.password_confirmation ? 'input-error' : ''}`} placeholder="Re-enter password" autoComplete="new-password" required />
                    {errors.password_confirmation && <p className="mt-1 text-xs text-red-400">{errors.password_confirmation}</p>}
                </div>
                <button type="submit" disabled={processing} className="btn-primary w-full">
                    {processing ? 'Resetting...' : 'Reset password'}
                </button>
            </form>
        </GuestLayout>
    );
}
