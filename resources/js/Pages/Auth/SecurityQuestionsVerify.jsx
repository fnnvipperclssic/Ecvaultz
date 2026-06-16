import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function SecurityQuestionsVerify({ email, questions }) {
    const [answers, setAnswers] = useState({});
    const { post, processing, errors } = useForm();

    const handleSubmit = (e) => {
        e.preventDefault();
        const verifications = questions.map((q) => ({
            id: q.id,
            answer: answers[q.id] || '',
        }));

        post('/security-questions/verify', {
            data: { email, verifications },
        });
    };

    return (
        <GuestLayout title="Verify Identity">
            <div className="card p-6">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                        <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-800">Verify Your Identity</h3>
                    <p className="mt-2 text-sm text-surface-500">
                        Answer your security questions to verify your identity and reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {questions.map((q) => (
                        <div key={q.id}>
                            <label className="block text-sm font-medium text-surface-700 mb-1">
                                {q.question}
                            </label>
                            <input
                                type="text"
                                value={answers[q.id] || ''}
                                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                placeholder="Your answer..."
                                className="input w-full"
                                required
                                autoComplete="off"
                            />
                        </div>
                    ))}

                    <button type="submit" disabled={processing} className="btn-primary w-full">
                        Verify Answers
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                        Use email verification instead
                    </a>
                </div>
            </div>
        </GuestLayout>
    );
}
