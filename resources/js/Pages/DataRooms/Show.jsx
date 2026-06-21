import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmptyState from '@/Components/EmptyState';

export default function DataRoomShow({ room, invites = [], files = [] }) {
    const { enqueueSnackbar } = useSnackbar();
    const [activeTab, setActiveTab] = useState('files');
    const [showSettings, setShowSettings] = useState(false);
    const [emailInput, setEmailInput] = useState('');

    // Room settings form
    const settingsForm = useForm({
        name: room?.name || '',
        description: room?.description || '',
        primary_color: room?.primary_color || '#4f46e5',
        expires_at: room?.expires_at || '',
    });

    if (!room) {
        return (
            <AuthenticatedLayout header="Data Room">
                <div className="px-6 py-6">
                    <EmptyState type="error" title="Data room not found" description="This data room does not exist or has been removed" />
                </div>
            </AuthenticatedLayout>
        );
    }

    const isExpired = room.is_expired || false;

    const copyRoomLink = () => {
        const link = window.location.origin + '/data-rooms/' + (room.uuid || room.id);
        navigator.clipboard.writeText(link);
        enqueueSnackbar('Room link copied to clipboard', { variant: 'success' });
    };

    const handleInvite = (e) => {
        e.preventDefault();
        if (!emailInput.trim()) return;

        router.post('/data-rooms/' + (room.uuid || room.id) + '/invite', {
            email: emailInput.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEmailInput('');
                enqueueSnackbar('Invitation sent!', { variant: 'success' });
            },
            onError: (err) => {
                enqueueSnackbar(Object.values(err).flat().join(', '), { variant: 'error' });
            },
        });
    };

    const handleRemoveInvite = (inviteUuid) => {
        if (!confirm('Remove this invitation?')) return;
        router.delete('/data-rooms/' + (room.uuid || room.id) + '/invites/' + inviteUuid, {
            preserveScroll: true,
        });
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        settingsForm.put('/data-rooms/' + (room.uuid || room.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSettings(false);
                enqueueSnackbar('Settings updated!', { variant: 'success' });
            },
            onError: () => {
                enqueueSnackbar('Failed to update settings', { variant: 'error' });
            },
        });
    };

    const tabs = [
        { key: 'files', label: 'Files' },
        { key: 'invites', label: 'Invites' },
    ];

    const inviteStatusBadge = (invite) => {
        if (invite.accepted_at) return <span className="badge bg-green-100 text-green-700">Accepted</span>;
        if (invite.revoked_at) return <span className="badge bg-red-100 text-red-700">Revoked</span>;
        return <span className="badge bg-amber-100 text-amber-700">Pending</span>;
    };

    return (
        <AuthenticatedLayout header={'Data Room: ' + room.name}>
            <div className="px-6 py-6">
                {/* Header */}
                <div className="card mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-14 w-14 items-center justify-center rounded-xl border"
                                style={{
                                    backgroundColor: (room.primary_color || '#4f46e5') + '20',
                                    borderColor: (room.primary_color || '#4f46e5') + '40',
                                }}
                            >
                                {room.logo_url ? (
                                    <img src={room.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                                ) : (
                                    <svg className="h-7 w-7" style={{ color: room.primary_color || '#4f46e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-surface-900">{room.name}</h2>
                                    {isExpired
                                        ? <span className="badge bg-red-100 text-red-700">Expired</span>
                                        : <span className="badge bg-green-100 text-green-700">Active</span>
                                    }
                                </div>
                                {room.description && (
                                    <p className="text-sm text-surface-500 mt-1">{room.description}</p>
                                )}
                                <p className="text-xs text-surface-400 mt-1">
                                    {files.length} files &middot; {invites.length} invites
                                    {room.expires_at && !isExpired && <span> &middot; Expires {room.expires_at}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={copyRoomLink} className="btn-secondary text-sm">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                </svg>
                                Copy Room Link
                            </button>
                            <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary text-sm">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Settings panel */}
                {showSettings && (
                    <div className="card mb-6 animate-slide-up">
                        <h3 className="text-base font-semibold text-surface-900 mb-4">Room Settings</h3>
                        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
                            <div>
                                <label className="label">Room Name</label>
                                <input
                                    type="text"
                                    value={settingsForm.data.name}
                                    onChange={(e) => settingsForm.setData('name', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    value={settingsForm.data.description}
                                    onChange={(e) => settingsForm.setData('description', e.target.value)}
                                    className="input"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="label">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settingsForm.data.primary_color}
                                        onChange={(e) => settingsForm.setData('primary_color', e.target.value)}
                                        className="h-9 w-9 rounded-lg border border-surface-300 cursor-pointer"
                                    />
                                    <span className="text-sm text-surface-500">{settingsForm.data.primary_color}</span>
                                </div>
                            </div>
                            <div>
                                <label className="label">Expiry</label>
                                <input
                                    type="datetime-local"
                                    value={settingsForm.data.expires_at}
                                    onChange={(e) => settingsForm.setData('expires_at', e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={settingsForm.processing} className="btn-primary">
                                    Save Settings
                                </button>
                                <button type="button" onClick={() => setShowSettings(false)} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 rounded-lg bg-surface-100 p-1 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-surface-100 text-surface-900 shadow-sm'
                                    : 'text-surface-500 hover:text-surface-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Files */}
                {activeTab === 'files' && (
                    <div className="card overflow-hidden !p-0">
                        {files.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-200 bg-surface-50">
                                        <th className="table-header">Name</th>
                                        <th className="table-header hidden md:table-cell">Size</th>
                                        <th className="table-header hidden lg:table-cell">Uploaded</th>
                                        <th className="table-header w-24"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {files.map((file) => (
                                        <tr key={file.uuid || file.id} className="hover:bg-surface-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <svg className="h-5 w-5 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-surface-700 truncate">{file.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell hidden md:table-cell">{file.size}</td>
                                            <td className="table-cell hidden lg:table-cell">{file.uploaded_at_human || file.created_at}</td>
                                            <td className="py-3 pr-4">
                                                <a
                                                    href={'/files/' + (file.uuid || file.id) + '/download'}
                                                    className="rounded p-1 text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                    title="Download"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <EmptyState type="files" title="No files in this room" description="Files will appear here once they are added" />
                        )}
                    </div>
                )}

                {/* Tab: Invites */}
                {activeTab === 'invites' && (
                    <div>
                        {/* Invite form */}
                        <form onSubmit={handleInvite} className="card mb-4">
                            <h4 className="text-sm font-semibold text-surface-900 mb-3">Invite People</h4>
                            <div className="flex items-center gap-3">
                                <input
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    placeholder="Enter email address..."
                                    className="input flex-1"
                                    required
                                />
                                <button type="submit" className="btn-primary text-sm">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                    Send Invite
                                </button>
                            </div>
                        </form>

                        {/* Invites list */}
                        <div className="card overflow-hidden !p-0">
                            {invites.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-surface-200 bg-surface-50">
                                            <th className="table-header">Email</th>
                                            <th className="table-header">Status</th>
                                            <th className="table-header hidden lg:table-cell">Sent</th>
                                            <th className="table-header w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-100">
                                        {invites.map((invite) => (
                                            <tr key={invite.uuid || invite.id} className="hover:bg-surface-50">
                                                <td className="table-cell font-medium">{invite.email}</td>
                                                <td className="table-cell">{inviteStatusBadge(invite)}</td>
                                                <td className="table-cell hidden lg:table-cell text-surface-500">{invite.created_at}</td>
                                                <td className="py-3 pr-4">
                                                    {!invite.accepted_at && !invite.revoked_at && (
                                                        <button
                                                            onClick={() => handleRemoveInvite(invite.uuid || invite.id)}
                                                            className="rounded p-1 text-surface-400 hover:text-red-600 hover:bg-red-500/10"
                                                            title="Revoke invite"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <EmptyState type="share" title="No invites yet" description="Invite people by email to grant them access to this room" />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
