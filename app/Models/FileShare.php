<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class FileShare extends Model
{
    protected $fillable = [
        'uuid',
        'file_id',
        'shared_by_user_id',
        'shared_with_user_id',
        'type',
        'permission',
        'external_email',
        'share_link_token',
        'share_link_password',
        'expires_at',
        'last_accessed_at',
        'access_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'access_count' => 'integer',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (FileShare $share) {
            if (empty($share->uuid)) {
                $share->uuid = (string) Str::uuid();
            }
            if ($share->type === 'external' && empty($share->share_link_token)) {
                $share->share_link_token = Str::random(64);
            }
        });
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }

    public function sharedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_by_user_id');
    }

    public function sharedWith(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_with_user_id');
    }

    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }
        return $this->expires_at->isPast();
    }

    public function isActive(): bool
    {
        return !$this->isExpired();
    }

    public function recordAccess(): void
    {
        $this->increment('access_count');
        $this->forceFill(['last_accessed_at' => now()])->save();
    }
}
