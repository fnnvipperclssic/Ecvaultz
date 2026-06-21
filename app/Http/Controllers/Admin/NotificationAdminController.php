<?php

/**
 * Admin Notification Controller — Manajemen Notifikasi
 *
 * Menyediakan visibilitas administratif ke tabel `notifications`.
 * Admin dapat melihat dan menghapus notifikasi di seluruh sistem.
 *
 * @package App\Http\Controllers\Admin
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationAdminController extends Controller
{
    /**
     * Daftar semua notifikasi dengan filter.
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['type', 'read_at', 'created_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query = Notification::query();

        if ($search = $request->get('search')) {
            $escaped = addcslashes($search, '%_');
            $query->where(function ($q) use ($escaped) {
                $q->where('type', 'LIKE', "%{$escaped}%")
                  // Gunakan LIKE pada JSON path untuk substring search
                  // (whereJsonContains hanya cocok untuk array elements)
                  ->orWhere('data', 'LIKE', '%' . $escaped . '%');
            });
        }

        if ($request->get('read') === 'read') {
            $query->whereNotNull('read_at');
        } elseif ($request->get('read') === 'unread') {
            $query->whereNull('read_at');
        }

        $notifications = $query->orderBy($sort, $order)->paginate(25)->withQueryString();

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'filters' => (object) $request->only(['search', 'read', 'sort', 'order']),
            'stats' => [
                'total' => Notification::count(),
                'unread' => Notification::whereNull('read_at')->count(),
                'read' => Notification::whereNotNull('read_at')->count(),
            ],
        ]);
    }

    /**
     * Hapus notifikasi — admin bisa membersihkan notifikasi.
     */
    public function destroy(Request $request, Notification $notification): RedirectResponse
    {
        $notification->delete();

        ActivityLog::log(
            $request->user()->id,
            'admin_notification_deleted',
            $request->ip(),
            $request->userAgent(),
            ['notification_id' => $notification->id]
        );

        return redirect()->route('admin.notifications.index')->with('success', 'Notification deleted.');
    }
}
