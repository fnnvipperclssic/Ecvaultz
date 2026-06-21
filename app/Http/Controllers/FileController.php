<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use App\Models\ActivityLog;
use App\Services\FileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Primary file management controller.
 *
 * Covers the full file lifecycle: upload (with encryption + virus scanning),
 * download (with on-the-fly decryption + integrity check), preview, rename,
 * move between folders, soft-delete/restore, permanent delete, and bulk operations.
 * All destructive actions require password confirmation or Gate authorization.
 */
class FileController extends Controller
{
    protected FileService $fileService;

    public function __construct(FileService $fileService)
    {
        $this->fileService = $fileService;
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $folderId = $request->input('folder_id');

        $query = File::where('user_id', $user->id)
            ->with('folder')
            ->withCount('tags')
            ->when($folderId, fn ($q) => $q->where('folder_id', $folderId))
            ->when(!$folderId, fn ($q) => $q->whereNull('folder_id'));

        // Filter: favorites only
        if ($request->input('filter') === 'favorites') {
            $query->favorited();
        }

        // Search (escape LIKE wildcards to prevent injection)
        if ($request->has('search')) {
            $escaped = addcslashes($request->search, '%_');
            $query->where('original_name', 'like', '%' . $escaped . '%');
        }

        // Sort (whitelist allowed columns to prevent SQL column injection)
        $allowedSorts = ['original_name', 'size', 'mime_type', 'uploaded_at', 'download_count', 'created_at'];
        $sort = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'uploaded_at';
        $direction = in_array(strtolower($request->input('direction', 'desc')), ['asc', 'desc']) ? $request->input('direction', 'desc') : 'desc';
        $query->orderBy($sort, $direction);

        $files = $query->paginate(20)->through(fn (File $file) => [
            'uuid' => $file->uuid,
            'name' => $file->original_name,
            'stored_name' => $file->stored_name,
            'mime_type' => $file->mime_type,
            'size' => $file->getSizeForHumans(),
            'size_bytes' => $file->size,
            'folder_id' => $file->folder_id,
            'folder_name' => $file->folder?->name,
            'is_encrypted' => $file->is_encrypted,
            'is_favorited' => $file->is_favorited,
            'download_count' => $file->download_count,
            'uploaded_at' => $file->uploaded_at?->format('Y-m-d H:i'),
            'uploaded_at_human' => $file->uploaded_at?->diffForHumans(),
            'can_preview' => $file->isPreviewable(),
            'extension' => $file->getExtension(),
            'tags_count' => $file->tags_count,
            'expires_at' => $file->expires_at?->format('Y-m-d H:i'),
            'description' => $file->description,
        ]);

        $folders = Folder::where('user_id', $user->id)
            ->when($folderId, fn ($q) => $q->where('parent_id', $folderId))
            ->when(!$folderId, fn ($q) => $q->whereNull('parent_id'))
            ->withCount('files')
            ->get()
            ->map(fn ($f) => [
                'uuid' => $f->uuid,
                'name' => $f->name,
                'file_count' => $f->files_count,
            ]);

        $breadcrumbs = $this->buildBreadcrumbs($folderId ? Folder::find($folderId) : null);

        return Inertia::render('Files/Index', [
            'files' => $files,
            'folders' => $folders,
            'breadcrumbs' => $breadcrumbs,
            'currentFolderId' => $folderId,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'files.*' => ['required', 'file', 'max:' . (config('security.max_upload_size', 52428800) / 1024)],
            'folder_id' => ['nullable', 'uuid', 'exists:folders,uuid'],
        ]);

        $user = $request->user();
        $folderId = null;

        if ($request->folder_id) {
            $folder = Folder::where('uuid', $request->folder_id)->firstOrFail();
            Gate::authorize('view', $folder);
            $folderId = $folder->id;
        }

        $uploaded = [];
        foreach ($request->file('files', []) as $uploadedFile) {
            $file = $this->fileService->upload($user, $uploadedFile, $folderId);
            $uploaded[] = $file->uuid;
        }

        return back()->with('success', count($uploaded) . ' file(s) uploaded successfully.');
    }

    public function download(Request $request, string $uuid): StreamedResponse|RedirectResponse
    {
        $file = File::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('download', $file)) {
            abort(403, 'You do not have permission to download this file.');
        }

        try {
            $data = $this->fileService->download($request->user(), $file);
            return response()->download($data['path'], $data['name'], [
                'Content-Type' => $data['mime'],
                'X-Content-Type-Options' => 'nosniff',
            ])->deleteFileAfterSend(true);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function preview(Request $request, string $uuid): Response|RedirectResponse
    {
        $file = File::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('view', $file)) {
            abort(403);
        }

        if (!$file->isPreviewable()) {
            return back()->with('error', 'This file type cannot be previewed.');
        }

        $filePath = Storage::disk('private')->path($file->path);

        // Decrypt file for preview using file owner's encryption key
        // (shared files must use the owner's key, not the viewer's)
        $encryptionService = app(\App\Services\FileEncryptionService::class);
        $userKey = $encryptionService->getUserKey($file->user);
        try {
            $plaintext = $encryptionService->decryptFile($filePath, $userKey);
            $base64Content = base64_encode($plaintext);
        } catch (\RuntimeException $e) {
            return back()->with('error', 'File preview failed. Please download instead.');
        }

        return Inertia::render('Files/Preview', [
            'file' => [
                'uuid' => $file->uuid,
                'name' => $file->original_name,
                'mime_type' => $file->mime_type,
                'size' => $file->getSizeForHumans(),
                'content' => 'data:' . $file->mime_type . ';base64,' . $base64Content,
            ],
        ]);
    }

    public function trash(Request $request): Response
    {
        $user = $request->user();

        $files = File::onlyTrashed()
            ->where('user_id', $user->id)
            ->latest('deleted_at')
            ->paginate(20)
            ->through(fn (File $file) => [
                'uuid' => $file->uuid,
                'name' => $file->original_name,
                'size' => $file->getSizeForHumans(),
                'deleted_at' => $file->deleted_at->format('Y-m-d H:i'),
                'deleted_at_human' => $file->deleted_at->diffForHumans(),
                'days_until_permanent' => max(0, config('security.soft_delete_retention_days', 30) - $file->deleted_at->diffInDays(now())),
            ]);

        return Inertia::render('Trash', [
            'files' => $files,
            'retentionDays' => config('security.soft_delete_retention_days', 30),
        ]);
    }

    public function destroy(Request $request, string $uuid): RedirectResponse
    {
        $file = File::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('delete', $file)) {
            abort(403);
        }

        $this->fileService->softDelete($request->user(), $file);

        return back()->with('success', 'File moved to trash.');
    }

    public function restore(Request $request, string $uuid): RedirectResponse
    {
        $file = File::onlyTrashed()->where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('restore', $file)) {
            abort(403);
        }

        $this->fileService->restore($request->user(), $file);

        return redirect()->route('files.index')->with('success', 'File restored successfully.');
    }

    public function forceDelete(Request $request, string $uuid): RedirectResponse
    {
        $file = File::withTrashed()->where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('forceDelete', $file)) {
            abort(403);
        }

        // Require password confirmation for permanent deletion
        if (!Hash::check($request->input('password'), $request->user()->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        $this->fileService->permanentDelete($request->user(), $file);

        return back()->with('success', 'File permanently deleted.');
    }

    public function bulkAction(Request $request): RedirectResponse
    {
        $request->validate([
            'file_uuids' => ['required', 'array', 'max:' . config('security.max_bulk_delete', 100)],
            'file_uuids.*' => ['required', 'string', 'uuid'],
            'action' => ['required', 'in:delete,restore,permanent_delete'],
        ]);

        $user = $request->user();
        $uuids = $request->input('file_uuids');

        // Require confirmation for bulk operations over threshold
        if (count($uuids) > config('security.confirmation_bulk_delete_threshold', 10)) {
            if (!Hash::check($request->input('password', ''), $user->password)) {
                return back()->withErrors(['password' => 'Password confirmation required for bulk operations.']);
            }
        }

        match ($request->input('action')) {
            'delete' => $this->fileService->bulkDelete($user, $uuids, false),
            'permanent_delete' => $this->fileService->bulkDelete($user, $uuids, true),
            'restore' => File::onlyTrashed()
                ->whereIn('uuid', $uuids)
                ->where('user_id', $user->id)
                ->each(fn ($f) => $this->fileService->restore($user, $f)),
        };

        return back()->with('success', 'Bulk action completed successfully.');
    }

    public function rename(Request $request, string $uuid): RedirectResponse
    {
        $file = File::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('update', $file)) {
            abort(403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-_\'.]+$/'],
        ]);

        $file->original_name = $request->input('name');
        $file->save();

        return back()->with('success', 'File renamed.');
    }

    public function move(Request $request, string $uuid): RedirectResponse
    {
        $file = File::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('update', $file)) {
            abort(403);
        }

        $request->validate([
            'folder_id' => ['nullable', 'string', 'exists:folders,uuid'],
        ]);

        $folderId = null;
        if ($request->folder_id) {
            $targetFolder = Folder::where('uuid', $request->folder_id)->firstOrFail();
            // Verify target folder belongs to the user
            if (!Gate::allows('view', $targetFolder)) {
                abort(403, 'You do not have permission to move files to this folder.');
            }
            $folderId = $targetFolder->id;
        }

        $file->folder_id = $folderId;
        $file->save();

        return back()->with('success', 'File moved.');
    }

    /**
     * Global file search across all user folders.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $user = $request->user();
        $query = $request->input('q');
        $escaped = addcslashes($query, '%_');

        $files = File::where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->where('original_name', 'like', '%' . $escaped . '%')
            ->with('folder')
            ->orderBy('uploaded_at', 'desc')
            ->take(20)
            ->get()
            ->map(fn (File $file) => [
                'uuid' => $file->uuid,
                'name' => $file->original_name,
                'folder_path' => $file->folder?->name,
                'mime_type' => $file->mime_type,
                'size' => $file->getSizeForHumans(),
                'size_bytes' => $file->size,
                'uploaded_at' => $file->uploaded_at->format('Y-m-d H:i'),
                'extension' => $file->getExtension(),
                'is_favorited' => $file->is_favorited,
            ]);

        return response()->json(['files' => $files]);
    }

    /**
     * Toggle the favorite status of a file.
     */
    public function toggleFavorite(Request $request, File $file): JsonResponse
    {
        if (!Gate::allows('update', $file)) {
            abort(403);
        }

        $file->is_favorited = !$file->is_favorited;
        $file->save();

        ActivityLog::log($request->user()->id, $file->is_favorited ? 'file_favorited' : 'file_unfavorited', $request->ip(), $request->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
        ]);

        return response()->json([
            'success' => true,
            'is_favorited' => $file->is_favorited,
        ]);
    }

    /**
     * Duplicate a file.
     */
    public function duplicate(Request $request, File $file): RedirectResponse
    {
        if (!Gate::allows('view', $file)) {
            abort(403);
        }

        try {
            $newFile = $this->fileService->duplicateFile($request->user(), $file);
            return back()->with('success', 'File duplicated as "' . $newFile->original_name . '".');
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Empty the trash: permanently delete all soft-deleted files.
     */
    public function emptyTrash(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Require password confirmation
        if (!Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        $files = File::onlyTrashed()->where('user_id', $user->id)->get();
        $count = 0;

        foreach ($files as $file) {
            $this->fileService->permanentDelete($user, $file);
            $count++;
        }

        return redirect()->route('files.index')->with('success', "Trash emptied: {$count} file(s) permanently deleted.");
    }

    /**
     * Get activity logs for a specific file.
     */
    public function activity(Request $request, File $file): JsonResponse
    {
        if (!Gate::allows('view', $file)) {
            abort(403);
        }

        $logs = ActivityLog::forFile($file->uuid)
            ->where('user_id', $request->user()->id)
            ->latest('created_at')
            ->take(50)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'ip_address' => $log->ip_address,
                'metadata' => $log->metadata,
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $log->created_at->diffForHumans(),
            ]);

        return response()->json([
            'file_uuid' => $file->uuid,
            'file_name' => $file->original_name,
            'logs' => $logs,
        ]);
    }

    /**
     * Update a file's description.
     */
    public function updateDescription(Request $request, File $file): RedirectResponse
    {
        Gate::authorize('update', $file);

        $validated = $request->validate([
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $file->update(['description' => $validated['description'] ?? null]);

        ActivityLog::log($request->user()->id, 'file_description_updated', $request->ip(), $request->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
        ]);

        return back()->with('success', 'File description updated.');
    }

    /**
     * Update a file's expiry date.
     */
    public function updateExpiry(Request $request, File $file): RedirectResponse
    {
        Gate::authorize('update', $file);

        $validated = $request->validate([
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $file->update(['expires_at' => $validated['expires_at'] ?? null]);

        ActivityLog::log($request->user()->id, 'file_expiry_updated', $request->ip(), $request->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
            'expires_at' => $file->expires_at?->toIso8601String(),
        ]);

        return back()->with('success', 'File expiry updated.');
    }

    /**
     * Preview a file with dynamic watermarking for share link contexts.
     *
     * When a file is accessed via a share link (not the owner), a watermark
     * with viewer info is applied to the preview. Owners see the file without
     * watermarks. Results are cached for 5 minutes.
     */
    public function watermarkedPreview(Request $request, File $file): Response|RedirectResponse
    {
        if (!Gate::allows('view', $file)) {
            abort(403);
        }

        if (!$file->isPreviewable()) {
            return back()->with('error', 'This file type cannot be previewed.');
        }

        $user = $request->user();
        $isOwner = $file->isOwnedBy($user);
        $isShareContext = $request->has('share_token') || $request->session()->has('share_context_' . $file->uuid);

        // Decrypt file for preview using file owner's encryption key
        $encryptionService = app(\App\Services\FileEncryptionService::class);
        $userKey = $encryptionService->getUserKey($file->user);
        $filePath = \Illuminate\Support\Facades\Storage::disk('private')->path($file->path);

        try {
            $plaintext = $encryptionService->decryptFile($filePath, $userKey);
        } catch (\RuntimeException $e) {
            return back()->with('error', 'File preview failed. Please download instead.');
        }

        // Apply watermark if accessed via share context
        if ($isShareContext && !$isOwner) {
            $cacheKey = 'watermarked_preview_' . $file->uuid . '_' . md5($user?->id ?? $request->ip());

            $watermarked = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () use ($plaintext, $file, $request, $user) {
                $tempPath = tempnam(sys_get_temp_dir(), 'ecvaultz_wm_preview_');
                file_put_contents($tempPath, $plaintext);

                $watermarkService = app(\App\Services\WatermarkService::class);
                $watermarkedPath = $watermarkService->addWatermark(
                    $tempPath,
                    $file->mime_type,
                    [
                        'email' => $user?->email ?? 'share-link-user',
                        'timestamp' => now()->toIso8601String(),
                        'ip' => $request->ip(),
                    ]
                );

                $watermarked = file_get_contents($watermarkedPath);
                @unlink($tempPath);
                if ($watermarkedPath !== $tempPath) {
                    @unlink($watermarkedPath);
                }

                return base64_encode($watermarked);
            });

            $base64Content = $watermarked;
        } else {
            $base64Content = base64_encode($plaintext);
        }

        return Inertia::render('Files/Preview', [
            'file' => [
                'uuid' => $file->uuid,
                'name' => $file->original_name,
                'mime_type' => $file->mime_type,
                'size' => $file->getSizeForHumans(),
                'content' => 'data:' . $file->mime_type . ';base64,' . $base64Content,
                'is_watermarked' => ($isShareContext && !$isOwner),
            ],
        ]);
    }

    protected function buildBreadcrumbs(?Folder $folder): array
    {
        $breadcrumbs = [];
        $current = $folder;

        while ($current) {
            array_unshift($breadcrumbs, [
                'uuid' => $current->uuid,
                'name' => $current->name,
            ]);
            $current = $current->parent;
        }

        return $breadcrumbs;
    }
}
