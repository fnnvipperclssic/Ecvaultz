import React from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminSettings({ settings }) {
    const { data, setData, patch, processing } = useForm({
        max_upload_size: Math.round(settings.max_upload_size / 1048576),
        upload_rate_limit: settings.upload_rate_limit,
        download_rate_limit: settings.download_rate_limit,
        password_min_length: settings.password_min_length,
        password_expiry_days: settings.password_expiry_days,
        account_lockout_threshold: settings.account_lockout_threshold,
        account_lockout_minutes: settings.account_lockout_minutes,
        two_factor_required: settings.two_factor_required,
        soft_delete_retention_days: settings.soft_delete_retention_days,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch('/admin/settings');
    };

    return (
        <AdminLayout header="System Settings">
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div className="card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-surface-800">File Settings</h3>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Max Upload Size (MB)</label>
                        <input type="number" value={data.max_upload_size} onChange={e => setData('max_upload_size', parseInt(e.target.value))} className="input w-full" min="1" max="1024" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Upload Rate Limit (per min)</label>
                            <input type="number" value={data.upload_rate_limit} onChange={e => setData('upload_rate_limit', parseInt(e.target.value))} className="input w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Download Rate Limit (per min)</label>
                            <input type="number" value={data.download_rate_limit} onChange={e => setData('download_rate_limit', parseInt(e.target.value))} className="input w-full" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Soft Delete Retention (days)</label>
                        <input type="number" value={data.soft_delete_retention_days} onChange={e => setData('soft_delete_retention_days', parseInt(e.target.value))} className="input w-full" min="1" max="365" />
                    </div>
                </div>

                <div className="card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-surface-800">Security Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Password Min Length</label>
                            <input type="number" value={data.password_min_length} onChange={e => setData('password_min_length', parseInt(e.target.value))} className="input w-full" min="8" max="64" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Password Expiry (days)</label>
                            <input type="number" value={data.password_expiry_days} onChange={e => setData('password_expiry_days', parseInt(e.target.value))} className="input w-full" min="0" max="365" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Account Lockout Threshold</label>
                            <input type="number" value={data.account_lockout_threshold} onChange={e => setData('account_lockout_threshold', parseInt(e.target.value))} className="input w-full" min="1" max="20" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Lockout Duration (minutes)</label>
                            <input type="number" value={data.account_lockout_minutes} onChange={e => setData('account_lockout_minutes', parseInt(e.target.value))} className="input w-full" min="1" max="1440" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.two_factor_required}
                            onChange={e => setData('two_factor_required', e.target.checked)}
                            className="h-4 w-4 rounded border-surface-300 text-primary-600"
                        />
                        <span className="text-sm text-surface-700">Require 2FA for all users</span>
                    </label>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={processing} className="btn-primary">Save Settings</button>
                </div>
            </form>
        </AdminLayout>
    );
}
