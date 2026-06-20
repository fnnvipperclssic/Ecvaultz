<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\FileShare;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manages file sharing between users (internal) and via public links (external).
 *
 * Internal shares link two registered users with read or write permission.
 * External shares generate a 64-char token stored as SHA-256 hash in the DB;
 * the raw token is only shown once at creation. External links can be password-
 * protected and set to expire after a configurable number of hours.
 */
class ShareController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $sharedByMe = $user->sharedByMe()
            ->with(['file', 'sharedWith'])
            ->latest()
            ->get()
            ->map(fn ($share) => [
                'uuid' => $share->uuid,
                'file_name' => $share->file->original_name,
                'file_uuid' => $share->file->uuid,
                'type' => $share->type,
                'permission' => $share->permission,
                'shared_with_email' => $share->sharedWith?->email ?? $share->external_email,
                'expires_at' => $share->expires_at?->format('Y-m-d H:i'),
                'is_expired' => $share->isExpired(),
                'access_count' => $share->access_count,
            ]);

        $sharedWithMe = $user->sharedWithMe()
            ->with(['file', 'sharedBy'])
            ->latest()
            ->get()
            ->map(fn ($share) => [
                'uuid' => $share->uuid,
                'file_name' => $share->file->original_name,
                'file_uuid' => $share->file->uuid,
                'permission' => $share->permission,
                'shared_by_name' => $share->sharedBy->name,
                'shared_by_email' => $share->sharedBy->email,
                'created_at' => $share->created_at->diffForHumans(),
            ]);

        $myFiles = $user->files()
            ->latest('uploaded_at')
            ->take(200)
            ->get()
            ->map(fn ($file) => [
                'uuid' => $file->uuid,
                'name' => $file->original_name,
                'size' => $file->getSizeForHumans(),
            ]);

        return Inertia::render('Files/Share', [
            'sharedByMe' => $sharedByMe,
            'sharedWithMe' => $sharedWithMe,
            'myFiles' => $myFiles,
        ]);
    }

    public function store(Request $request, ?string $fileUuid = null): RedirectResponse
    {
        $fileUuid = $fileUuid ?? $request->input('file_uuid');

        if (!$fileUuid) {
            return back()->with('error', 'No file specified for sharing.');
        }

        $file = File::where('uuid', $fileUuid)->firstOrFail();

        if (!Gate::allows('share', $file)) {
            abort(403);
        }

        $request->validate([
            'file_uuid' => ['nullable', 'string', 'uuid'],
            'type' => ['required', 'in:internal,external'],
            'email' => ['required_if:type,internal,external', 'email', 'max:255'],
            'permission' => ['required', 'in:read,write'],
            'password' => ['nullable', 'string', 'min:8', 'required_if:type,external'],
            'expires_in_hours' => ['nullable', 'integer', 'min:1', 'max:720'],
        ]);

        $shareData = [
            'file_id' => $file->id,
            'shared_by_user_id' => $request->user()->id,
            'type' => $request->type,
            'permission' => $request->permission,
            'expires_at' => $request->expires_in_hours
                ? now()->addHours($request->expires_in_hours)
                : null,
        ];

        if ($request->type === 'internal') {
            $sharedWith = \App\Models\User::where('email', $request->email)->first();

            if (!$sharedWith) {
                return back()->with('error', 'User with this email not found.');
            }

            if ($sharedWith->id === $request->user()->id) {
                return back()->with('error', 'Cannot share with yourself.');
            }

            if ($sharedWith->sharedWithMe()->where('file_id', $file->id)->exists()) {
                return back()->with('error', 'File already shared with this user.');
            }

            $shareData['shared_with_user_id'] = $sharedWith->id;
        } else {
            $shareData['external_email'] = $request->email;
            $rawToken = Str::random(64);
            $shareData['share_link_token'] = hash('sha256', $rawToken);

            if ($request->password) {
                $shareData['share_link_password'] = Hash::make($request->password);
            }
        }

        $share = FileShare::create($shareData);

        ActivityLog::log(
            $request->user()->id,
            'file_shared',
            $request->ip(),
            $request->userAgent(),
            [
                'file_uuid' => $file->uuid,
                'share_uuid' => $share->uuid,
                'type' => $request->type,
                'with' => $request->email,
                'permission' => $request->permission,
            ]
        );

        $message = $request->type === 'external'
            ? 'Share link generated successfully.'
            : 'File shared with ' . $request->email;

        if ($request->type === 'external') {
            return back()->with([
                'success' => $message,
                'share_link' => route('share.access', ['token' => $rawToken]),
            ]);
        }

        return back()->with('success', $message);
    }

    public function destroy(Request $request, string $shareUuid): RedirectResponse
    {
        $share = FileShare::where('uuid', $shareUuid)->firstOrFail();

        if ($share->shared_by_user_id !== $request->user()->id) {
            abort(403);
        }

        ActivityLog::log(
            $request->user()->id,
            'file_unshared',
            $request->ip(),
            $request->userAgent(),
            ['share_uuid' => $share->uuid, 'file_uuid' => $share->file->uuid]
        );

        $share->delete();

        return back()->with('success', 'Share removed.');
    }

    public function accessViaLink(Request $request, string $token): Response|RedirectResponse
    {
        $hashedToken = hash('sha256', $token);
        $share = FileShare::where('share_link_token', $hashedToken)
            ->with('file')
            ->firstOrFail();

        if ($share->type !== 'external') {
            abort(404);
        }

        if ($share->isExpired()) {
            return Inertia::render('Files/ShareAccess', [
                'error' => 'This share link has expired.',
            ]);
        }

        // If password protected
        if ($share->share_link_password) {
            if (!$request->session()->get('share_unlocked_' . $share->id)) {
                if ($request->isMethod('post')) {
                    $request->validate(['password' => ['required', 'string']]);

                    if (!Hash::check($request->password, $share->share_link_password)) {
                        return back()->with('error', 'Incorrect password.');
                    }

                    $request->session()->put('share_unlocked_' . $share->id, true);
                } else {
                    return Inertia::render('Files/ShareAccess', [
                        'needsPassword' => true,
                        'shareUuid' => $share->uuid,
                        'fileName' => $share->file->original_name,
                        'sharedBy' => $share->sharedBy->name,
                    ]);
                }
            }
        }

        $share->recordAccess();

        ActivityLog::log(null, 'share_link_accessed', $request->ip(), $request->userAgent(), [
            'file_uuid' => $share->file->uuid,
            'share_uuid' => $share->uuid,
        ]);

        return Inertia::render('Files/ShareAccess', [
            'fileName' => $share->file->original_name,
            'fileSize' => $share->file->getSizeForHumans(),
            'sharedBy' => $share->sharedBy->name,
            'downloadUrl' => route('share.download', ['token' => $token]),
            'expiresAt' => $share->expires_at?->diffForHumans(),
        ]);
    }

    public function downloadViaLink(Request $request, string $token)
    {
        $hashedToken = hash('sha256', $token);
        $share = FileShare::where('share_link_token', $hashedToken)
            ->with('file')
            ->firstOrFail();

        if ($share->type !== 'external' || $share->isExpired()) {
            abort(404);
        }

        if ($share->share_link_password && !$request->session()->get('share_unlocked_' . $share->id)) {
            return redirect()->route('share.access', ['token' => $token]);
        }

        $file = $share->file;
        $filePath = \Illuminate\Support\Facades\Storage::disk('private')->path($file->path);

        if (!file_exists($filePath)) {
            abort(404);
        }

        // Decrypt the file for download
        $encryptionService = app(\App\Services\FileEncryptionService::class);
        $userKey = $encryptionService->getUserKey($file->user);
        try {
            $decryptedPath = $encryptionService->decryptFileToTemp($filePath, $userKey);
        } catch (\RuntimeException $e) {
            abort(500, 'File decryption failed.');
        }

        $file->increment('download_count');
        $share->recordAccess();

        return response()->download($decryptedPath, $file->original_name, [
            'Content-Type' => $file->mime_type,
            'X-Content-Type-Options' => 'nosniff',
        ])->deleteFileAfterSend(true);
    }
}
