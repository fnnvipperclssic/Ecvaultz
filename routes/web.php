<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\ProfileController;
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

// Landing page (public)
Route::get('/', function () {
    return Inertia::render('Landing');
})->name('landing');

// Guest routes
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

// 2FA challenge routes (separate from full auth)
Route::middleware('guest')->group(function () {
    Route::get('2fa/challenge', [TwoFactorController::class, 'showChallenge'])->name('2fa.challenge');
    Route::post('2fa/challenge', [TwoFactorController::class, 'verifyChallenge']);
});

// Public share access routes
Route::get('share/{token}', [ShareController::class, 'accessViaLink'])->name('share.access');
Route::post('share/{token}', [ShareController::class, 'accessViaLink']);
Route::get('share/{token}/download', [ShareController::class, 'downloadViaLink'])->name('share.download');

// Email verification routes (must be authenticated but NOT email-verified)
Route::middleware(['auth'])->group(function () {
    Route::get('email/verify', [EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationController::class, 'resend'])->name('verification.send');
});

// Authenticated + Verified Email routes
Route::middleware(['auth', 'verified'])->group(function () {
    // 2FA setup (must be authenticated but not yet 2FA verified)
    Route::get('2fa/setup', [TwoFactorController::class, 'setup'])->name('2fa.setup');
    Route::post('2fa/enable', [TwoFactorController::class, 'enable'])->name('2fa.enable');
    Route::post('2fa/disable', [TwoFactorController::class, 'disable'])->name('2fa.disable');
    Route::get('2fa/recovery-codes', [TwoFactorController::class, 'showRecoveryCodes'])->name('2fa.recovery.show');
    Route::post('2fa/recovery-codes/regenerate', [TwoFactorController::class, 'regenerateRecoveryCodes'])->name('2fa.recovery.regenerate');

    // Profile routes
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::post('profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('profile/account', [ProfileController::class, 'destroyAccount'])->name('profile.destroy');
    Route::post('profile/logout-others', [ProfileController::class, 'logoutOtherDevices'])->name('profile.logout-others');

    // Logout
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// Main application routes (authenticated + 2FA verified)
Route::middleware(['auth', 'verified', '2fa'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Files
    Route::get('files', [FileController::class, 'index'])->name('files.index');
    Route::post('files', [FileController::class, 'store'])->name('files.store');
    Route::get('files/trash', [FileController::class, 'trash'])->name('files.trash');
    Route::get('files/{uuid}', [FileController::class, 'preview'])->name('files.preview');
    Route::get('files/{uuid}/download', [FileController::class, 'download'])->name('files.download');
    Route::patch('files/{uuid}/rename', [FileController::class, 'rename'])->name('files.rename');
    Route::patch('files/{uuid}/move', [FileController::class, 'move'])->name('files.move');
    Route::delete('files/{uuid}', [FileController::class, 'destroy'])->name('files.destroy');
    Route::post('files/{uuid}/restore', [FileController::class, 'restore'])->name('files.restore');
    Route::delete('files/{uuid}/force', [FileController::class, 'forceDelete'])->name('files.force-delete');
    Route::post('files/bulk', [FileController::class, 'bulkAction'])->name('files.bulk');

    // Folders
    Route::post('folders', [FolderController::class, 'store'])->name('folders.store');
    Route::patch('folders/{uuid}', [FolderController::class, 'update'])->name('folders.update');
    Route::delete('folders/{uuid}', [FolderController::class, 'destroy'])->name('folders.destroy');

    // Sharing
    Route::get('shares', [ShareController::class, 'index'])->name('shares.index');
    Route::post('shares', [ShareController::class, 'store'])->name('shares.store');
    Route::post('files/{fileUuid}/share', [ShareController::class, 'store']);
    Route::delete('shares/{shareUuid}', [ShareController::class, 'destroy'])->name('shares.destroy');

    // Activity Logs
    Route::get('activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');

    // Secure avatar serving
    Route::get('secure/avatar/{user}', function (App\Models\User $user) {
        if ($user->avatar_path && Storage::disk('private')->exists($user->avatar_path)) {
            return response()->file(Storage::disk('private')->path($user->avatar_path));
        }
        abort(404);
    })->name('secure.avatar');
});
