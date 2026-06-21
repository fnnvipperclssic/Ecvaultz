<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::withTrashed()->with('roles');

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $escaped = addcslashes($request->search, '%_');
                $q->where('name', 'like', '%' . $escaped . '%')
                  ->orWhere('email', 'like', '%' . $escaped . '%');
            });
        }

        if ($request->has('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $request->role));
        }

        $users = $query->latest()->paginate(20)->through(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames(),
            'two_factor_enabled' => $user->two_factor_enabled,
            'files_count' => $user->files()->count(),
            'last_login_at' => $user->last_login_at?->diffForHumans(),
            'created_at' => $user->created_at->format('Y-m-d'),
            'is_deleted' => $user->trashed(),
        ]);

        $roles = Role::all()->pluck('name');

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function show(User $user): Response
    {
        // Compute storage used by this user
        $storageUsed = \App\Models\File::where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->sum('size');
        $storageQuota = $user->storage_quota ?? config('security.default_storage_quota', 5368709120);

        // Recent activity logs for this user
        $activityLogs = ActivityLog::where('user_id', $user->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($log) => [
                'action' => $log->action,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->format('Y-m-d H:i'),
            ]);

        // Send data under 'user' key to match the React component's expected prop
        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'two_factor_enabled' => (bool) $user->two_factor_enabled,
                'email_verified_at' => $user->hasVerifiedEmail() ? $user->email_verified_at?->format('Y-m-d H:i') : null,
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i'),
                'last_login_ip' => $user->last_login_ip,
                'password_changed_at' => $user->password_changed_at?->format('Y-m-d H:i'),
                'files_count' => $user->files()->count(),
                'storage_used' => $storageUsed,
                'storage_quota' => (int) $storageQuota,
                'created_at' => $user->created_at->format('Y-m-d H:i'),
                'deleted_at' => $user->deleted_at?->format('Y-m-d H:i'),
                'activity_logs' => $activityLogs,
            ],
            'allRoles' => Role::all()->pluck('name'),
            'allPermissions' => \Spatie\Permission\Models\Permission::all()->pluck('name'),
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'targetUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'allRoles' => Role::all()->pluck('name'),
            'allPermissions' => \Spatie\Permission\Models\Permission::all()->pluck('name'),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'roles' => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->has('roles')) {
            $user->syncRoles($request->input('roles', []));
        }

        if ($request->has('permissions')) {
            $user->syncPermissions($request->input('permissions', []));
        }

        ActivityLog::log($request->user()->id, 'admin_updated_user', $request->ip(), $request->userAgent(), [
            'target_user_id' => $user->id,
            'target_email' => $user->email,
        ]);

        return back()->with('success', 'User updated successfully.');
    }

    public function ban(User $user, Request $request): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot ban yourself.');
        }

        $user->delete(); // Soft delete

        ActivityLog::log($request->user()->id, 'admin_banned_user', $request->ip(), $request->userAgent(), [
            'target_user_id' => $user->id,
            'target_email' => $user->email,
        ]);

        return back()->with('success', 'User has been banned (soft deleted).');
    }

    public function unban(User $user, Request $request): RedirectResponse
    {
        $user->restore();

        ActivityLog::log($request->user()->id, 'admin_unbanned_user', $request->ip(), $request->userAgent(), [
            'target_user_id' => $user->id,
            'target_email' => $user->email,
        ]);

        return back()->with('success', 'User has been unbanned.');
    }
}
