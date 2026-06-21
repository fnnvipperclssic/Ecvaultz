<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Simple key-value store for system-wide settings.
 *
 * Settings are cached indefinitely and flushed when updated.
 */
class SystemSetting extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'key',
        'value',
        'updated_at',
    ];

    protected $casts = [
        'updated_at' => 'datetime',
    ];

    /**
     * Get a system setting by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever('system_setting_' . $key, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Set a system setting by key.
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'updated_at' => now()]
        );

        Cache::forget('system_setting_' . $key);
    }

    /**
     * Get all settings as key-value array.
     */
    public static function getAll(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}
