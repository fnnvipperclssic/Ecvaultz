<?php

namespace App\Services;

use App\Models\File;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class FileService
{
    protected SecurityService $security;

    public function __construct(SecurityService $security)
    {
        $this->security = $security;
    }

    public function upload(User $user, UploadedFile $uploadedFile, ?int $folderId = null): File
    {
        if (!$this->security->validateFileExtension($uploadedFile->getClientOriginalName())) {
            throw new \RuntimeException('File type not allowed.');
        }

        if ($uploadedFile->getSize() > config('security.max_upload_size', 52428800)) {
            throw new \RuntimeException('File size exceeds maximum allowed size.');
        }

        // Scan with ClamAV if enabled
        if (config('security.clamav.scan_enabled', true)) {
            $this->scanWithClamAV($uploadedFile->getRealPath());
        }

        $storedName = $this->security->generateSecureFilename($uploadedFile->getClientOriginalName());
        $relativePath = 'user_' . $user->id;

        if ($folderId) {
            $relativePath .= '/folder_' . $folderId;
        }

        $path = $uploadedFile->storeAs($relativePath, $storedName, 'private');

        $checksum = hash_file('sha256', $uploadedFile->getRealPath());

        $file = File::create([
            'user_id' => $user->id,
            'folder_id' => $folderId,
            'original_name' => $uploadedFile->getClientOriginalName(),
            'stored_name' => $storedName,
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
            'path' => $path,
            'is_encrypted' => true,
            'checksum_sha256' => $checksum,
        ]);

        ActivityLog::log($user->id, 'upload', request()->ip(), request()->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $uploadedFile->getClientOriginalName(),
            'size' => $uploadedFile->getSize(),
            'folder_id' => $folderId,
        ]);

        // Clear cache
        cache()->forget('user_files_' . $user->id);

        return $file;
    }

    public function download(User $user, File $file): array
    {
        $filePath = $file->path;

        if (!Storage::disk('private')->exists($filePath)) {
            throw new \RuntimeException('File not found on storage.');
        }

        $file->increment('download_count');

        ActivityLog::log($user->id, 'download', request()->ip(), request()->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
        ]);

        return [
            'path' => Storage::disk('private')->path($filePath),
            'name' => $file->original_name,
            'mime' => $file->mime_type,
        ];
    }

    public function softDelete(User $user, File $file): void
    {
        $file->delete();

        ActivityLog::log($user->id, 'delete', request()->ip(), request()->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
            'soft_delete' => true,
        ]);

        cache()->forget('user_files_' . $user->id);
    }

    public function restore(User $user, File $file): void
    {
        $file->restore();

        ActivityLog::log($user->id, 'restore', request()->ip(), request()->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
        ]);

        cache()->forget('user_files_' . $user->id);
    }

    public function permanentDelete(User $user, File $file): void
    {
        // Actually delete file from storage
        if (Storage::disk('private')->exists($file->path)) {
            Storage::disk('private')->delete($file->path);
        }

        ActivityLog::log($user->id, 'permanent_delete', request()->ip(), request()->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
        ]);

        $file->forceDelete();

        cache()->forget('user_files_' . $user->id);
    }

    public function bulkDelete(User $user, array $fileIds, bool $permanent = false): int
    {
        $count = 0;
        $files = File::whereIn('uuid', $fileIds)
            ->where('user_id', $user->id)
            ->get();

        foreach ($files as $file) {
            if ($permanent) {
                $this->permanentDelete($user, $file);
            } else {
                $this->softDelete($user, $file);
            }
            $count++;
        }

        if ($count > 0) {
            cache()->forget('user_files_' . $user->id);
        }

        return $count;
    }

    public function cleanupExpiredSoftDeletes(): int
    {
        $retentionDays = config('security.soft_delete_retention_days', 30);
        $cutoff = now()->subDays($retentionDays);

        $files = File::onlyTrashed()->where('deleted_at', '<', $cutoff)->get();
        $count = 0;

        foreach ($files as $file) {
            if (Storage::disk('private')->exists($file->path)) {
                Storage::disk('private')->delete($file->path);
            }
            $file->forceDelete();
            $count++;
        }

        return $count;
    }

    protected function scanWithClamAV(string $filePath): void
    {
        $socket = config('security.clamav.socket', 'unix:///var/run/clamav/clamd.ctl');

        // Try unix socket first, fallback to clamscan command
        if (str_starts_with($socket, 'unix://')) {
            $process = new Process(['clamdscan', '--fdpass', '--stream', $filePath]);
        } else {
            $process = new Process(['clamscan', '--no-summary', $filePath]);
        }

        try {
            $process->run();

            if (!$process->isSuccessful()) {
                $exitCode = $process->getExitCode();
                if ($exitCode === 1) {
                    throw new \RuntimeException('Virus detected in uploaded file. Upload rejected.');
                }
                // Exit code 2 means error running clamav - log but don't block
                Log::warning('ClamAV scan error', [
                    'file' => $filePath,
                    'exit_code' => $exitCode,
                    'output' => $process->getErrorOutput(),
                ]);
            }
        } catch (ProcessFailedException $e) {
            Log::warning('ClamAV process failed', [
                'file' => $filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
