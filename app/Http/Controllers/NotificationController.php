<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest('created_at')
            ->paginate(20)
            ->through(fn ($notif) => [
                'id' => $notif->id,
                'type' => $notif->type,
                'title' => $notif->data['title'] ?? $notif->type,
                'message' => $notif->data['message'] ?? '',
                'data' => $notif->data,
                'is_read' => $notif->isRead(),
                'created_at' => $notif->created_at->diffForHumans(),
            ]);

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
            'unreadCount' => $this->notificationService->unreadCount($user),
        ]);
    }

    public function markRead(string $id, Request $request): RedirectResponse
    {
        $notification = \App\Models\Notification::findOrFail($id);

        if ($notification->notifiable_id !== $request->user()->id) {
            abort(403);
        }

        $this->notificationService->markAsRead($notification);

        return back()->with('success', 'Notification marked as read.');
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $this->notificationService->markAllAsRead($request->user());

        return back()->with('success', 'All notifications marked as read.');
    }
}
