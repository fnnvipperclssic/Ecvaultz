/**
 * User Dashboard — Monitoring & File Overview
 *
 * Menampilkan:
 * - Storage quota bar
 * - Statistik file (total, size, shared, trash)
 * - Quick stats (favorites, shared files count)
 * - Recent files (5 terakhir)
 * - Recent activity (dari server, bukan client-side fetch)
 * - Recent logins (5 login terakhir — OWASP A09)
 * - Security status (2FA, security questions, password age)
 *
 * @param {object} props
 * @param {number} props.totalFiles
 * @param {number} props.totalSize
 * @param {number} props.trashedFiles
 * @param {number} props.sharedWithMe
 * @param {array}  props.recentFiles
 * @param {number} props.favoriteCount
 * @param {number} props.sharedFilesCount
 * @param {number} props.storageUsed
 * @param {number} props.storageQuota
 * @param {array}  props.recentActivity — dari server (OWASP A09)
 * @param {array}  props.recentLogins — dari server (OWASP A09)
 * @param {object} props.securityStatus — status keamanan akun
 */

import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DashboardSkeleton } from '@/Components/LoadingSkeleton';
import StorageQuotaBar from '@/Components/StorageQuotaBar';
import OnboardingTooltip from '@/Components/OnboardingTooltip';

export default function Dashboard({
    totalFiles, totalSize, trashedFiles, sharedWithMe,
    recentFiles, favoriteCount = 0, sharedFilesCount = 0,
    storageUsed = 0, storageQuota = 0,
    recentActivity = [], recentLogins = [], securityStatus = null,
}) {
    const totalSizeValue = totalSize ?? 0;
    const totalSizeLabel = typeof totalSizeValue === 'number' && totalSizeValue > 1024
        ? (totalSizeValue / 1024).toFixed(1) + ' TB'
        : totalSizeValue + ' GB';

    const stats = [
        { label: 'Total Files', value: totalFiles ?? 0, icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', color: 'from-primary-500/20 to-primary-600/5 text-primary-400 border-primary-500/20', href: '/files' },
        { label: 'Storage Used', value: totalSizeLabel, icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16', color: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20' },
        { label: 'Shared With Me', value: sharedWithMe ?? 0, icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342', color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20', href: '/shares' },
        { label: 'In Trash', value: trashedFiles ?? 0, icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', color: 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/20', href: '/files/trash' },
    ];

    if (totalFiles === undefined || totalFiles === null) {
        return <AuthenticatedLayout header="Dashboard"><div className="px-6 py-6"><DashboardSkeleton /></div></AuthenticatedLayout>;
    }

    return (
        <AuthenticatedLayout header="Dashboard">
            <OnboardingTooltip />
            <div className="px-6 py-6 space-y-6 animate-fade-in" data-onboard="dashboard">
                {/* Storage Quota */}
                {storageUsed !== undefined && storageQuota !== undefined && (
                    <div data-onboard="storage-bar">
                        <StorageQuotaBar used={storageUsed} quota={storageQuota} variant="full" />
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass rounded-2xl p-5 glass-hover">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} border`}>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>
                                </div>
                            </div>
                            {stat.href && <Link href={stat.href} className="mt-3 text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 transition-colors">View all &rarr;</Link>}
                        </div>
                    ))}
                </div>

                {/* Quick Stats + Security Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Favorites */}
                    <div className="glass rounded-2xl p-5 glass-hover">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Favorites</p>
                                <p className="text-xl font-bold text-white">{favoriteCount}</p>
                            </div>
                        </div>
                    </div>
                    {/* Shared Files */}
                    <div className="glass rounded-2xl p-5 glass-hover">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Shared Files</p>
                                <p className="text-xl font-bold text-white">{sharedFilesCount}</p>
                            </div>
                        </div>
                    </div>
                    {/* Security Status (OWASP A09) */}
                    {securityStatus && (
                        <div className="glass rounded-2xl p-5 glass-hover">
                            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Security Status</p>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-surface-400">2FA</span>
                                    <span className={securityStatus.two_factor_enabled ? 'text-emerald-400' : 'text-red-400'}>
                                        {securityStatus.two_factor_enabled ? '✅ Enabled' : '❌ Disabled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-surface-400">Security Questions</span>
                                    <span className={securityStatus.has_security_questions ? 'text-emerald-400' : 'text-red-400'}>
                                        {securityStatus.has_security_questions ? '✅ Set' : '❌ Not Set'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-surface-400">Email Verified</span>
                                    <span className={securityStatus.email_verified ? 'text-emerald-400' : 'text-amber-400'}>
                                        {securityStatus.email_verified ? '✅ Yes' : '⚠️ No'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-surface-400">Password Age</span>
                                    <span className={securityStatus.password_age_days > 90 ? 'text-red-400' : 'text-surface-300'}>
                                        {securityStatus.password_age_days} days
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Files */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Recent Files</h3>
                        <Link href="/files" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all</Link>
                    </div>
                    {recentFiles?.length > 0 ? (
                        recentFiles.map((file, i) => (
                            <Link key={file.uuid || i} href={'/files/' + file.uuid} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-100/60 transition-all border-b border-white/[0.03] last:border-0 group">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                    file.type?.startsWith('image/') ? 'bg-emerald-500/10 text-emerald-400' :
                                    file.type === 'application/pdf' ? 'bg-red-500/10 text-red-400' :
                                    'bg-surface-300 text-surface-400'}`}>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-surface-200 truncate group-hover:text-white transition-colors">{file.name}</p>
                                    <p className="text-xs text-surface-500">{file.size} &middot; {file.date}</p>
                                </div>
                                <svg className="h-4 w-4 text-surface-500 opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center py-14 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-200/50 mb-4">
                                <svg className="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                            </div>
                            <p className="text-sm font-medium text-surface-400">No files yet</p>
                            <p className="text-xs text-surface-500 mt-1">Upload your first file to get started</p>
                            <Link href="/files" className="mt-4 btn-primary text-sm">Upload Files</Link>
                        </div>
                    )}
                </div>

                {/* Recent Activity (from server — OWASP A09) */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                        <Link href="/activity-log" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all</Link>
                    </div>
                    {recentActivity.length > 0 ? (
                        recentActivity.map((entry, i) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.03] last:border-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-300/50 flex-shrink-0">
                                    <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-surface-200 truncate">{entry.description || entry.action || 'Activity'}</p>
                                    <p className="text-xs text-surface-500">{entry.date || entry.created_at || ''}</p>
                                </div>
                                {entry.ip_address && (
                                    <span className="text-xs text-surface-500 font-mono hidden sm:inline">{entry.ip_address}</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center py-10 text-center">
                            <svg className="h-8 w-8 text-surface-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-surface-500">No recent activity</p>
                        </div>
                    )}
                </div>

                {/* Recent Logins (OWASP A09) */}
                {recentLogins.length > 0 && (
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/[0.05]">
                            <h3 className="text-sm font-semibold text-white">Recent Logins</h3>
                        </div>
                        {recentLogins.map((login, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.03] last:border-0">
                                <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <span className="text-xs text-surface-400 font-mono">{login.ip_address}</span>
                                </div>
                                <span className="text-xs text-surface-500">{login.date}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
