<?php

/**
 * Admin Data Room Controller — Manajemen Data Room untuk Administrator
 *
 * Menyediakan visibilitas penuh ke semua Data Room di sistem.
 * Admin dapat melihat dan menghapus Data Room dari user manapun.
 *
 * @package App\Http\Controllers\Admin
 * @security OWASP A01 — Admin-only data room management
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DataRoom;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DataRoomAdminController extends Controller
{
    /**
     * Daftar semua Data Room dengan statistik.
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['name', 'is_active', 'expires_at', 'created_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query = DataRoom::with(['user:id,name,email'])
            ->withCount(['files', 'invites']);

        if ($search = $request->get('search')) {
            $escaped = addcslashes($search, '%_');
            $query->where(function ($q) use ($escaped) {
                $q->where('name', 'LIKE', "%{$escaped}%")
                  ->orWhere('description', 'LIKE', "%{$escaped}%");
            });
        }

        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        $dataRooms = $query->orderBy($sort, $order)->paginate(25)->withQueryString();

        return Inertia::render('Admin/DataRooms/Index', [
            'dataRooms' => $dataRooms,
            'filters' => $request->only(['search', 'user_id', 'sort', 'order']),
            'stats' => [
                'total_rooms' => DataRoom::count(),
                'active_rooms' => DataRoom::where('is_active', true)->count(),
            ],
        ]);
    }

    /**
     * Detail Data Room — file, invites, dan aktivitas.
     */
    public function show(DataRoom $dataRoom): Response
    {
        $dataRoom->load([
            'user:id,name,email',
            'files' => fn ($q) => $q->with('user:id,name,email'),
            'invites',
        ]);

        return Inertia::render('Admin/DataRooms/Show', [
            'dataRoom' => $dataRoom,
        ]);
    }

    /**
     * Hapus Data Room beserta semua relasinya.
     */
    public function destroy(Request $request, DataRoom $dataRoom): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'current_password'],
        ]);

        $roomName = $dataRoom->name;
        $dataRoom->invites()->delete();
        $dataRoom->files()->detach();
        $dataRoom->delete();

        ActivityLog::log(
            $request->user()->id,
            'admin_dataroom_deleted',
            $request->ip(),
            $request->userAgent(),
            ['room_name' => $roomName]
        );

        return redirect()->route('admin.data-rooms.index')->with('success', "Data Room \"{$roomName}\" deleted.");
    }
}
