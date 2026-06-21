<?php

/**
 * Web Routes — Ecvaultz
 *
 * Route groups (in order of middleware stack):
 *   1. Public (no auth)          — Landing, share-link access, security-question verify
 *   2. Guest                     — Login, register, forgot/reset password, 2FA challenge
 *   3. Auth only                 — Email verification
 *   4. Auth + Verified           — 2FA setup, security questions, profile, logout
 *   5. Auth + Verified + 2FA     — Main app: dashboard, files, folders, shares, activity
 *   6. Auth + Verified + 2FA + Permission — Admin panel
 *
 * All state-changing routes use POST/PATCH/DELETE. No CSRF exceptions.
 */

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DataRoomController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\FileVersionController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\TwoFactorController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\EmailVerificationController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Landing');
})->name('landing');

/*
|--------------------------------------------------------------------------
| Guest Routes (unauthenticated only)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.update');
});

/*
|--------------------------------------------------------------------------
| 2FA Challenge (guest middleware — user logged out pending TOTP verification)
|--------------------------------------------------------------------------
*/
Route::middleware(['guest', 'throttle:2fa'])->group(function () {
    Route::get('2fa/challenge', [TwoFactorController::class, 'showChallenge'])->name('2fa.challenge');
    Route::post('2fa/challenge', [TwoFactorController::class, 'verifyChallenge']);
});

/*
|--------------------------------------------------------------------------
| Public Share Link Access (no auth required)
|--------------------------------------------------------------------------
*/
Route::middleware('throttle:share-access')->group(function () {
    Route::get('share/{token}', [ShareController::class, 'accessViaLink'])->name('share.access');
    Route::post('share/{token}', [ShareController::class, 'accessViaLink']);
    Route::get('share/{token}/download', [ShareController::class, 'downloadViaLink'])->name('share.download');
});

/*
|--------------------------------------------------------------------------
| Data Room Public Access (via invite access code, no auth required)
|--------------------------------------------------------------------------
*/
Route::middleware('throttle:share-access')->group(function () {
    Route::match(['get', 'post'], 'data-room/access/{token}', [DataRoomController::class, 'accessRoom'])->name('datarooms.access');
});

/*
|--------------------------------------------------------------------------
| Security Questions (public — password reset verification)
|--------------------------------------------------------------------------
*/
Route::get('password/security-questions', [App\Http\Controllers\Auth\SecurityQuestionController::class, 'showVerify'])
    ->name('password.security-questions');
Route::post('security-questions/verify', [App\Http\Controllers\Auth\SecurityQuestionController::class, 'verify'])
    ->name('security-questions.verify')->middleware('throttle:security-question');

/*
|--------------------------------------------------------------------------
| Email Verification (auth required, not yet verified)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('email/verify', [EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationController::class, 'resend'])->name('verification.send');
});

/*
|--------------------------------------------------------------------------
| Auth + Verified (must be logged in with confirmed email)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    // 2FA setup (must be authenticated but not yet 2FA verified)
    Route::get('2fa/setup', [TwoFactorController::class, 'setup'])->name('2fa.setup');
    Route::post('2fa/enable', [TwoFactorController::class, 'enable'])->name('2fa.enable');
    Route::post('2fa/disable', [TwoFactorController::class, 'disable'])->name('2fa.disable');
    Route::get('2fa/recovery-codes', [TwoFactorController::class, 'showRecoveryCodes'])->name('2fa.recovery.show');
    Route::post('2fa/recovery-codes/regenerate', [TwoFactorController::class, 'regenerateRecoveryCodes'])->name('2fa.recovery.regenerate');

    // Security Questions
    Route::get('security-questions', [App\Http\Controllers\Auth\SecurityQuestionController::class, 'create'])
        ->name('security-questions.create');
    Route::post('security-questions', [App\Http\Controllers\Auth\SecurityQuestionController::class, 'store'])
        ->name('security-questions.store');

    // Profile routes
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::post('profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('profile/account', [ProfileController::class, 'destroyAccount'])->name('profile.destroy');
    Route::post('profile/logout-others', [ProfileController::class, 'logoutOtherDevices'])->name('profile.logout-others');

    // Recovery Kit (FEAT-13)
    Route::get('profile/recovery-kit', [ProfileController::class, 'showRecoveryKit'])->name('profile.recovery-kit');
    Route::get('profile/recovery-kit/download', [ProfileController::class, 'downloadRecoveryKit'])->name('profile.recovery-kit.download');

    // Logout
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

/*
|--------------------------------------------------------------------------
| Main Application (auth + verified + 2FA + password expiry check)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', '2fa', \App\Http\Middleware\CheckPasswordExpiry::class])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Files
    Route::get('files', [FileController::class, 'index'])->name('files.index');
    Route::post('files', [FileController::class, 'store'])->name('files.store')->middleware('throttle:upload');
    Route::get('files/search', [FileController::class, 'search'])->name('files.search');
    Route::get('files/trash', [FileController::class, 'trash'])->name('files.trash');
    Route::get('files/{uuid}', [FileController::class, 'preview'])->name('files.preview');
    Route::get('files/{uuid}/download', [FileController::class, 'download'])->name('files.download');
    Route::patch('files/{uuid}/rename', [FileController::class, 'rename'])->name('files.rename');
    Route::patch('files/{uuid}/move', [FileController::class, 'move'])->name('files.move');
    Route::delete('files/{uuid}', [FileController::class, 'destroy'])->name('files.destroy');
    Route::post('files/{uuid}/restore', [FileController::class, 'restore'])->name('files.restore');
    Route::delete('files/{uuid}/force', [FileController::class, 'forceDelete'])->name('files.force-delete');
    Route::post('files/bulk', [FileController::class, 'bulkAction'])->name('files.bulk');
    Route::post('files/{file}/favorite', [FileController::class, 'toggleFavorite'])->name('files.favorite');
    Route::post('files/{file}/duplicate', [FileController::class, 'duplicate'])->name('files.duplicate');
    Route::get('files/{file}/activity', [FileController::class, 'activity'])->name('files.activity');
    Route::patch('files/{file}/description', [FileController::class, 'updateDescription'])->name('files.description');
    Route::patch('files/{file}/expiry', [FileController::class, 'updateExpiry'])->name('files.expiry');
    Route::get('files/{file}/watermarked-preview', [FileController::class, 'watermarkedPreview'])->name('files.watermarked-preview');
    Route::post('files/{file}/tags', [TagController::class, 'attach'])->name('files.tags.attach');
    Route::delete('files/{file}/tags/{tag}', [TagController::class, 'detach'])->name('files.tags.detach');

    // Trash
    Route::post('trash/empty', [FileController::class, 'emptyTrash'])->name('trash.empty');

    // Folders
    Route::post('folders', [FolderController::class, 'store'])->name('folders.store');
    Route::patch('folders/{uuid}', [FolderController::class, 'update'])->name('folders.update');
    Route::delete('folders/{uuid}', [FolderController::class, 'destroy'])->name('folders.destroy');
    Route::get('api/folders/tree', [FolderController::class, 'tree'])->name('folders.tree');

    // Sharing
    Route::get('shares', [ShareController::class, 'index'])->name('shares.index');
    Route::post('shares', [ShareController::class, 'store'])->name('shares.store');
    Route::post('files/{fileUuid}/share', [ShareController::class, 'store']);
    Route::delete('shares/{shareUuid}', [ShareController::class, 'destroy'])->name('shares.destroy');

    // Tags
    Route::get('tags', [TagController::class, 'index'])->name('tags.index');
    Route::post('tags', [TagController::class, 'store'])->name('tags.store');
    Route::put('tags/{tag}', [TagController::class, 'update'])->name('tags.update');
    Route::delete('tags/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');

    // Activity Logs
    Route::get('activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');

    // File Versions
    Route::get('files/{uuid}/versions', [FileVersionController::class, 'index'])->name('files.versions');
    Route::post('files/versions/{version}/restore', [FileVersionController::class, 'restore'])->name('files.versions.restore');
    Route::get('files/versions/{version}/diff', [FileVersionController::class, 'diff'])->name('files.versions.diff');

    // Notifications
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // Data Rooms (FEAT-12)
    Route::get('data-rooms', [DataRoomController::class, 'index'])->name('datarooms.index');
    Route::post('data-rooms', [DataRoomController::class, 'store'])->name('datarooms.store');
    Route::get('data-rooms/{room}', [DataRoomController::class, 'show'])->name('datarooms.show');
    Route::put('data-rooms/{room}', [DataRoomController::class, 'update'])->name('datarooms.update');
    Route::delete('data-rooms/{room}', [DataRoomController::class, 'destroy'])->name('datarooms.destroy');
    Route::post('data-rooms/{room}/files', [DataRoomController::class, 'addFile'])->name('datarooms.files.add');
    Route::delete('data-rooms/{room}/files/{file}', [DataRoomController::class, 'removeFile'])->name('datarooms.files.remove');
    Route::post('data-rooms/{room}/invites', [DataRoomController::class, 'inviteUser'])->name('datarooms.invites.store');
    Route::delete('data-rooms/{room}/invites/{inviteId}', [DataRoomController::class, 'revokeInvite'])->name('datarooms.invites.revoke');

    // Secure avatar serving
    Route::get('secure/avatar/{user}', function (App\Models\User $user) {
        if ($user->avatar_path && Storage::disk('private')->exists($user->avatar_path)) {
            return response()->file(Storage::disk('private')->path($user->avatar_path));
        }
        abort(404);
    })->name('secure.avatar');
});

/*
|--------------------------------------------------------------------------
| Admin Panel (auth + 2FA + admin.access permission required)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', '2fa', 'permission:admin.access'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/users', [App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [App\Http\Controllers\Admin\UserManagementController::class, 'show'])->name('users.show')->withTrashed();
    Route::get('/users/{user}/edit', [App\Http\Controllers\Admin\UserManagementController::class, 'edit'])->name('users.edit')->withTrashed();
    Route::patch('/users/{user}', [App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('users.update')->withTrashed();
    Route::post('/users/{user}/ban', [App\Http\Controllers\Admin\UserManagementController::class, 'ban'])->name('users.ban')->withTrashed();
    Route::post('/users/{user}/unban', [App\Http\Controllers\Admin\UserManagementController::class, 'unban'])->name('users.unban')->withTrashed();
    Route::get('/settings', [App\Http\Controllers\Admin\SystemSettingsController::class, 'index'])->name('settings');
    Route::patch('/settings', [App\Http\Controllers\Admin\SystemSettingsController::class, 'update'])->name('settings.update');
    Route::get('/activity-log', [App\Http\Controllers\Admin\ActivityLogAdminController::class, 'index'])->name('activity-log');
    Route::get('/activity-log/export', [App\Http\Controllers\Admin\ActivityLogAdminController::class, 'export'])->name('activity-log.export');
});
