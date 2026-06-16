<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class FileValidationService
{
    /**
     * Validate MIME type using finfo (magic bytes), not just extension.
     */
    public function validateMimeType(UploadedFile $file): bool
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedMime = finfo_file($finfo, $file->getRealPath());
        finfo_close($finfo);

        $allowedMimes = array_values(config('security.allowed_mimes', []));

        return in_array($detectedMime, $allowedMimes, true);
    }

    /**
     * Get the actual MIME type of a file.
     */
    public function detectMimeType(string $filePath): string
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        return $mime;
    }

    /**
     * Verify file integrity by comparing stored checksum.
     */
    public function verifyChecksum(string $filePath, string $expectedChecksum): bool
    {
        if (!file_exists($filePath)) {
            return false;
        }

        $actualChecksum = hash_file('sha256', $filePath);
        return hash_equals($expectedChecksum, $actualChecksum);
    }

    /**
     * Validate uploaded file comprehensively.
     */
    public function validate(UploadedFile $file): array
    {
        $errors = [];

        // Validate MIME type
        if (!$this->validateMimeType($file)) {
            $detectedMime = $this->detectMimeType($file->getRealPath());
            $errors[] = "File type '{$detectedMime}' is not allowed. Allowed types: " . implode(', ', config('security.allowed_extensions', []));
        }

        // Validate size
        $maxSize = config('security.max_upload_size', 52428800);
        if ($file->getSize() > $maxSize) {
            $errors[] = "File size ({$file->getSize()} bytes) exceeds maximum ({$maxSize} bytes).";
        }

        // Validate extension
        $ext = strtolower($file->getClientOriginalExtension());
        $allowedExtensions = config('security.allowed_extensions', []);
        if (!in_array($ext, $allowedExtensions)) {
            $errors[] = "File extension '.{$ext}' is not allowed.";
        }

        return $errors;
    }
}
