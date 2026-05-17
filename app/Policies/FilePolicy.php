<?php

namespace App\Policies;

use App\Models\File;
use App\Models\User;

class FilePolicy
{
    public function view(User $user, File $file): bool
    {
        if ($file->isOwnedBy($user)) {
            return true;
        }

        return $file->isSharedWith($user, 'read') || $file->isSharedWith($user, 'write');
    }

    public function update(User $user, File $file): bool
    {
        if ($file->isOwnedBy($user)) {
            return true;
        }

        return $file->isSharedWith($user, 'write');
    }

    public function delete(User $user, File $file): bool
    {
        return $file->isOwnedBy($user);
    }

    public function download(User $user, File $file): bool
    {
        return $this->view($user, $file);
    }

    public function share(User $user, File $file): bool
    {
        return $file->isOwnedBy($user);
    }

    public function restore(User $user, File $file): bool
    {
        return $file->isOwnedBy($user);
    }

    public function forceDelete(User $user, File $file): bool
    {
        return $file->isOwnedBy($user);
    }
}
