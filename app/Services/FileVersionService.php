<?php

namespace App\Services;

use App\Models\File;
use App\Models\FileVersion;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Storage;

class FileVersionService
{
    /**
     * Create a new version from the current file state.
     */
    public function createVersion(File $file, User $user): FileVersion
    {
        $latestVersion = $file->versions()->max('version_number') ?? 0;

        return FileVersion::create([
            'file_id' => $file->id,
            'user_id' => $user->id,
            'version_number' => $latestVersion + 1,
            'original_name' => $file->original_name,
            'stored_name' => $file->stored_name,
            'mime_type' => $file->mime_type,
            'size' => $file->size,
            'path' => $file->path,
            'checksum_sha256' => $file->checksum_sha256,
            'changes' => null,
        ]);
    }

    /**
     * Restore a file to a previous version.
     */
    public function restoreVersion(FileVersion $version, User $user): File
    {
        $file = $version->file;

        // First, save current state as a new version before restoring
        $this->createVersion($file, $user);

        // Copy the old version's file back
        $oldPath = Storage::disk('private')->path($version->path);
        $newPath = Storage::disk('private')->path($file->path);

        if (file_exists($oldPath)) {
            copy($oldPath, $newPath);
        }

        // Update file record with version's metadata
        $file->update([
            'original_name' => $version->original_name,
            'stored_name' => $version->stored_name,
            'mime_type' => $version->mime_type,
            'size' => $version->size,
            'checksum_sha256' => $version->checksum_sha256,
        ]);

        ActivityLog::log($user->id, 'file_version_restored', request()->ip(), request()->userAgent(), [
            'file_uuid' => $file->uuid,
            'version_number' => $version->version_number,
        ]);

        return $file;
    }
}
