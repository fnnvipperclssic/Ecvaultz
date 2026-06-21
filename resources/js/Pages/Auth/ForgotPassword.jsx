/**
 * ForgotPassword — Password Reset Initiation Page
 *
 * Halaman pertama dalam flow reset password. User memasukkan email
 * untuk mencari akunnya. Jika akun ditemukan dan memiliki security
 * questions, user akan diarahkan ke halaman verifikasi pertanyaan.
 *
 * Flow baru (security questions only):
 * 1. User masukkan email → POST /forgot-password
 * 2. Server cek apakah user punya security questions
 * 3. Jika ya → redirect ke /password/security-questions
 * 4. Jika tidak → tampilkan error (hubungi admin)
 *
 * @security Tidak menampilkan apakah email terdaftar atau tidak (anti-enumeration)
 * @security Tidak ada reset link dikirim via email (menghilangkan vektor phishing)
 *
 * @param {object} props — Inertia page props (errors, flash messages)
 */

import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    return (
        <GuestLayout>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/forgot-password');
                }}
                className="space-y-5"
            >
                <div>
                    <h2 className="text-xl font-semibold text-surface-800">
                        Find Your Account
                    </h2>
                    <p className="mt-1 text-sm text-surface-500">
                        Enter your email address to begin the password reset
                        process. You will be asked to answer your security
                        questions to verify your identity.
                    </p>
                </div>
                <div>
                    <label htmlFor="email" className="label">
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className={`input ${errors.email ? 'input-error' : ''}`}
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                        required
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-400">
                            {errors.email}
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary w-full"
                >
                    {processing ? 'Looking up account...' : 'Continue to Security Questions'}
                </button>
                <p className="text-center text-sm text-surface-500">
                    <Link
                        href="/login"
                        className="font-medium text-primary-400 hover:text-primary-300"
                    >
                        Back to sign in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
