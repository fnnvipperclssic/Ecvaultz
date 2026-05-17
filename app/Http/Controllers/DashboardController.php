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

            return [
                'totalFiles' => $totalFiles,
                'totalSize' => round($totalSize / 1024 / 1024 / 1024, 2),
                'trashedFiles' => $trashedFiles,
                'sharedWithMe' => $sharedWithMe,
                'recentFiles' => $recentFiles,
            ];
        });

        return Inertia::render('Dashboard', $data);
    }
}
