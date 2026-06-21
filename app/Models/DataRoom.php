<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Virtual Data Room (VDR) model.
 *
 * Data Rooms are secure environments where files can be organized and
 * shared with external parties via controlled access (invites with access codes).
 */
class DataRoom extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'name',
        'description',
        'logo_path',
        'primary_color',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'id' => 'string',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (DataRoom $room) {
            if (empty($room->id)) {
                $room->id = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): BelongsToMany
    {
        return $this->belongsToMany(File::class, 'data_room_files', 'data_room_id', 'file_uuid', 'id', 'uuid')
            ->withPivot('added_at')
            ->orderByPivot('added_at', 'desc');
    }

    public function invites(): HasMany
    {
        return $this->hasMany(DataRoomInvite::class, 'data_room_id', 'id');
    }

    /**
     * Scope: only active rooms.
     */
    public function scopeActive($query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Scope: only rooms that have not expired.
     */
    public function scopeNotExpired($query): void
    {
        $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Check if the room has expired.
     */
    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }

        return $this->expires_at->isPast();
    }
}
