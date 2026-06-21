import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { useSnackbar } from 'notistack';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmptyState from '@/Components/EmptyState';

export default function DataRoomIndex({ dataRooms = [] }) {
    const { enqueueSnackbar } = useSnackbar();
    const [showCreate, setShowCreate] = useState(false);

    const getStatusBadge = (room) => {
        if (room.is_expired) {
            return <span className="badge bg-red-100 text-red-700">Expired</span>;
        }
        return <span className="badge bg-green-100 text-green-700">Active</span>;
    };

    const copyRoomLink = (uuid) => {
        const link = window.location.origin + '/data-rooms/' + uuid;
        navigator.clipboard.writeText(link);
        enqueueSnackbar('Room link copied to clipboard', { variant: 'success' });
    };

    return (
        <AuthenticatedLayout header="Data Rooms">
            <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-surface-900">Data Rooms</h2>
                        <p className="text-sm text-surface-500 mt-1">Secure virtual data rooms for organized file sharing</p>
                    </div>
                    <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Data Room
                    </button>
                </div>

                {/* Create form inline */}
                {showCreate && (
                    <CreateDataRoomForm onClose={() => setShowCreate(false)} />
                )}

                {/* Data room cards */}
                {dataRooms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dataRooms.map((room) => (
                            <div key={room.uuid || room.id} className="card group hover:border-primary-500/30 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/10 border border-primary-500/20" style={room.primary_color ? { backgroundColor: room.primary_color + '20', borderColor: room.primary_color + '40' } : {}}>
                                            <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Link href={'/data-rooms/' + (room.uuid || room.id)} className="text-sm font-semibold text-surface-900 hover:text-primary-600 transition-colors">
                                                {room.name}
                                            </Link>
                                            <p className="text-xs text-surface-500">{room.file_count || 0} files</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(room)}
                                </div>

                                {room.description && (
                                    <p className="text-sm text-surface-500 mb-3 line-clamp-2">{room.description}</p>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                                    {room.expires_at ? (
                                        <span className={`text-xs ${room.is_expired ? 'text-red-500' : 'text-amber-500'}`}>
                                            {room.is_expired ? 'Expired ' : 'Expires '}{room.expires_at}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-surface-400">No expiry</span>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => copyRoomLink(room.uuid || room.id)}
                                            className="rounded p-1.5 text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 transition-colors"
                                            title="Copy room link"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                            </svg>
                                        </button>
                                        <Link
                                            href={'/data-rooms/' + (room.uuid || room.id)}
                                            className="rounded p-1.5 text-surface-400 hover:text-primary-500 hover:bg-primary-500/10 transition-colors"
                                            title="Open room"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState type="files" title="No data rooms yet" description="Create your first data room to start sharing files securely" action="Create Data Room" actionHref="#" />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function CreateDataRoomForm({ onClose }) {
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        primary_color: '#4f46e5',
        expires_at: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setLogoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formPayload = new FormData();
        formPayload.append('name', formData.name);
        formPayload.append('description', formData.description);
        formPayload.append('primary_color', formData.primary_color);
        if (formData.expires_at) formPayload.append('expires_at', formData.expires_at);
        if (logoFile) formPayload.append('logo', logoFile);

        router.post('/data-rooms', formPayload, {
            onSuccess: () => {
                enqueueSnackbar('Data room created!', { variant: 'success' });
                onClose();
            },
            onError: (err) => {
                enqueueSnackbar(Object.values(err).flat().join(', '), { variant: 'error' });
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="mb-6 rounded-xl border border-surface-300 bg-surface-100/80 p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-surface-900">Create New Data Room</h3>
                <button onClick={onClose} className="rounded-lg p-1 text-surface-400 hover:text-surface-600 hover:bg-surface-200">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div>
                    <label className="label">Room Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input"
                        required
                        placeholder="e.g. M&A Due Diligence"
                    />
                </div>

                <div>
                    <label className="label">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="input"
                        rows={2}
                        placeholder="Brief description of this data room"
                    />
                </div>

                <div>
                    <label className="label">Logo (optional)</label>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="input" />
                    {logoPreview && (
                        <img src={logoPreview} alt="Logo preview" className="mt-2 h-12 w-12 rounded-lg object-cover border border-surface-200" />
                    )}
                </div>

                <div>
                    <label className="label">Primary Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={formData.primary_color}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            className="h-9 w-9 rounded-lg border border-surface-300 cursor-pointer"
                        />
                        <span className="text-sm text-surface-500">{formData.primary_color}</span>
                    </div>
                </div>

                <div>
                    <label className="label">Expiry Date (optional)</label>
                    <input
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        className="input"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Creating...' : 'Create Data Room'}
                    </button>
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                </div>
            </form>
        </div>
    );
}
