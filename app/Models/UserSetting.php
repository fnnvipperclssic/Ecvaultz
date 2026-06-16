<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'key',
        'value',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function get(User $user, string $key, mixed $default = null): mixed
    {
        $setting = static::where('user_id', $user->id)->where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set(User $user, string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['user_id' => $user->id, 'key' => $key],
            ['value' => $value]
        );
    }

    public static function getAll(User $user): array
    {
        return static::where('user_id', $user->id)->pluck('value', 'key')->toArray();
    }
}
