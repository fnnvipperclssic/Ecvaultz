<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\FileVersion;
use App\Services\FileVersionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FileVersionController extends Controller
{
    protected FileVersionService $versionService;

    public function __construct(FileVersionService $versionService)
    {
        $this->versionService = $versionService;
    }

    /**
     * Show version history for a file.
     */
    public function index(Request $request, string $uuid): Response
    {
        $file = File::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('view', $file)) {
            abort(403);
        }

        $versions = $file->versions()
            ->with('user')
            ->get()
            ->map(fn (FileVersion $v) => [
                'id' => $v->id,
                'version_number' => $v->version_number,
                'size_human' => $v->getSizeForHumans(),
                'user_name' => $v->user?->name ?? 'Unknown',
                'created_at' => $v->created_at->format('Y-m-d H:i'),
                'created_at_human' => $v->created_at->diffForHumans(),
            ]);

        return Inertia::render('Files/VersionHistory', [
            'file' => [
                'uuid' => $file->uuid,
                'name' => $file->original_name,
            ],
            'versions' => $versions,
        ]);
    }

    /**
     * Restore a file to a previous version.
     */
    public function restore(Request $request, FileVersion $version): RedirectResponse
    {
        $file = $version->file;

        if (!Gate::allows('update', $file)) {
            abort(403);
        }

        $this->versionService->restoreVersion($version, $request->user());

        return back()->with('success', 'File restored to version ' . $version->version_number . '.');
    }

    /**
     * Compare the current file version with a specific historical version.
     *
     * Returns metadata comparison and (for text files) a line-by-line diff.
     */
    public function diff(Request $request, FileVersion $version): Response
    {
        $file = $version->file;

        if (!Gate::allows('view', $file)) {
            abort(403);
        }

        // Get current (latest) version
        $currentVersion = $file->versions()->first();

        // Build metadata comparison
        $currentMeta = [
            'version_number' => $currentVersion?->version_number ?? 'current',
            'name' => $file->original_name,
            'size' => $file->getSizeForHumans(),
            'size_bytes' => $file->size,
            'mime_type' => $file->mime_type,
            'updated_at' => $file->updated_at->format('Y-m-d H:i:s'),
        ];

        $versionMeta = [
            'version_number' => $version->version_number,
            'name' => $version->original_name,
            'size' => $version->getSizeForHumans(),
            'size_bytes' => $version->size,
            'mime_type' => $version->mime_type,
            'created_at' => $version->created_at->format('Y-m-d H:i:s'),
        ];

        // Check if both are text files and attempt content comparison
        $contentDiff = null;
        $isTextFile = $this->isTextMime($file->mime_type) && $this->isTextMime($version->mime_type);

        if ($isTextFile) {
            $currentPath = $currentVersion && Storage::disk('private')->exists($currentVersion->path)
                ? Storage::disk('private')->path($currentVersion->path)
                : null;

            $versionPath = Storage::disk('private')->exists($version->path)
                ? Storage::disk('private')->path($version->path)
                : null;

            if ($currentPath && $versionPath && file_exists($currentPath) && file_exists($versionPath)) {
                try {
                    $encryptionService = app(\App\Services\FileEncryptionService::class);
                    $user = $request->user();
                    $userKey = $encryptionService->getUserKey($user);

                    $currentContent = $encryptionService->decryptFile($currentPath, $userKey);
                    $versionContent = $encryptionService->decryptFile($versionPath, $userKey);

                    $contentDiff = $this->computeDiff($versionContent, $currentContent);
                } catch (\RuntimeException $e) {
                    $contentDiff = ['error' => 'Could not decrypt file contents for comparison.'];
                }
            } else {
                $contentDiff = ['error' => 'Source files not found on storage for content comparison.'];
            }
        }

        return Inertia::render('Files/VersionDiff', [
            'file' => [
                'uuid' => $file->uuid,
                'name' => $file->original_name,
            ],
            'currentVersion' => $currentMeta,
            'comparedVersion' => $versionMeta,
            'contentDiff' => $contentDiff,
            'isTextFile' => $isTextFile,
        ]);
    }

    /**
     * Compute a simple line-by-line diff between two text strings.
     *
     * Returns an array of lines with type annotations:
     * - 'unchanged': present in both
     * - 'added': only in the new version
     * - 'removed': only in the old version
     */
    protected function computeDiff(string $oldText, string $newText): array
    {
        $oldLines = explode("\n", $oldText);
        $newLines = explode("\n", $newText);

        // Simple line-by-line diff using LCS (Longest Common Subsequence) approach
        $diff = [];

        $oldCount = count($oldLines);
        $newCount = count($newLines);

        // Build LCS table
        $lcs = array_fill(0, $oldCount + 1, array_fill(0, $newCount + 1, 0));

        for ($i = 1; $i <= $oldCount; $i++) {
            for ($j = 1; $j <= $newCount; $j++) {
                if ($oldLines[$i - 1] === $newLines[$j - 1]) {
                    $lcs[$i][$j] = $lcs[$i - 1][$j - 1] + 1;
                } else {
                    $lcs[$i][$j] = max($lcs[$i - 1][$j], $lcs[$i][$j - 1]);
                }
            }
        }

        // Backtrack to find the diff
        $i = $oldCount;
        $j = $newCount;
        $diffParts = [];

        while ($i > 0 || $j > 0) {
            if ($i > 0 && $j > 0 && $oldLines[$i - 1] === $newLines[$j - 1]) {
                array_unshift($diffParts, [
                    'type' => 'unchanged',
                    'content' => $oldLines[$i - 1],
                    'oldLine' => $i,
                    'newLine' => $j,
                ]);
                $i--;
                $j--;
            } elseif ($j > 0 && ($i === 0 || $lcs[$i][$j - 1] >= $lcs[$i - 1][$j])) {
                array_unshift($diffParts, [
                    'type' => 'added',
                    'content' => $newLines[$j - 1],
                    'newLine' => $j,
                ]);
                $j--;
            } elseif ($i > 0) {
                array_unshift($diffParts, [
                    'type' => 'removed',
                    'content' => $oldLines[$i - 1],
                    'oldLine' => $i,
                ]);
                $i--;
            }
        }

        return $diffParts;
    }

    /**
     * Determine if a MIME type represents a text-based file suitable for diff.
     */
    protected function isTextMime(string $mimeType): bool
    {
        $textTypes = [
            'text/plain',
            'text/html',
            'text/css',
            'text/javascript',
            'text/xml',
            'application/json',
            'application/xml',
            'application/javascript',
            'application/x-www-form-urlencoded',
            'text/markdown',
            'text/csv',
            'text/tab-separated-values',
            'application/yaml',
            'application/x-yaml',
            'text/x-php',
            'text/x-python',
            'text/x-java',
            'text/x-c',
            'text/x-c++',
            'text/x-shellscript',
        ];

        // Check if starts with text/ or is a known text-based application type
        if (str_starts_with($mimeType, 'text/')) {
            return true;
        }

        return in_array($mimeType, $textTypes, true);
    }
}
