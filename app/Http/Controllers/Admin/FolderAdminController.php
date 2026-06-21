<?php

/**
 * Admin Folder Controller — Manajemen Folder untuk Administrator
 *
 * Menyediakan operasi CRUD administratif untuk tabel `folders`.
 * Admin dapat melihat dan menghapus folder dari semua user.
 *
 * @package App\Http\Controllers\Admin
 * @security OWASP A01 — Admin-only access via permission middleware
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FolderAdminController extends Controller
{
    /**
     * Daftar semua folder dengan informasi user pemilik.
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['name', 'created_at', 'updated_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query = Folder::with(['user:id,name,email', 'parent:id,uuid,name'])
            ->withCount(['files', 'children']);

        if ($search = $request->get('search')) {
            $escaped = addcslashes($search, '%_');
            $query->where('name', 'LIKE', "%{$escaped}%");
        }

        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        $folders = $query->orderBy($sort, $order)->paginate(25)->withQueryString();

        return Inertia::render('Admin/Folders/Index', [
            'folders' => $folders,
            'filters' => (object) $request->only(['search', 'user_id', 'sort', 'order']),
            'stats' => [
                'total_folders' => Folder::count(),
                'root_folders' => Folder::whereNull('parent_id')->count(),
            ],
        ]);
    }

    /**
     * Hapus folder — admin bisa force delete folder beserta isinya.
     */
    public function destroy(Request $request, Folder $folder): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'current_password'],
        ]);

        $folderName = $folder->name;
        $folderUuid = $folder->uuid;

        // Delete child folders dan files
        $folder->files()->delete();
        $folder->children()->delete();
        $folder->forceDelete();

        ActivityLog::log(
            $request->user()->id,
            'admin_folder_deleted',
            $request->ip(),
            $request->userAgent(),
            ['folder_uuid' => $folderUuid, 'folder_name' => $folderName]
        );

        return redirect()->route('admin.folders.index')->with('success', "Folder \"{$folderName}\" deleted.");
    }
}
