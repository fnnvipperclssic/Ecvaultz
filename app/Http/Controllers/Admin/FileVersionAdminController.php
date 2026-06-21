<?php

/**
 * Admin File Version Controller — Riwayat Versi File
 *
 * Menyediakan visibilitas administratif ke tabel `file_versions`.
 * Admin dapat melihat riwayat versi semua file di sistem.
 *
 * @package App\Http\Controllers\Admin
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FileVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FileVersionAdminController extends Controller
{
    /**
     * Daftar semua versi file dengan filter.
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['version_number', 'size', 'created_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query = FileVersion::with([
            'file:id,uuid,original_name',
            'user:id,name,email',
        ]);

        if ($search = $request->get('search')) {
            $escaped = addcslashes($search, '%_');
            $query->where(function ($q) use ($escaped) {
                $q->where('original_name', 'LIKE', "%{$escaped}%")
                  ->orWhereHas('file', fn ($f) => $f->where('original_name', 'LIKE', "%{$escaped}%"))
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'LIKE', "%{$escaped}%"));
            });
        }

        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        $versions = $query->orderBy($sort, $order)->paginate(25)->withQueryString();

        return Inertia::render('Admin/FileVersions/Index', [
            'versions' => $versions,
            'filters' => $request->only(['search', 'user_id', 'sort', 'order']),
            'stats' => [
                'total_versions' => FileVersion::count(),
                'total_size' => FileVersion::sum('size'),
                'unique_files' => FileVersion::distinct('file_id')->count('file_id'),
            ],
        ]);
    }
}
