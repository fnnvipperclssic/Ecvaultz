import React, { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Share({ sharedByMe, sharedWithMe, myFiles = [] }) {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [shareLink, setShareLink] = useState(null);
    const [notifyRecipient, setNotifyRecipient] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        file_uuid: '',
        type: 'internal',
        email: '',
        permission: 'read',
        password: '',
        expires_in_hours: '24',
        notify: true,
    });

    const openShareModal = () => {
        setShowModal(true);
        setShareLink(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/shares', {
            onSuccess: (page) => {
                if (page.props.flash?.share_link) {
                    setShareLink(page.props.flash.share_link);
                } else {
                    setShowModal(false);
                }
            },
        });
    };

    const copyLink = (link) => {
        navigator.clipboard.writeText(link);
    };

    const removeShare = (uuid) => {
        if (confirm('Remove this share?')) {
            router.delete('/shares/' + uuid, { preserveScroll: true });
        }
    };

    const tabs = ['Shared by me', 'Shared with me'];
    const [activeTab, setActiveTab] = useState(0);

    return (
        <AuthenticatedLayout header="Shared Files">
            <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-1 rounded-lg bg-surface-100 p-1">
                        {tabs.map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(i)}
                                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === i ? 'bg-surface-100 text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {activeTab === 0 && (
                        <button onClick={openShareModal} className="btn-primary text-sm">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share File
                        </button>
                    )}
                </div>

                {/* Share Link result */}
                {shareLink && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-security-glow/60 p-4">
                        <p className="text-sm font-medium text-green-800">Share link created!</p>
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="input flex-1 bg-surface-100 text-sm"
                                onFocus={(e) => e.target.select()}
                            />
                            <button onClick={() => copyLink(shareLink)} className="btn-secondary text-sm">
                                Copy
                            </button>
                            <button onClick={() => setShareLink(null)} className="btn-ghost text-sm">Done</button>
                        </div>
                    </div>
                )}

                {/* Share modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl bg-surface-100 p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-surface-900">Share file</h3>
                                <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-surface-400 hover:text-surface-600 hover:bg-surface-100">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label">Select file</label>
                                    <select
                                        value={data.file_uuid}
                                        onChange={(e) => setData('file_uuid', e.target.value)}
                                        className={`input ${errors.file_uuid ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Choose a file...</option>
                                        {myFiles.map((file) => (
                                            <option key={file.uuid} value={file.uuid}>
                                                {file.name} ({file.size})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.file_uuid && <p className="mt-1 text-xs text-red-500">{errors.file_uuid}</p>}
                                    {myFiles.length === 0 && (
                                        <p className="mt-1 text-xs text-surface-500">
                                            No files available. <a href="/files" className="text-primary-500 hover:underline">Upload files first</a>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">Share type</label>
                                    <div className="flex gap-2">
                                        {['internal', 'external'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setData('type', type)}
                                                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                                    data.type === type
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                        : 'border-surface-200 bg-surface-100 text-surface-600 hover:bg-surface-50'
                                                }`}
                                            >
                                                {type === 'internal' ? 'Internal User' : 'Share Link'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={data.type === 'internal' ? "user@example.com" : "recipient@example.com"}
                                        className={`input ${errors.email ? 'input-error' : ''}`}
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                </div>

                                {/* Notify recipient checkbox */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="notify_recipient"
                                        checked={data.notify}
                                        onChange={(e) => setData('notify', e.target.checked)}
                                        className="h-4 w-4 rounded border-surface-300 text-primary-600"
                                    />
                                    <label htmlFor="notify_recipient" className="text-sm text-surface-700 cursor-pointer">
                                        Notify recipient via email
                                    </label>
                                </div>

                                <div>
                                    <label className="label">Permission</label>
                                    <select
                                        value={data.permission}
                                        onChange={(e) => setData('permission', e.target.value)}
                                        className="input"
                                    >
                                        <option value="read">Read only</option>
                                        <option value="write">Read & Write</option>
                                    </select>
                                </div>

                                {data.type === 'external' && (
                                    <>
                                        <div>
                                            <label className="label">Password protection (optional)</label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Set a password for the link"
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Expires in</label>
                                            <select
                                                value={data.expires_in_hours}
                                                onChange={(e) => setData('expires_in_hours', e.target.value)}
                                                className="input"
                                            >
                                                <option value="1">1 hour</option>
                                                <option value="6">6 hours</option>
                                                <option value="24">24 hours</option>
                                                <option value="72">3 days</option>
                                                <option value="168">7 days</option>
                                                <option value="720">30 days</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing} className="btn-primary flex-1">
                                        {processing ? 'Sharing...' : 'Share'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Content */}
                {activeTab === 0 ? (
                    <div className="card overflow-hidden !p-0">
                        {sharedByMe?.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-200 bg-surface-50">
                                        <th className="table-header">File</th>
                                        <th className="table-header">Shared with</th>
                                        <th className="table-header">Permission</th>
                                        <th className="table-header">Type</th>
                                        <th className="table-header">Expires</th>
                                        <th className="table-header hidden lg:table-cell">Access</th>
                                        <th className="table-header w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {sharedByMe.map((share) => (
                                        <tr key={share.uuid} className="hover:bg-surface-50">
                                            <td className="table-cell font-medium">{share.file_name}</td>
                                            <td className="table-cell">{share.shared_with_email}</td>
                                            <td className="table-cell">
                                                <span className={`badge ${share.permission === 'write' ? 'badge-warning' : 'badge-info'}`}>
                                                    {share.permission}
                                                </span>
                                            </td>
                                            <td className="table-cell">{share.type}</td>
                                            <td className="table-cell">
                                                {share.expires_at ? (
                                                    <span className={share.is_expired ? 'text-red-500' : 'text-surface-500'}>
                                                        {share.expires_at}
                                                    </span>
                                                ) : 'Never'}
                                            </td>
                                            <td className="table-cell hidden lg:table-cell text-xs text-surface-500">
                                                <div className="flex flex-col">
                                                    {share.access_count !== undefined && (
                                                        <span>Accessed {share.access_count} times</span>
                                                    )}
                                                    {share.last_accessed_at && (
                                                        <span>Last: {share.last_accessed_at}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <button onClick={() => removeShare(share.uuid)} className="rounded p-1 text-surface-400 hover:text-red-600 hover:bg-red-500/10">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center py-16 text-center">
                                <svg className="h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <p className="mt-3 text-sm text-surface-500">No files shared yet</p>
                                <p className="mt-1 text-xs text-surface-400">Share files with others using the button above</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card overflow-hidden !p-0">
                        {sharedWithMe?.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-200 bg-surface-50">
                                        <th className="table-header">File</th>
                                        <th className="table-header">Shared by</th>
                                        <th className="table-header">Permission</th>
                                        <th className="table-header">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {sharedWithMe.map((share) => (
                                        <tr key={share.uuid} className="hover:bg-surface-50">
                                            <td className="table-cell">
                                                <a href={'/files/' + share.file_uuid + '/download'} className="font-medium text-primary-600 hover:text-primary-700">
                                                    {share.file_name}
                                                </a>
                                            </td>
                                            <td className="table-cell">{share.shared_by_name}</td>
                                            <td className="table-cell">
                                                <span className={`badge ${share.permission === 'write' ? 'badge-warning' : 'badge-info'}`}>
                                                    {share.permission}
                                                </span>
                                            </td>
                                            <td className="table-cell text-surface-500">{share.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center py-16 text-center">
                                <svg className="h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <p className="mt-3 text-sm text-surface-500">No files shared with you</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
