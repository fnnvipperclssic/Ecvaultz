import React from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Notifications({ notifications, unreadCount }) {
    const markAsRead = (id) => {
        router.post('/notifications/' + id + '/read', {}, { preserveScroll: true });
    };

    const markAllAsRead = () => {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header="Notifications">
            <div className="max-w-2xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-surface-800">
                        Notifications {unreadCount > 0 && <span className="badge bg-primary-100 text-primary-700 text-xs ml-2">{unreadCount} unread</span>}
                    </h2>
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-sm text-primary-600 hover:text-primary-700">
                            Mark all as read
                        </button>
                    )}
                </div>

                {notifications?.data?.length > 0 ? (
                    <div className="space-y-2">
                        {notifications.data.map((notif) => (
                            <div
                                key={notif.id}
                                className={`card p-4 transition-colors cursor-pointer ${!notif.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/50' : ''}`}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notif.is_read ? 'font-semibold text-surface-800' : 'text-surface-700'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-sm text-surface-500 mt-0.5">{notif.message}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <span className="text-xs text-surface-400">{notif.created_at}</span>
                                        {!notif.is_read && (
                                            <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="block ml-auto mt-1 text-xs text-primary-500 hover:text-primary-700">
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-surface-400">
                        <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        <p className="text-sm">No notifications yet</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
