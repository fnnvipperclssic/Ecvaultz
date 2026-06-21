<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings', [
            'settings' => [
                'max_upload_size' => config('security.max_upload_size'),
                'upload_rate_limit' => config('security.upload_rate_limit'),
                'download_rate_limit' => config('security.download_rate_limit'),
                'allowed_extensions' => config('security.allowed_extensions'),
                'password_min_length' => config('security.password.min_length'),
                'password_expiry_days' => config('security.password.expiry_days'),
                'account_lockout_threshold' => config('security.lockout.threshold'),
                'account_lockout_minutes' => config('security.lockout.minutes'),
                'two_factor_required' => config('auth.two_factor.required'),
                'soft_delete_retention_days' => config('security.soft_delete_retention_days'),
                'session_lifetime' => config('session.lifetime'),
                'session_idle_timeout' => config('security.session.idle_timeout'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        // Only allow updating certain settings
        $validated = $request->validate([
            'max_upload_size' => ['integer', 'min:1048576', 'max:1073741824'],
            'upload_rate_limit' => ['integer', 'min:1', 'max:100'],
            'download_rate_limit' => ['integer', 'min:1', 'max:100'],
            'password_min_length' => ['integer', 'min:8', 'max:64'],
            'password_expiry_days' => ['integer', 'min:0', 'max:365'],
            'account_lockout_threshold' => ['integer', 'min:1', 'max:20'],
            'account_lockout_minutes' => ['integer', 'min:1', 'max:1440'],
            'two_factor_required' => ['boolean'],
            'soft_delete_retention_days' => ['integer', 'min:1', 'max:365'],
        ]);

        // Persist each setting to the system_settings table
        foreach ($validated as $key => $value) {
            SystemSetting::set($key, is_bool($value) ? ($value ? '1' : '0') : (string) $value);
        }

        // Clear config cache so settings take effect
        if (app()->environment('production')) {
            Artisan::call('config:clear');
        }

        ActivityLog::log($request->user()->id, 'admin_updated_settings', $request->ip(), $request->userAgent(), [
            'settings' => array_keys($validated),
        ]);

        return back()->with('success', 'Settings updated successfully.');
    }
}
