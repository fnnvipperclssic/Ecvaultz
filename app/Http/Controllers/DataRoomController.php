<?php

namespace App\Http\Controllers;

use App\Models\DataRoom;
use App\Models\DataRoomInvite;
use App\Models\File;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Virtual Data Room (VDR) controller.
 *
 * Full CRUD for data rooms, file management within rooms,
 * and invite-based access control for external parties.
 */
class DataRoomController extends Controller
{
    /**
     * List the authenticated user's data rooms with file counts.
     */
    public function index(Request $request): Response
    {
        $rooms = DataRoom::where('user_id', $request->user()->id)
            ->withCount('files')
            ->latest()
            ->paginate(20)
            ->through(fn (DataRoom $room) => [
                'id' => $room->id,
                'name' => $room->name,
                'description' => $room->description,
                'primary_color' => $room->primary_color,
                'is_active' => $room->is_active,
                'files_count' => $room->files_count,
                'invites_count' => $room->invites()->count(),
                'is_expired' => $room->isExpired(),
                'expires_at' => $room->expires_at?->format('Y-m-d H:i'),
                'created_at' => $room->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('DataRooms/Index', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Create a new data room.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'primary_color' => ['nullable', 'string', 'regex:/^#[a-fA-F0-9]{6}$/', 'max:10'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $room = DataRoom::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'primary_color' => $validated['primary_color'] ?? '#4f46e5',
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        ActivityLog::log($request->user()->id, 'data_room_created', $request->ip(), $request->userAgent(), [
            'data_room_id' => $room->id,
            'name' => $room->name,
        ]);

        return redirect()->route('datarooms.show', $room->id)
            ->with('success', 'Data room created successfully.');
    }

    /**
     * Show a data room's details with its files and invites.
     */
    public function show(Request $request, DataRoom $room): Response
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        $files = $room->files()->paginate(20)->through(fn (File $file) => [
            'uuid' => $file->uuid,
            'name' => $file->original_name,
            'mime_type' => $file->mime_type,
            'size' => $file->getSizeForHumans(),
            'added_at' => $file->pivot->added_at->format('Y-m-d H:i'),
        ]);

        $invites = $room->invites()->latest()->get()->map(fn (DataRoomInvite $invite) => [
            'id' => $invite->id,
            'email' => $invite->email,
            'has_access_code' => !empty($invite->access_code),
            'is_expired' => $invite->isExpired(),
            'expires_at' => $invite->expires_at?->format('Y-m-d H:i'),
            'last_accessed_at' => $invite->last_accessed_at?->diffForHumans(),
            'access_count' => $invite->access_count,
        ]);

        return Inertia::render('DataRooms/Show', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'description' => $room->description,
                'logo_path' => $room->logo_path,
                'primary_color' => $room->primary_color,
                'is_active' => $room->is_active,
                'is_expired' => $room->isExpired(),
                'expires_at' => $room->expires_at?->format('Y-m-d H:i'),
                'created_at' => $room->created_at->format('Y-m-d H:i'),
            ],
            'files' => $files,
            'invites' => $invites,
        ]);
    }

    /**
     * Update a data room's settings.
     */
    public function update(Request $request, DataRoom $room): RedirectResponse
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'primary_color' => ['nullable', 'string', 'regex:/^#[a-fA-F0-9]{6}$/', 'max:10'],
            'is_active' => ['boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $room->update($validated);

        ActivityLog::log($request->user()->id, 'data_room_updated', $request->ip(), $request->userAgent(), [
            'data_room_id' => $room->id,
        ]);

        return back()->with('success', 'Data room updated successfully.');
    }

    /**
     * Delete a data room and all associated data.
     */
    public function destroy(Request $request, DataRoom $room): RedirectResponse
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        ActivityLog::log($request->user()->id, 'data_room_deleted', $request->ip(), $request->userAgent(), [
            'data_room_id' => $room->id,
            'name' => $room->name,
        ]);

        $room->delete();

        return redirect()->route('datarooms.index')
            ->with('success', 'Data room deleted successfully.');
    }

    /**
     * Add a file to a data room.
     */
    public function addFile(Request $request, DataRoom $room): RedirectResponse
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'file_uuid' => ['required', 'string', 'uuid', 'exists:files,uuid'],
        ]);

        $file = File::where('uuid', $validated['file_uuid'])->firstOrFail();

        // Only allow adding files owned by this user
        if ($file->user_id !== $request->user()->id) {
            abort(403, 'You can only add your own files to a data room.');
        }

        // Check if already added
        if ($room->files()->where('file_uuid', $file->uuid)->exists()) {
            return back()->with('error', 'File is already in this data room.');
        }

        $room->files()->attach($file->uuid, ['added_at' => now()]);

        ActivityLog::log($request->user()->id, 'data_room_file_added', $request->ip(), $request->userAgent(), [
            'data_room_id' => $room->id,
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
        ]);

        return back()->with('success', 'File added to data room.');
    }

    /**
     * Remove a file from a data room.
     */
    public function removeFile(Request $request, DataRoom $room, File $file): RedirectResponse
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        $room->files()->detach($file->uuid);

        ActivityLog::log($request->user()->id, 'data_room_file_removed', $request->ip(), $request->userAgent(), [
            'data_room_id' => $room->id,
            'file_uuid' => $file->uuid,
        ]);

        return back()->with('success', 'File removed from data room.');
    }

    /**
     * Invite a user (by email) to access a data room.
     */
    public function inviteUser(Request $request, DataRoom $room): RedirectResponse
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        // Check if already invited
        $existing = $room->invites()->where('email', $validated['email'])->first();
        if ($existing) {
            return back()->with('error', 'This email has already been invited to this data room.');
        }

        $accessCode = Str::random(12);

        $invite = $room->invites()->create([
            'email' => $validated['email'],
            'access_code' => $accessCode,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        ActivityLog::log($request->user()->id, 'data_room_invite_created', $request->ip(), $request->userAgent(), [
            'data_room_id' => $room->id,
            'invited_email' => $validated['email'],
            'invite_id' => $invite->id,
        ]);

        return back()->with([
            'success' => 'Invitation sent to ' . $validated['email'] . '.',
            'access_code' => $accessCode,
        ]);
    }

    /**
     * Revoke an invitation.
     */
    public function revokeInvite(Request $request, DataRoom $room, string $inviteId): RedirectResponse
    {
        if ($room->user_id !== $request->user()->id) {
            abort(403);
        }

        $invite = $room->invites()->findOrFail($inviteId);

        ActivityLog::log($request->user()->id, 'data_room_invite_revoked', $request->ip(), $request->userAgent(), [
            'data_room_id' => $room->id,
            'invited_email' => $invite->email,
            'invite_id' => $invite->id,
        ]);

        $invite->delete();

        return back()->with('success', 'Invitation revoked.');
    }

    /**
     * Public access to a data room via invite (access code required).
     * Accessed via a token-based URL.
     */
    public function accessRoom(Request $request, string $token): \Inertia\Response|RedirectResponse
    {
        // Token is the invite access code
        $invite = DataRoomInvite::where('access_code', $token)
            ->with('dataRoom')
            ->firstOrFail();

        if ($invite->isExpired()) {
            return Inertia::render('DataRooms/Access', [
                'error' => 'This access link has expired.',
            ]);
        }

        $room = $invite->dataRoom;

        if (!$room->is_active || $room->isExpired()) {
            return Inertia::render('DataRooms/Access', [
                'error' => 'This data room is no longer active.',
            ]);
        }

        // Validate email if not yet provided
        $sessionKey = 'data_room_unlocked_' . $invite->id;
        if (!$request->session()->get($sessionKey)) {
            if ($request->isMethod('post')) {
                $request->validate(['email' => ['required', 'email']]);

                if (strtolower($request->email) !== strtolower($invite->email)) {
                    return back()->with('error', 'Email does not match the invitation.');
                }

                $request->session()->put($sessionKey, true);
            } else {
                return Inertia::render('DataRooms/Access', [
                    'needsEmail' => true,
                    'roomName' => $room->name,
                ]);
            }
        }

        $invite->recordAccess();

        $files = $room->files()->get()->map(fn (File $file) => [
            'uuid' => $file->uuid,
            'name' => $file->original_name,
            'size' => $file->getSizeForHumans(),
            'mime_type' => $file->mime_type,
        ]);

        return Inertia::render('DataRooms/Access', [
            'roomName' => $room->name,
            'roomDescription' => $room->description,
            'primaryColor' => $room->primary_color,
            'files' => $files,
            'inviteId' => $invite->id,
        ]);
    }
}
