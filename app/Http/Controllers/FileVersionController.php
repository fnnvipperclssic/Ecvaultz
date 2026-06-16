<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\FileVersion;
use App\Services\FileVersionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FileVersionController extends Controller
{
    protected FileVersionService $versionService;

    public function __construct(FileVersionService $versionService)
    {
        $this->versionService = $versionService;
    }

    /**
     * Show version history for a file.
     */
    public function index(Request $request, string $uuid): Response
    {
        $file = File::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('view', $file)) {
            abort(403);
        }

        $versions = $file->versions()
            ->with('user')
            ->get()
            ->map(fn (FileVersion $v) => [
                'id' => $v->id,
                'version_number' => $v->version_number,
                'size_human' => $v->getSizeForHumans(),
                'user_name' => $v->user?->name ?? 'Unknown',
                'created_at' => $v->created_at->format('Y-m-d H:i'),
                'created_at_human' => $v->created_at->diffForHumans(),
            ]);

        return Inertia::render('Files/VersionHistory', [
            'file' => [
                'uuid' => $file->uuid,
                'name' => $file->original_name,
            ],
            'versions' => $versions,
        ]);
    }

    /**
     * Restore a file to a previous version.
     */
    public function restore(Request $request, FileVersion $version): RedirectResponse
    {
        $file = $version->file;

        if (!Gate::allows('update', $file)) {
            abort(403);
        }

        $this->versionService->restoreVersion($version, $request->user());

        return back()->with('success', 'File restored to version ' . $version->version_number . '.');
    }
}
