<?php

/**
 * Admin Share Controller — Manajemen File Share untuk Administrator
 *
 * Menyediakan visibilitas dan kontrol administratif untuk tabel `file_shares`.
 * Admin dapat melihat semua share yang terjadi di sistem dan merevoke
 * share yang mencurigakan.
 *
 * @package App\Http\Controllers\Admin
 * @security OWASP A01/A09 — Admin-only + audit logging
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FileShare;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShareAdminController extends Controller
{
    /**
     * Daftar semua file share dengan relasi lengkap.
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['type', 'permission', 'expires_at', 'access_count', 'created_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query = FileShare::with([
            'file:id,uuid,original_name',
            'sharedBy:id,name,email',
            'sharedWith:id,name,email',
        ]);

        if ($search = $request->get('search')) {
            $escaped = addcslashes($search, '%_');
            $query->where(function ($q) use ($escaped) {
                $q->where('external_email', 'LIKE', "%{$escaped}%")
                  ->orWhereHas('sharedBy', fn ($u) => $u->where('name', 'LIKE', "%{$escaped}%"))
                  ->orWhereHas('file', fn ($f) => $f->where('original_name', 'LIKE', "%{$escaped}%"));
            });
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type); // 'internal' or 'external'
        }

        $shares = $query->orderBy($sort, $order)->paginate(25)->withQueryString();

        return Inertia::render('Admin/Shares/Index', [
            'shares' => $shares,
            'filters' => (object) $request->only(['search', 'type', 'sort', 'order']),
            'stats' => [
                'total_shares' => FileShare::count(),
                'internal_shares' => FileShare::where('type', 'internal')->count(),
                'external_shares' => FileShare::where('type', 'external')->count(),
            ],
        ]);
    }

    /**
     * Revoke share — hapus akses sharing.
     */
    public function destroy(Request $request, FileShare $share): RedirectResponse
    {
        $shareUuid = $share->uuid;
        $share->delete();

        ActivityLog::log(
            $request->user()->id,
            'admin_share_revoked',
            $request->ip(),
            $request->userAgent(),
            ['share_uuid' => $shareUuid]
        );

        return redirect()->route('admin.shares.index')->with('success', 'Share has been revoked.');
    }
}
