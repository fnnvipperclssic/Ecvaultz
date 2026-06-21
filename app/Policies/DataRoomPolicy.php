<?php

/**
 * Data Room Policy — Authorization Rules for Data Room Operations
 *
 * Menerapkan OWASP A01 (Broken Access Control) pada operasi Data Room.
 * Hanya owner yang bisa mengelola Data Room. Akses tamu via invite code
 * di-handle terpisah oleh DataRoomController::accessRoom().
 *
 * @package App\Policies
 * @security OWASP A01 — Owner-only management for secure data rooms
 */

namespace App\Policies;

use App\Models\DataRoom;
use App\Models\User;

class DataRoomPolicy
{
    /**
     * View data room — hanya owner.
     * (Akses tamu via invite ditangani di controller level)
     */
    public function view(User $user, DataRoom $dataRoom): bool
    {
        return $dataRoom->user_id === $user->id;
    }

    /**
     * Update data room — hanya owner.
     */
    public function update(User $user, DataRoom $dataRoom): bool
    {
        return $dataRoom->user_id === $user->id;
    }

    /**
     * Delete data room — hanya owner.
     */
    public function delete(User $user, DataRoom $dataRoom): bool
    {
        return $dataRoom->user_id === $user->id;
    }

    /**
     * Add/remove files — hanya owner.
     */
    public function manageFiles(User $user, DataRoom $dataRoom): bool
    {
        return $dataRoom->user_id === $user->id;
    }

    /**
     * Manage invites — hanya owner.
     */
    public function manageInvites(User $user, DataRoom $dataRoom): bool
    {
        return $dataRoom->user_id === $user->id;
    }
}
