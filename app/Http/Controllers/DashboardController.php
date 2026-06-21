<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $cacheKey = 'user_dashboard_' . $user->id;

        $data = Cache::remember($cacheKey, config('security.cache.ttl_files', 300), function () use ($user) {
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

            // Compute additional dashboard metrics
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
            ];
        });

        return Inertia::render('Dashboard', $data);
    }
}
