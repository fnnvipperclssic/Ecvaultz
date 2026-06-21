<?php

/**
 * Integrity Check Command — File SHA-256 Verification
 *
 * Menerapkan OWASP A08 (Software & Data Integrity Failures) dengan
 * memverifikasi checksum SHA-256 semua file yang tersimpan.
 *
 * Cara kerja:
 * 1. Iterasi semua file di database
 * 2. Hitung ulang SHA-256 hash dari file yang tersimpan di disk
 * 3. Bandingkan dengan checksum yang tercatat di database
 * 4. Laporkan mismatch (kemungkinan korupsi data atau tampering)
 *
 * Usage:
 *   php artisan ecvaultz:integrity-check              (semua file)
 *   php artisan ecvaultz:integrity-check --user=1      (file milik user tertentu)
 *   php artisan ecvaultz:integrity-check --fix          (update checksum di DB)
 *
 * @package App\Console\Commands
 * @security OWASP A08 — Data integrity verification
 */

namespace App\Console\Commands;

use App\Models\File;
use App\Services\FileEncryptionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class IntegrityCheck extends Command
{
    protected $signature = 'ecvaultz:integrity-check
                            {--user= : Filter by user ID}
                            {--fix : Update checksum di database jika mismatch (gunakan dengan hati-hati)}';

    protected $description = 'Verify SHA-256 integrity of all stored files (OWASP A08)';

    /**
     * Execute integrity check.
     */
    public function handle(): int
    {
        $this->info('Starting file integrity check...');
        $this->newLine();

        $query = File::query();

        // Filter by user jika opsi --user diberikan
        if ($userId = $this->option('user')) {
            $query->where('user_id', $userId);
            $this->info("Filtering for user ID: {$userId}");
        }

        $files = $query->cursor(); // Gunakan cursor untuk memory efficiency
        $total = $query->count();

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $verified = 0;
        $mismatches = 0;
        $missing = 0;
        $skipped = 0;

        $mismatchFiles = [];

        /** @var File $file */
        foreach ($files as $file) {
            $storedPath = storage_path('app/private/' . $file->path);

            // Cek file exists di disk
            if (!file_exists($storedPath)) {
                $missing++;
                $this->warn("\nFile missing on disk: {$file->uuid} — {$file->original_name}");
                Log::warning('Integrity check: file missing', [
                    'file_uuid' => $file->uuid,
                    'original_name' => $file->original_name,
                    'stored_path' => $file->path,
                ]);
                $bar->advance();
                continue;
            }

            // Baca file content (untuk file terenkripsi, kita hitung checksum dari ciphertext)
            // karena checksum disimpan pre-encryption
            $fileContent = @file_get_contents($storedPath);

            if ($fileContent === false) {
                $skipped++;
                Log::warning('Integrity check: cannot read file', [
                    'file_uuid' => $file->uuid,
                    'stored_path' => $file->path,
                ]);
                $bar->advance();
                continue;
            }

            // Hitung SHA-256
            $calculatedHash = hash('sha256', $fileContent);

            // Bandingkan dengan checksum di database
            if ($calculatedHash !== $file->checksum_sha256) {
                $mismatches++;
                $mismatchFiles[] = [
                    'uuid' => $file->uuid,
                    'name' => $file->original_name,
                    'db_hash' => $file->checksum_sha256,
                    'file_hash' => $calculatedHash,
                ];

                Log::warning('Integrity check: checksum mismatch', [
                    'file_uuid' => $file->uuid,
                    'original_name' => $file->original_name,
                    'db_checksum' => $file->checksum_sha256,
                    'actual_checksum' => $calculatedHash,
                ]);

                if ($this->option('fix')) {
                    $file->updateQuietly(['checksum_sha256' => $calculatedHash]);
                    $this->warn("\nUpdated checksum for: {$file->original_name}");
                }
            } else {
                $verified++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info('═══════════════════════════════════════');
        $this->info('  Integrity Check Summary');
        $this->info('═══════════════════════════════════════');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total files checked', (string) $total],
                ['✅ Verified (checksum OK)', (string) $verified],
                ['❌ Checksum mismatch', (string) $mismatches],
                ['⚠️  File missing on disk', (string) $missing],
                ['⏭️  Skipped (unreadable)', (string) $skipped],
            ]
        );

        // Detail mismatches
        if (!empty($mismatchFiles)) {
            $this->newLine();
            $this->error('Checksum mismatches detected!');
            $this->table(
                ['File UUID', 'Name', 'DB Hash', 'File Hash'],
                array_map(fn ($m) => [
                    $m['uuid'],
                    $m['name'],
                    substr($m['db_hash'], 0, 16) . '...',
                    substr($m['file_hash'], 0, 16) . '...',
                ], $mismatchFiles)
            );

            if ($this->option('fix')) {
                $this->warn('Checksums have been updated in the database (--fix mode).');
            } else {
                $this->warn('Run with --fix to update checksums in the database.');
            }
        }

        if ($mismatches === 0 && $missing === 0) {
            $this->info('✅ All files passed integrity verification.');
        }

        // Return exit code: 0 = success, 1 = issues found
        return ($mismatches > 0 || $missing > 0) ? 1 : 0;
    }
}
