<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use App\Services\FileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            ->when($folderId, fn ($q) => $q->where('folder_id', $folderId))
            ->when(!$folderId, fn ($q) => $q->whereNull('folder_id'));

        // Search
        if ($request->has('search')) {
            $query->where('original_name', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sort = $request->input('sort', 'uploaded_at');
        $direction = $request->input('direction', 'desc');
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
            'download_count' => $file->download_count,
            'uploaded_at' => $file->uploaded_at->format('Y-m-d H:i'),
            'uploaded_at_human' => $file->uploaded_at->diffForHumans(),
            'can_preview' => $file->isPreviewable(),
            'extension' => $file->getExtension(),
        ]);

        $folders = Folder::where('user_id', $user->id)
            ->when($folderId, fn ($q) => $q->where('parent_id', $folderId))
            ->when(!$folderId, fn ($q) => $q->whereNull('parent_id'))
            ->get()
            ->map(fn ($f) => [
                'uuid' => $f->uuid,
                'name' => $f->name,
                'file_count' => $f->files()->count(),
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
            ]);
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
        $base64Content = base64_encode(file_get_contents($filePath));

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

        $folderId = $request->folder_id
            ? Folder::where('uuid', $request->folder_id)->firstOrFail()->id
            : null;

        $file->folder_id = $folderId;
        $file->save();

        return back()->with('success', 'File moved.');
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
