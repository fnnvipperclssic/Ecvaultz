import React, { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function TwoFactor() {
    const { data, setData, post, processing, errors } = useForm({ code: '' });
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [useRecovery, setUseRecovery] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState('');
    const inputRefs = useRef([]);

    const handleDigitChange = (index, value) => {
        if (value.length <= 1 && /^[0-9]*$/.test(value)) {
            const newCode = [...code]; newCode[index] = value;
            setCode(newCode); setData('code', newCode.join(''));
            if (value && index < 5) inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'Paste') {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
            if (/^\d{6}$/.test(pasted)) {
                const digits = pasted.split(''); setCode(digits); setData('code', pasted);
                digits.forEach((d, i) => { if (inputRefs.current[i]) inputRefs.current[i].value = d; });
            }
        }
    };

    const handleSubmit = (e) => { e.preventDefault(); post('/2fa/challenge'); };
    const handleRecoverySubmit = (e) => { e.preventDefault(); router.post('/2fa/challenge', { code: recoveryCode }); };

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary-600/5 blur-[140px] pointer-events-none" />
            <div className="relative w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900">Two-Factor Authentication</h1>
                    <p className="mt-2 text-sm text-surface-500">Enter the 6-digit code from your authenticator app</p>
                </div>

                <div className="card p-6">
                    {!useRecovery ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {code.map((digit, index) => (
                                    <input key={index} ref={(el) => (inputRefs.current[index] = el)}
                                        type="text" inputMode="numeric" maxLength={1} value={digit}
                                        onChange={(e) => handleDigitChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={(e) => handleKeyDown(index, e)}
                                        className={`h-14 w-12 rounded-lg border bg-surface-100 text-center text-xl font-semibold text-surface-800 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.code ? 'border-red-500/50' : 'border-surface-300'}`}
                                        autoFocus={index === 0} />
                                ))}
                            </div>
                            {errors.code && <p className="text-center text-xs text-red-400">{errors.code}</p>}
                            <button type="submit" disabled={processing || code.join('').length !== 6} className="btn-primary w-full">
                                {processing ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : 'Verify'}
                            </button>
                            <button type="button" onClick={() => setUseRecovery(true)} className="w-full text-center text-sm text-primary-400 hover:text-primary-300">Use recovery code instead</button>
                        </form>
                    ) : (
                        <form onSubmit={handleRecoverySubmit} className="space-y-5">
                            <div>
                                <label className="label">Recovery code</label>
                                <input type="text" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                                    className={`input font-mono tracking-widest ${errors.code ? 'input-error' : ''}`} placeholder="XXXX-XXXX-XX" autoFocus />
                                {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code}</p>}
                            </div>
                            <button type="submit" disabled={processing || recoveryCode.length < 10} className="btn-primary w-full">Verify Recovery Code</button>
                            <button type="button" onClick={() => { setUseRecovery(false); setRecoveryCode(''); }} className="w-full text-center text-sm text-primary-400 hover:text-primary-300">Back to authenticator code</button>
                        </form>
                    )}
                </div>
                <p className="mt-6 text-center text-xs text-surface-500">Protected by enterprise-grade encryption & security</p>
            </div>
        </div>
    );
}
