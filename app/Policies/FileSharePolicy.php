<?php

/**
 * File Share Policy — Authorization Rules for File Share Operations
 *
 * Menerapkan OWASP A01 (Broken Access Control) pada operasi sharing.
 * - Owner file (shared_by_user_id) bisa revoke share
 * - Penerima share (shared_with_user_id) bisa view share detail
 * - Public link diakses via token — ditangani di controller level
 *
 * @package App\Policies
 * @security OWASP A01 — Share ownership validation
 */

namespace App\Policies;

use App\Models\FileShare;
use App\Models\User;

class FileSharePolicy
{
    /**
     * View share details — owner file ATAU penerima share.
     */
    public function view(User $user, FileShare $share): bool
    {
        return $share->shared_by_user_id === $user->id
            || $share->shared_with_user_id === $user->id;
    }

    /**
     * Revoke/delete share — hanya owner file yang membuat share.
     */
    public function delete(User $user, FileShare $share): bool
    {
        return $share->shared_by_user_id === $user->id;
    }

    /**
     * Update share settings — hanya owner file.
     */
    public function update(User $user, FileShare $share): bool
    {
        return $share->shared_by_user_id === $user->id;
    }
}
