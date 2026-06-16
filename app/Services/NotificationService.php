<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     * Send a notification to a user.
     */
    public function send(User $user, string $type, array $data = []): Notification
    {
        return Notification::create([
            'id' => (string) Str::uuid(),
            'type' => $type,
            'notifiable_id' => $user->id,
            'notifiable_type' => User::class,
            'data' => $data,
            'created_at' => now(),
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications()->update(['read_at' => now()]);
    }

    /**
     * Get unread notification count.
     */
    public function unreadCount(User $user): int
    {
        return $user->unreadNotificationsCount();
    }

    /**
     * Send file shared notification.
     */
    public function notifyFileShared(User $sender, User $recipient, string $fileName, string $permission): void
    {
        $this->send($recipient, 'file_shared', [
            'title' => 'File Shared With You',
            'message' => "{$sender->name} shared \"{$fileName}\" with you ({$permission} access).",
            'sender_name' => $sender->name,
            'file_name' => $fileName,
            'permission' => $permission,
        ]);
    }

    /**
     * Send new device login notification.
     */
    public function notifyNewDeviceLogin(User $user, string $ipAddress, string $userAgent): void
    {
        $this->send($user, 'new_device_login', [
            'title' => 'New Device Login',
            'message' => "New login detected from IP: {$ipAddress}.",
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'time' => now()->toDateTimeString(),
        ]);
    }

    /**
     * Send password changed notification.
     */
    public function notifyPasswordChanged(User $user): void
    {
        $this->send($user, 'password_changed', [
            'title' => 'Password Changed',
            'message' => 'Your password was changed successfully. If this was not you, contact support immediately.',
            'time' => now()->toDateTimeString(),
        ]);
    }
}
