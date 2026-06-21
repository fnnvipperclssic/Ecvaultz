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

    public static function log(int|string|null $userId, string $action, ?string $ip = null, ?string $userAgent = null, array $metadata = []): self
    {
        return static::create([
            'user_id' => $userId,
            'action' => $action,
            'ip_address' => $ip ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}
