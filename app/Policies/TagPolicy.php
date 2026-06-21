<?php

/**
 * Tag Policy — Authorization Rules for Tag Operations
 *
 * Menerapkan OWASP A01 (Broken Access Control) pada operasi tag.
 * Tag bersifat per-user — user hanya bisa mengelola tagnya sendiri.
 *
 * @package App\Policies
 * @security OWASP A01 — Per-user ownership enforcement
 */

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;

class TagPolicy
{
    /**
     * View tag — hanya owner.
     */
    public function view(User $user, Tag $tag): bool
    {
        return $tag->user_id === $user->id;
    }

    /**
     * Update tag — hanya owner yang bisa rename/ubah warna.
     */
    public function update(User $user, Tag $tag): bool
    {
        return $tag->user_id === $user->id;
    }

    /**
     * Delete tag — hanya owner yang bisa menghapus.
     */
    public function delete(User $user, Tag $tag): bool
    {
        return $tag->user_id === $user->id;
    }
}
