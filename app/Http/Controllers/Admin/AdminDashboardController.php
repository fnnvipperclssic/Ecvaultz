<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\File;
use App\Models\FileShare;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $stats = Cache::remember('admin_dashboard_stats', 300, function () {
            return [
                'totalUsers' => User::count(),
                'activeUsers' => User::whereNull('deleted_at')->count(),
                'deletedUsers' => User::onlyTrashed()->count(),
                'totalFiles' => File::count(),
                'trashedFiles' => File::onlyTrashed()->count(),
                'totalStorage' => $this->formatStorage(File::sum('size')),
                'totalShares' => FileShare::count(),
                'activeShares' => FileShare::where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })->count(),
                'recentRegistrations' => User::latest()->take(5)->get()->map(fn ($u) => [
                    'name' => $u->name,
                    'email' => $u->email,
                    'created_at' => $u->created_at->diffForHumans(),
                ]),
                'topUploaders' => User::withSum('files', 'size')
                    ->orderByDesc('files_sum_size')
                    ->take(5)
                    ->get()
                    ->map(fn ($u) => [
                        'name' => $u->name,
                        'files_count' => $u->files()->count(),
                        'storage_used' => $this->formatStorage($u->files_sum_size ?? 0),
                    ]),
                'recentActivity' => ActivityLog::with('user')
                    ->latest('created_at')
                    ->take(10)
                    ->get()
                    ->map(fn ($log) => [
                        'action' => $log->action,
                        'user_name' => $log->user?->name ?? 'System',
                        'created_at' => $log->created_at->diffForHumans(),
                    ]),
            ];
        });

        return Inertia::render('Admin/Dashboard', ['stats' => $stats]);
    }

    protected function formatStorage(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $size = $bytes;
        $unit = 0;
        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }
        return round($size, 2) . ' ' . $units[$unit];
    }
}
