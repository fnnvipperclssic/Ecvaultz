/**
 * ResetPassword — New Password Form (Security Questions Flow)
 *
 * Halaman terakhir dalam flow reset password. User memasukkan password
 * baru setelah identitasnya diverifikasi melalui security questions.
 *
 * Token verifikasi disimpan di server-side session (BUKAN di URL/email).
 * Halaman ini HANYA bisa diakses jika session token masih valid (15 menit).
 *
 * @security Token tidak dikirim via URL — mencegah token leakage di browser history/server logs
 * @security Session token memiliki TTL 15 menit — mencegah replay attack
 * @security Password divalidasi ketat (min 12, mixed case, numbers, symbols)
 *
 * @param {object} props
 * @param {string} props.email — email user (dari session)
 * @param {string} props.question_token — HMAC signed token (dari session)
 */

import React from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ResetPassword({ email, question_token }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        question_token: question_token || '',
        password: '',
        password_confirmation: '',
    });

    return (
        <GuestLayout>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/reset-password');
                }}
                className="space-y-5"
            >
                <div>
                    <h2 className="text-xl font-semibold text-surface-800">
                        Set New Password
                    </h2>
                    <p className="mt-1 text-sm text-surface-500">
                        Your identity has been verified. Choose a strong, unique
                        password for your account.
                    </p>
                </div>

                {/* Password strength requirements — OWASP A07 compliant */}
                <div className="rounded-md bg-surface-100 p-3 text-xs text-surface-600">
                    <p className="font-medium mb-1">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li>Minimum 12 characters</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number</li>
                        <li>At least one symbol (!@#$%^&*)</li>
                    </ul>
                </div>

                <div>
                    <label htmlFor="password" className="label">
                        New password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className={`input ${errors.password ? 'input-error' : ''}`}
                        placeholder="Min. 12 characters"
                        autoComplete="new-password"
                        autoFocus
                        required
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-400">
                            {errors.password}
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor="password_confirmation" className="label">
                        Confirm password
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        className={`input ${errors.password_confirmation ? 'input-error' : ''}`}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        required
                    />
                    {errors.password_confirmation && (
                        <p className="mt-1 text-xs text-red-400">
                            {errors.password_confirmation}
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary w-full"
                >
                    {processing ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </GuestLayout>
    );
}
