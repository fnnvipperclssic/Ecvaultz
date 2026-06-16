<?php

namespace App\Jobs;

use App\Models\File;
use App\Models\User;
use App\Services\FileEncryptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessFileUpload implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300; // 5 minutes

    public function __construct(
        public int $fileId,
        public int $userId,
    ) {}

    public function handle(FileEncryptionService $encryption): void
    {
        $file = File::findOrFail($this->fileId);
        $user = User::findOrFail($this->userId);

        $userKey = $encryption->getUserKey($user);
        $filePath = Storage::disk('private')->path($file->path);

        if (!file_exists($filePath)) {
            Log::error('ProcessFileUpload: File not found', [
                'file_id' => $this->fileId,
                'path' => $filePath,
            ]);
            return;
        }

        // Verify checksum before encryption
        $currentChecksum = hash_file('sha256', $filePath);
        if ($file->checksum_sha256 && !hash_equals($file->checksum_sha256, $currentChecksum)) {
            Log::error('ProcessFileUpload: Checksum mismatch before encryption', [
                'file_id' => $this->fileId,
                'expected' => $file->checksum_sha256,
                'actual' => $currentChecksum,
            ]);
            return;
        }

        // Encrypt file
        $encryption->encryptFile($filePath, $userKey);

        Log::info('ProcessFileUpload: File encrypted successfully', [
            'file_id' => $this->fileId,
        ]);
    }
}
