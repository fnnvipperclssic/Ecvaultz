<?php

/**
 * Dashboard Controller — User Dashboard dengan Activity Monitoring
 *
 * Menampilkan ringkasan aktivitas user termasuk:
 * - Statistik file (total, size, favorited, trashed)
 * - File terbaru yang diupload
 * - Aktivitas terakhir (10 log terbaru) — OWASP A09
 * - Riwayat login (5 login terakhir) — OWASP A09
 * - Status keamanan akun (2FA, security questions, password age)
 *
 * OWASP A09 (Security Logging & Monitoring):
 * - User dapat memonitor aktivitas akunnya sendiri
 * - Deteksi dini aktivitas mencurigakan
 *
 * @package App\Http\Controllers
 * @security OWASP A09 — Self-service activity monitoring
 */

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\ActivityLog;
use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan dashboard user dengan statistik dan monitoring.
     *
     * Data di-cache 5 menit untuk performa.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $cacheKey = 'user_dashboard_' . $user->id;

        $data = Cache::remember($cacheKey, config('security.cache.ttl_files', 300), function () use ($user) {
            // File statistics
            $totalFiles = File::where('user_id', $user->id)->count();
            $totalSize = File::where('user_id', $user->id)->sum('size');
            $trashedFiles = File::onlyTrashed()->where('user_id', $user->id)->count();
            $sharedWithMe = $user->sharedWithMe()->whereHas('file')->count();

            $recentFiles = File::where('user_id', $user->id)
                ->latest('uploaded_at')
                ->take(5)
                ->get()
                ->map(fn ($f) => [
                    'uuid' => $f->uuid,
                    'name' => $f->original_name,
                    'size' => $f->getSizeForHumans(),
                    'type' => $f->mime_type,
                    'date' => $f->uploaded_at->diffForHumans(),
                ]);

            $favoriteCount = File::where('user_id', $user->id)
                ->where('is_favorited', true)
                ->count();

            $sharedFilesCount = $user->sharedByMe()
                ->whereHas('file')
                ->count();

            $storageUsed = (int) File::where('user_id', $user->id)
                ->whereNull('deleted_at')
                ->sum('size');

            $storageQuota = $user->storage_quota ?? config('security.default_storage_quota', 5368709120);

            // === OWASP A09: Activity Monitoring ===
            // 10 aktivitas terakhir user
            $recentActivity = ActivityLog::where('user_id', $user->id)
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($log) => [
                    'action' => $log->action,
                    'description' => $log->getActionDescription(),
                    'ip_address' => $log->ip_address,
                    'date' => $log->created_at->diffForHumans(),
                    'created_at' => $log->created_at,
                    'metadata' => $log->metadata,
                ]);

            // 5 login terakhir (berhasil saja)
            $recentLogins = LoginAttempt::where('user_id', $user->id)
                ->where('success', true)
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($login) => [
                    'ip_address' => $login->ip_address,
                    'date' => $login->created_at->diffForHumans(),
                    'created_at' => $login->created_at,
                ]);

            // === Security Status ===
            $securityStatus = [
                'two_factor_enabled' => $user->hasTwoFactorEnabled(),
                'has_security_questions' => $user->securityQuestions()->count() >= 2,
                'email_verified' => $user->hasVerifiedEmail(),
                'password_age_days' => $user->password_changed_at
                    ? (int) $user->password_changed_at->diffInDays(now())
                    : 999,
                'last_login_at' => $user->last_login_at,
                'last_login_ip' => $user->last_login_ip,
            ];

            return [
                'totalFiles' => $totalFiles,
                'totalSize' => round($totalSize / 1024 / 1024 / 1024, 2),
                'trashedFiles' => $trashedFiles,
                'sharedWithMe' => $sharedWithMe,
                'recentFiles' => $recentFiles,
                'favoriteCount' => $favoriteCount,
                'sharedFilesCount' => $sharedFilesCount,
                'storageUsed' => $storageUsed,
                'storageQuota' => (int) $storageQuota,
                'recentActivity' => $recentActivity,
                'recentLogins' => $recentLogins,
                'securityStatus' => $securityStatus,
            ];
        });

        return Inertia::render('Dashboard', $data);
    }
}
