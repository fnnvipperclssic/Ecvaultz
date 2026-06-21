<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Represents an uploaded file stored on the private disk.
 *
 * Files are encrypted at rest with AES-256-GCM using a per-user encryption key.
 * Public identifiers use UUIDs to prevent enumeration attacks.
 * Soft-deleted files remain recoverable for 30 days (configurable).
 */
class File extends Model
{
    use SoftDeletes;

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
        'folder_id',
        'original_name',
        'stored_name',
        'mime_type',
        'size',
        'path',
        'is_encrypted',
        'checksum_sha256',
        'download_count',
        'uploaded_at',
        'is_favorited',
        'description',
        'expires_at',
        'last_accessed_at',
    ];

    protected $casts = [
        'size' => 'integer',
        'is_encrypted' => 'boolean',
        'is_favorited' => 'boolean',
        'download_count' => 'integer',
        'uploaded_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (File $file) {
            if (empty($file->uuid)) {
                $file->uuid = (string) Str::uuid();
            }
            if (empty($file->uploaded_at)) {
                $file->uploaded_at = now();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(FileShare::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(FileVersion::class)->orderBy('version_number', 'desc');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'file_tag', 'file_uuid', 'tag_id', 'uuid', 'id');
    }

    public function scopeFavorited($query): void
    {
        $query->where('is_favorited', true);
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function isSharedWith(User $user, string $permission = 'read'): bool
    {
        return $this->shares()
            ->where('shared_with_user_id', $user->id)
            ->where('permission', $permission)
            ->exists();
    }

    public function canBeAccessedBy(User $user): bool
    {
        if ($this->isOwnedBy($user)) {
            return true;
        }

        return $this->shares()
            ->where('shared_with_user_id', $user->id)
            ->exists();
    }

    public function getSizeForHumans(): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $size = $this->size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    public function isInTrash(): bool
    {
        return $this->trashed();
    }

    public function getExtension(): string
    {
        return strtolower(pathinfo($this->original_name, PATHINFO_EXTENSION));
    }

    public function isPreviewable(): bool
    {
        return in_array($this->getExtension(), ['pdf', 'jpg', 'jpeg', 'png']);
    }
}
