<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

/**
 * User-defined tags for organizing files.
 *
 * Tags are per-user and have a unique name constraint per user.
 * The pivot table `file_tag` links tags to files via file UUID.
 */
class Tag extends Model
{
    /**
     * Get the route key for the model by UUID instead of auto-increment ID.
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    protected $fillable = [
        'uuid',
        'user_id',
        'name',
        'color',
    ];

    protected $casts = [
        'color' => 'string',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Tag $tag) {
            if (empty($tag->uuid)) {
                $tag->uuid = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): BelongsToMany
    {
        return $this->belongsToMany(File::class, 'file_tag', 'tag_id', 'file_uuid', 'id', 'uuid')
            ->withTimestamps();
    }

    /**
     * Get the file count for this tag.
     */
    public function getFileCountAttribute(): int
    {
        return $this->files()->count();
    }
}
