<?php

/**
 * Admin Tag Controller — Manajemen Tag untuk Administrator
 *
 * Menyediakan operasi CRUD administratif untuk tabel `tags`.
 * Admin dapat melihat dan menghapus tag dari semua user.
 *
 * @package App\Http\Controllers\Admin
 * @security OWASP A01 — Admin-only access
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagAdminController extends Controller
{
    /**
     * Daftar semua tag dengan informasi user dan jumlah file.
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['name', 'color', 'created_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query = Tag::with(['user:id,name,email'])
            ->withCount('files');

        if ($search = $request->get('search')) {
            $escaped = addcslashes($search, '%_');
            $query->where('name', 'LIKE', "%{$escaped}%");
        }

        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        $tags = $query->orderBy($sort, $order)->paginate(25)->withQueryString();

        return Inertia::render('Admin/Tags/Index', [
            'tags' => $tags,
            'filters' => (object) $request->only(['search', 'user_id', 'sort', 'order']),
            'stats' => [
                'total_tags' => Tag::count(),
            ],
        ]);
    }

    /**
     * Hapus tag — admin bisa menghapus tag milik user manapun.
     */
    public function destroy(Request $request, Tag $tag): RedirectResponse
    {
        $tagName = $tag->name;
        $tag->delete();

        ActivityLog::log(
            $request->user()->id,
            'admin_tag_deleted',
            $request->ip(),
            $request->userAgent(),
            ['tag_name' => $tagName]
        );

        return redirect()->route('admin.tags.index')->with('success', "Tag \"{$tagName}\" deleted.");
    }
}
