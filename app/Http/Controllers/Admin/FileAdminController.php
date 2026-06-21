<?php

/**
 * Admin File Controller — Manajemen File untuk Administrator
 *
 * Menyediakan operasi CRUD administratif untuk tabel `files`.
 * Admin dapat melihat, mencari, dan menghapus file dari semua user.
 *
 * OWASP Security:
 * - A01 (Access Control): Hanya role Admin yang bisa akses (middleware permission:admin.access)
 * - A03 (Injection): Sort column whitelist + LIKE escaping untuk search
 * - A09 (Logging): Semua action destructive di-log via ActivityLog
 *
 * @package App\Http\Controllers\Admin
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FileAdminController extends Controller
{
    /**
     * Daftar semua file (paginated) dengan search dan filter.
     *
     * @security Sort column whitelist mencegah SQL injection
     * @security LIKE wildcard di-escape dengan addcslashes
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['original_name', 'size', 'mime_type', 'download_count', 'created_at', 'updated_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query = File::with(['user:id,name,email', 'folder:id,uuid,name'])
            ->withTrashed();

        // Search: filter by original name
        if ($search = $request->get('search')) {
            $escaped = addcslashes($search, '%_');
            $query->where('original_name', 'LIKE', "%{$escaped}%");
        }

        // Filter: by user
        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        // Filter: by mime type category
        if ($mimeType = $request->get('mime_type')) {
            $query->where('mime_type', 'LIKE', $mimeType . '%');
        }

        // Filter: trashed only
        if ($request->get('trashed') === 'only') {
            $query->onlyTrashed();
        }

        $files = $query->orderBy($sort, $order)->paginate(25)->withQueryString();

        // Kalkulasi total storage
        $totalSize = File::sum('size');
        $totalFiles = File::count();
        $trashedFiles = File::onlyTrashed()->count();

        return Inertia::render('Admin/Files/Index', [
            'files' => $files,
            'filters' => (object) $request->only(['search', 'user_id', 'mime_type', 'sort', 'order', 'trashed']),
            'stats' => [
                'total_files' => $totalFiles,
                'total_size' => $totalSize,
                'trashed_files' => $trashedFiles,
            ],
        ]);
    }

    /**
     * Detail file — menampilkan metadata lengkap, aktivitas, share, dan versi.
     */
    public function show(File $file): Response
    {
        // Gunakan UUID route model binding (default)
        $file->load([
            'user:id,name,email',
            'folder:id,uuid,name',
            'shares' => fn ($q) => $q->with(['sharedWith:id,name,email', 'sharedBy:id,name,email']),
            'versions' => fn ($q) => $q->orderBy('version_number', 'desc')->limit(10),
            'tags',
        ]);

        // Ambil activity log untuk file ini
        $activities = ActivityLog::where('file_uuid', $file->uuid)
            ->with('user:id,name,email')
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('Admin/Files/Show', [
            'file' => $file,
            'activities' => $activities,
        ]);
    }

    /**
     * Force delete file — menghapus permanen dari storage dan database.
     *
     * @security Memerlukan password confirmation untuk mencegah accidental deletion
     * @security Semua action destructive di-log
     */
    public function destroy(Request $request, File $file): RedirectResponse
    {
        // Password confirmation required untuk operasi destruktif
        $request->validate([
            'password' => ['required', 'string', 'current_password'],
        ]);

        $fileName = $file->original_name;
        $fileUuid = $file->uuid;

        // Hapus file fisik dari storage sebelum force delete
        if (\Illuminate\Support\Facades\Storage::disk('private')->exists($file->path)) {
            \Illuminate\Support\Facades\Storage::disk('private')->delete($file->path);
        }

        // Force delete (permanen)
        $file->forceDelete();

        ActivityLog::log(
            $request->user()->id,
            'admin_file_permanently_deleted',
            $request->ip(),
            $request->userAgent(),
            [
                'file_uuid' => $fileUuid,
                'file_name' => $fileName,
            ]
        );

        return redirect()->route('admin.files.index')->with(
            'success',
            "File \"{$fileName}\" has been permanently deleted."
        );
    }
}
