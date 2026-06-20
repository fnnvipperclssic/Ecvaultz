<?php

namespace App\Services;

use App\Models\File;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

/**
 * Core file operations: upload, download, soft-delete, permanent delete, and bulk actions.
 *
 * Upload pipeline: extension check → MIME validation (finfo) → ClamAV scan (if enabled)
 * → store to private disk → SHA-256 checksum → AES-256-GCM encrypt at rest → DB record.
 *
 * Download pipeline: locate encrypted file → decrypt to temp → verify SHA-256 checksum
 * → stream to browser. Temp file cleaned up after response is sent.
 */
class FileService
{
    protected SecurityService $security;
    protected FileValidationService $fileValidator;
    protected FileEncryptionService $encryption;

    public function __construct(SecurityService $security)
    {
        $this->security = $security;
        $this->fileValidator = new FileValidationService();
        $this->encryption = new FileEncryptionService();
    }

    public function upload(User $user, UploadedFile $uploadedFile, ?int $folderId = null): File
    {
        if (!$this->security->validateFileExtension($uploadedFile->getClientOriginalName())) {
            throw new \RuntimeException('File type not allowed.');
        }

        // Validate MIME type using content analysis (finfo)
        if (!$this->fileValidator->validateMimeType($uploadedFile)) {
            $actualMime = $this->fileValidator->detectMimeType($uploadedFile->getRealPath());
            throw new \RuntimeException("File content type '{$actualMime}' does not match allowed types.");
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
        $storedFullPath = Storage::disk('private')->path($path);

        // Strip EXIF/metadata from images for privacy
        $this->stripExif($storedFullPath, $uploadedFile->getMimeType());

        $checksum = hash_file('sha256', $storedFullPath);

        // Encrypt file at rest using per-user encryption key (AES-256-GCM)
        $userKey = $this->encryption->getUserKey($user);
        $this->encryption->encryptFile(
            Storage::disk('private')->path($path),
            $userKey
        );

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

        // Verify file integrity via checksum
        $fullPath = Storage::disk('private')->path($filePath);

        // Decrypt file for download using per-user encryption key
        $userKey = $this->encryption->getUserKey($user);
        try {
            $decryptedPath = $this->encryption->decryptFileToTemp($fullPath, $userKey);
        } catch (\RuntimeException $e) {
            ActivityLog::log($user->id, 'decryption_failed', request()->ip(), request()->userAgent(), [
                'file_uuid' => $file->uuid,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('File decryption failed. Please contact support.');
        }

        // Verify checksum on decrypted content
        if ($file->checksum_sha256) {
            $decryptedChecksum = hash_file('sha256', $decryptedPath);
            if (!hash_equals($file->checksum_sha256, $decryptedChecksum)) {
                unlink($decryptedPath);
                ActivityLog::log($user->id, 'checksum_mismatch', request()->ip(), request()->userAgent(), [
                    'file_uuid' => $file->uuid,
                    'original_name' => $file->original_name,
                    'expected_checksum' => $file->checksum_sha256,
                    'actual_checksum' => $decryptedChecksum,
                ]);
                throw new \RuntimeException('File integrity check failed. Please contact support.');
            }
        }

        $file->increment('download_count');

        ActivityLog::log($user->id, 'download', request()->ip(), request()->userAgent(), [
            'file_uuid' => $file->uuid,
            'original_name' => $file->original_name,
        ]);

        return [
            'path' => $decryptedPath,
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

    /**
     * Strip EXIF metadata from JPEG/PNG/TIFF images for privacy.
     * Only processes image MIME types; other files are left untouched.
     */
    protected function stripExif(string $filePath, string $mimeType): void
    {
        $imageTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
        if (!in_array($mimeType, $imageTypes) || !extension_loaded('gd')) {
            return;
        }

        try {
            $img = match ($mimeType) {
                'image/jpeg' => imagecreatefromjpeg($filePath),
                'image/png'  => imagecreatefrompng($filePath),
                'image/webp' => imagecreatefromwebp($filePath),
                default      => null,
            };

            if (!$img) return;

            // Re-save without EXIF by creating a fresh image
            match ($mimeType) {
                'image/jpeg' => imagejpeg($img, $filePath, 92),
                'image/png'  => imagepng($img, $filePath, 8),
                'image/webp' => imagewebp($img, $filePath, 85),
                default      => null,
            };

            imagedestroy($img);
        } catch (\Throwable $e) {
            Log::warning('EXIF stripping failed, continuing with original file', [
                'path' => $filePath,
                'error' => $e->getMessage(),
            ]);
        }
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
