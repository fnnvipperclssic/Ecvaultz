<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Invitation to access a Virtual Data Room.
 *
 * Each invite targets a specific email and optionally has an access code
 * for additional security. Access is tracked via last_accessed_at and
 * access_count.
 */
class DataRoomInvite extends Model
{
    protected $fillable = [
        'data_room_id',
        'email',
        'access_code',
        'expires_at',
        'last_accessed_at',
        'access_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'access_count' => 'integer',
    ];

    public function dataRoom(): BelongsTo
    {
        return $this->belongsTo(DataRoom::class, 'data_room_id', 'id');
    }

    /**
     * Check if this invite has expired.
     */
    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }

        return $this->expires_at->isPast();
    }

    /**
     * Record an access event for this invite.
     */
    public function recordAccess(): void
    {
        $this->increment('access_count');
        $this->forceFill(['last_accessed_at' => now()])->save();
    }
}
