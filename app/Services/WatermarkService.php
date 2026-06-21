<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Adds dynamic watermarks to images and PDFs for shared/preview contexts.
 *
 * Watermarks include viewer email, timestamp, IP address, and "CONFIDENTIAL"
 * text, repeated diagonally across the content to deter unauthorized sharing.
 */
class WatermarkService
{
    private const WATERMARK_TEXT = 'CONFIDENTIAL';
    private const CACHE_PREFIX = 'watermarked_';
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Add a watermark to the given file.
     *
     * @param string $filePath  Absolute path to the original (plaintext) file.
     * @param string $mimeType  MIME type of the file (image/jpeg, image/png, application/pdf, etc.)
     * @param array  $info      Associative array with keys: email, timestamp, ip
     * @return string           Path to the watermarked file (temporary).
     */
    public function addWatermark(string $filePath, string $mimeType, array $info): string
    {
        $watermarkText = $this->buildWatermarkText($info);

        if (str_starts_with($mimeType, 'image/')) {
            return $this->watermarkImage($filePath, $mimeType, $watermarkText);
        }

        if ($mimeType === 'application/pdf') {
            return $this->watermarkPdf($filePath, $watermarkText);
        }

        // Fallback: return original unmodified for unsupported types
        return $filePath;
    }

    /**
     * Build the multi-line watermark string from viewer info.
     */
    protected function buildWatermarkText(array $info): string
    {
        return implode(' | ', [
            self::WATERMARK_TEXT,
            $info['email'] ?? 'unknown@user',
            $info['timestamp'] ?? now()->toIso8601String(),
            'IP: ' . ($info['ip'] ?? request()->ip() ?? '0.0.0.0'),
        ]);
    }

    /**
     * Apply watermark to an image using GD.
     */
    protected function watermarkImage(string $filePath, string $mimeType, string $text): string
    {
        if (!extension_loaded('gd')) {
            Log::warning('GD extension not available, skipping image watermark');
            return $filePath;
        }

        $image = match ($mimeType) {
            'image/jpeg' => @imagecreatefromjpeg($filePath),
            'image/png'  => @imagecreatefrompng($filePath),
            'image/webp' => @imagecreatefromwebp($filePath),
            'image/gif'  => @imagecreatefromgif($filePath),
            default      => null,
        };

        if (!$image) {
            Log::warning('Failed to create image resource for watermarking', ['mime' => $mimeType]);
            return $filePath;
        }

        $width = imagesx($image);
        $height = imagesy($image);

        // Allocate semi-transparent color (white with ~30% opacity)
        $overlay = imagecreatetruecolor($width, $height);
        imagesavealpha($overlay, true);
        $transparent = imagecolorallocatealpha($overlay, 0, 0, 0, 127);
        imagefill($overlay, 0, 0, $transparent);

        // Watermark color: white with alpha (0 = opaque, 80 = very transparent)
        $watermarkColor = imagecolorallocatealpha($overlay, 255, 255, 255, 80);

        // Font size scales with image dimensions
        $fontSize = max(8, min(24, (int) round(min($width, $height) / 30)));

        // Try to use a built-in font or a system font
        $font = 5; // built-in GD font (largest built-in)

        // Calculate approximate text dimensions
        $charWidth = imagefontwidth($font);
        $charHeight = imagefontheight($font);
        $lineLength = strlen($text);
        $textWidth = $charWidth * $lineLength;
        $textHeight = $charHeight;

        // Repeat watermark diagonally across the image
        $spacing = max($textWidth, 200) * 1.5;
        $angle = 0; // No rotation for built-in fonts (they don't support angles)

        for ($x = -$width; $x < $width * 2; $x += $spacing) {
            for ($y = -$height; $y < $height * 2; $y += $spacing) {
                imagestring($overlay, $font, (int) ($x + $y * 0.3) % (int) $spacing + 20, (int) $y, $text, $watermarkColor);
            }
        }

        // Merge overlay onto original
        imagecopy($image, $overlay, 0, 0, 0, 0, $width, $height);

        // Save watermarked version to temporary file
        $tempPath = tempnam(sys_get_temp_dir(), 'ecvaultz_wm_');
        match ($mimeType) {
            'image/jpeg' => imagejpeg($image, $tempPath, 90),
            'image/png'  => imagepng($image, $tempPath, 6),
            'image/webp' => imagewebp($image, $tempPath, 85),
            'image/gif'  => imagegif($image, $tempPath),
            default      => null,
        };

        imagedestroy($image);
        imagedestroy($overlay);

        return $tempPath;
    }

    /**
     * Apply watermark to a PDF.
     *
     * PDF watermarking requires a dedicated library (FPDI, mPDF, TCPDF, etc.)
     * for proper implementation. For now, PDFs are returned unmodified since
     * the raw-PDF approach produced structurally invalid files.
     *
     * TODO: Integrate a PDF library for proper watermark overlay on PDF files.
     */
    protected function watermarkPdf(string $filePath, string $text): string
    {
        Log::info('PDF watermarking: returning original (library required for proper PDF watermarking)', [
            'path' => $filePath,
        ]);

        return $filePath;
    }

    /**
     * Escape special characters for PDF string literals.
     */
    protected function escapePdfString(string $value): string
    {
        $value = str_replace('\\', '\\\\', $value);
        $value = str_replace('(', '\\(', $value);
        $value = str_replace(')', '\\)', $value);
        return $value;
    }
}
