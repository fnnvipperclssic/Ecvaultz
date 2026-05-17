import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TwoFactorSetup({ qrCode, secret }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({ code: '' });
    const [showSecret, setShowSecret] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/2fa/enable');
    };

    return (
        <AuthenticatedLayout header="Setup Two-Factor Authentication">
            <div className="mx-auto max-w-2xl px-6 py-8">
                <div className="card space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-surface-900">Set up authenticator app</h3>
                        <p className="mt-1 text-sm text-surface-500">
                            Scan this QR code with Google Authenticator, Authy, or any TOTP-compatible app
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div
                            className="rounded-xl border-2 border-surface-200 bg-white p-4"
                            dangerouslySetInnerHTML={{ __html: qrCode }}
                        />
                    </div>

                    <div className="rounded-lg bg-surface-50 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-surface-700">Manual setup key</span>
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                {showSecret ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {showSecret && (
                            <p className="mt-2 break-all font-mono text-sm text-surface-600">{secret}</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">Enter verification code</label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className={`input text-center text-2xl tracking-widest font-mono ${errors.code ? 'input-error' : ''}`}
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />
                            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                        </div>

                        {flash?.error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{flash.error}</div>
                        )}

                        <button type="submit" disabled={processing || data.code.length !== 6} className="btn-primary w-full">
                            Verify & Enable 2FA
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
