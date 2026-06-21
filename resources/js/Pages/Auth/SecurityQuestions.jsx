import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const PREDEFINED_QUESTIONS = [
    'Apa nama kota tempat Anda lahir?',
    'Siapa nama hewan peliharaan pertama Anda?',
    'Apa merek mobil pertama Anda?',
    'Siapa nama sekolah dasar Anda?',
    'Apa pekerjaan impian masa kecil Anda?',
    'Siapa nama guru favorit Anda?',
    'Apa makanan favorit Anda saat kecil?',
    'Di mana Anda menghabiskan liburan favorit pertama?',
    'Siapa nama panggilan masa kecil Anda?',
    'Apa film favorit Anda sepanjang masa?',
];

export default function SecurityQuestions({ predefinedQuestions, existingQuestions, hasQuestions }) {
    const [questions, setQuestions] = useState([
        { question: '', answer: '', customQuestion: '' },
        { question: '', answer: '', customQuestion: '' },
    ]);
    const { data, setData, post, processing } = useForm();

    const addQuestion = () => {
        if (questions.length < 5) {
            setQuestions([...questions, { question: '', answer: '' }]);
        }
    };

    const removeQuestion = (index) => {
        if (questions.length > 2) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index, field, value) => {
        const updated = questions.map((q, i) => {
            if (i !== index) return q;
            const next = { ...q, [field]: value };

            // When user selects 'custom' from dropdown, clear the question value
            // so the custom question text input can set it on blur
            if (field === 'question' && value === 'custom') {
                next.question = '';
            }

            // When user types in custom question input and blurs, store as question
            if (field === 'customQuestion' && value !== '') {
                next.question = value;
                next.customQuestion = value;
            }

            return next;
        });
        setQuestions(updated);
        setData('questions', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/security-questions', {
            data: { questions },
            onSuccess: () => {
                // reset form
                setQuestions([{ question: '', answer: '' }, { question: '', answer: '' }]);
            },
        });
    };

    const questionOptions = predefinedQuestions || PREDEFINED_QUESTIONS;

    return (
        <AuthenticatedLayout header="Security Questions">
            <div className="max-w-2xl mx-auto px-6 py-8">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-surface-800 mb-2">
                        {hasQuestions ? 'Update Security Questions' : 'Set Up Security Questions'}
                    </h3>
                    <p className="text-sm text-surface-500 mb-6">
                        Security questions help verify your identity when resetting your password.
                        Choose at least 2 questions with answers only you would know.
                        Answers are case-insensitive but stored securely hashed.
                    </p>

                    {hasQuestions && existingQuestions?.length > 0 && (
                        <div className="mb-6 p-3 rounded-lg bg-surface-100">
                            <p className="text-sm font-medium text-surface-700 mb-2">Current Questions:</p>
                            <ul className="list-disc list-inside text-sm text-surface-600">
                                {existingQuestions.map((q) => (
                                    <li key={q.id}>{q.question}</li>
                                ))}
                            </ul>
                            <p className="text-xs text-surface-400 mt-2">Setting new questions will replace existing ones.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {questions.map((q, index) => (
                            <div key={index} className="p-4 rounded-lg border border-surface-200 bg-surface-50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-surface-700">Question {index + 1}</span>
                                    {questions.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(index)}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={q.question}
                                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                    className="input mb-3 w-full"
                                    required
                                >
                                    <option value="">-- Select a question --</option>
                                    <option value="custom">-- Write your own --</option>
                                    {questionOptions.map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                {q.question === '' && q.customQuestion !== undefined && (
                                    <input
                                        type="text"
                                        value={q.customQuestion}
                                        onChange={(e) => updateQuestion(index, 'customQuestion', e.target.value)}
                                        onBlur={(e) => {
                                            if (e.target.value.trim()) {
                                                updateQuestion(index, 'question', e.target.value.trim());
                                            }
                                        }}
                                        placeholder="Enter your custom question..."
                                        className="input mb-3 w-full"
                                        required
                                    />
                                )}
                                <input
                                    type="text"
                                    value={q.answer}
                                    onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                                    placeholder="Enter your answer..."
                                    className="input w-full"
                                    required
                                />
                            </div>
                        ))}

                        {questions.length < 5 && (
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="btn-secondary text-sm w-full"
                            >
                                + Add Another Question
                            </button>
                        )}

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={processing} className="btn-primary">
                                {hasQuestions ? 'Update Questions' : 'Save Questions'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
