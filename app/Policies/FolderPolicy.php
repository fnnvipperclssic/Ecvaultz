<?php

/**
 * Folder Policy — Authorization Rules for Folder Operations
 *
 * Menerapkan OWASP A01 (Broken Access Control) pada operasi folder.
 * Setiap action dicek kepemilikannya — hanya owner yang bisa modify/delete.
 *
 * Admin bypass via Gate::before di AuthServiceProvider.
 *
 * @package App\Policies
 * @security OWASP A01 — Ownership-based access control
 */

namespace App\Policies;

use App\Models\Folder;
use App\Models\User;

class FolderPolicy
{
    /**
     * View folder — hanya owner yang bisa melihat isi folder.
     *
     * @param User $user User yang sedang login
     * @param Folder $folder Folder yang akan diakses
     * @return bool True jika user adalah pemilik folder
     */
    public function view(User $user, Folder $folder): bool
    {
        return $folder->user_id === $user->id;
    }

    /**
     * Update folder — hanya owner yang bisa rename/move folder.
     *
     * @param User $user User yang sedang login
     * @param Folder $folder Folder yang akan diupdate
     * @return bool True jika user adalah pemilik folder
     */
    public function update(User $user, Folder $folder): bool
    {
        return $folder->user_id === $user->id;
    }

    /**
     * Delete folder — hanya owner yang bisa menghapus (soft delete).
     * Permanent delete memerlukan password confirmation di controller level.
     *
     * @param User $user User yang sedang login
     * @param Folder $folder Folder yang akan dihapus
     * @return bool True jika user adalah pemilik folder
     */
    public function delete(User $user, Folder $folder): bool
    {
        return $folder->user_id === $user->id;
    }

    /**
     * Force delete folder — hanya owner yang bisa menghapus permanen.
     *
     * @param User $user User yang sedang login
     * @param Folder $folder Folder yang akan dihapus permanen
     * @return bool True jika user adalah pemilik folder
     */
    public function forceDelete(User $user, Folder $folder): bool
    {
        return $folder->user_id === $user->id;
    }
}
