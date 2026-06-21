<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'ip_address',
        'user_agent',
        'metadata',
        'file_uuid',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter activity logs for a specific file by its UUID stored in metadata.
     */
    public function scopeForFile($query, string $fileUuid): void
    {
        $query->where('metadata->file_uuid', $fileUuid);
    }

    /**
     * Create an activity log entry.
     *
     * Extracts file_uuid from metadata and populates the dedicated
     * file_uuid column for efficient querying (added in migration
     * 2026_06_21_000004_add_file_uuid_to_activity_logs).
     *
     * @param int|string|null $userId User performing the action
     * @param string $action Action identifier (e.g., 'upload', 'admin_file_deleted')
     * @param string|null $ip IP address (auto-detected if null)
     * @param string|null $userAgent User agent string (auto-detected if null)
     * @param array $metadata Additional context data (file_uuid extracted to dedicated column)
     * @return self
     */
    public static function log(int|string|null $userId, string $action, ?string $ip = null, ?string $userAgent = null, array $metadata = []): self
    {
        return static::create([
            'user_id' => $userId,
            'action' => $action,
            'ip_address' => $ip ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
            'metadata' => $metadata,
            'file_uuid' => $metadata['file_uuid'] ?? null,  // Populate dedicated column for efficient queries
            'created_at' => now(),
        ]);
    }

    /**
     * Get human-readable description for an action code.
     * Used by the dashboard and activity log views for display.
     *
     * @return string Human-readable action description
     */
    public function getActionDescription(): string
    {
        $descriptions = [
            'login' => 'Logged in',
            'logout' => 'Logged out',
            'register' => 'Registered account',
            'upload' => 'Uploaded a file',
            'download' => 'Downloaded a file',
            'delete' => 'Deleted a file',
            'restore' => 'Restored a file from trash',
            'permanent_delete' => 'Permanently deleted a file',
            'rename' => 'Renamed a file',
            'move' => 'Moved a file',
            'copy' => 'Duplicated a file',
            'file_shared' => 'Shared a file',
            'file_unshared' => 'Revoked a file share',
            'share_accessed' => 'Accessed a shared file',
            'folder_created' => 'Created a folder',
            'folder_renamed' => 'Renamed a folder',
            'folder_deleted' => 'Deleted a folder',
            'password_changed' => 'Changed password',
            'password_reset_requested' => 'Requested password reset',
            'password_reset_complete' => 'Completed password reset',
            'password_reset_security_questions_offered' => 'Started password reset (security questions)',
            'password_reset_security_questions_verified' => 'Verified security questions',
            'password_reset_security_questions_failed' => 'Failed security question verification',
            'password_reset_security_questions_initiated' => 'Initiated password reset via security questions',
            'password_reset_no_security_questions' => 'Password reset blocked — no security questions',
            'password_reset_token_tampered' => 'Password reset — tampered token detected',
            '2fa_enabled' => 'Enabled two-factor authentication',
            '2fa_disabled' => 'Disabled two-factor authentication',
            '2fa_challenge_passed' => 'Passed 2FA challenge',
            '2fa_challenge_failed' => 'Failed 2FA challenge',
            '2fa_recovery_used' => 'Used a 2FA recovery code',
            'profile_updated' => 'Updated profile',
            'avatar_updated' => 'Updated profile avatar',
            'account_deleted' => 'Deleted account',
            'recovery_kit_downloaded' => 'Downloaded recovery kit',
            'admin_file_permanently_deleted' => '[Admin] Permanently deleted a file',
            'admin_folder_deleted' => '[Admin] Deleted a folder',
            'admin_share_revoked' => '[Admin] Revoked a share',
            'admin_tag_deleted' => '[Admin] Deleted a tag',
            'admin_dataroom_deleted' => '[Admin] Deleted a data room',
            'admin_notification_deleted' => '[Admin] Deleted a notification',
            'admin_banned_user' => '[Admin] Banned a user',
            'admin_unbanned_user' => '[Admin] Unbanned a user',
            'admin_updated_user' => '[Admin] Updated a user',
            'admin_settings_updated' => '[Admin] Updated system settings',
        ];

        return $descriptions[$this->action] ?? $this->action;
    }
}
