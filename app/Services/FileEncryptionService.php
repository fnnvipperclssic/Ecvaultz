<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Crypt;

class FileEncryptionService
{
    private const CIPHER = 'aes-256-gcm';
    private const IV_LENGTH = 12; // 96 bits for GCM
    private const TAG_LENGTH = 16; // 128 bits auth tag
    private const KEY_LENGTH = 32; // 256 bits

    /**
     * Generate a new encryption key for a user.
     */
    public function generateUserKey(): string
    {
        return base64_encode(random_bytes(self::KEY_LENGTH));
    }

    /**
     * Get the decrypted encryption key for a user.
     * If user doesn't have one, generate and store it.
     */
    public function getUserKey(User $user): string
    {
        if (empty($user->encryption_key)) {
            $rawKey = $this->generateUserKey();
            $user->encryption_key = Crypt::encryptString($rawKey);
            $user->save();
            return $rawKey;
        }

        return Crypt::decryptString($user->encryption_key);
    }

    /**
     * Encrypt file content using AES-256-GCM.
     * Returns encrypted content with IV + tag prepended.
     */
    public function encrypt(string $plaintext, string $key): string
    {
        $iv = random_bytes(self::IV_LENGTH);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            self::TAG_LENGTH
        );

        if ($ciphertext === false) {
            throw new \RuntimeException('File encryption failed: ' . openssl_error_string());
        }

        // Format: IV (12 bytes) + TAG (16 bytes) + CIPHERTEXT
        return $iv . $tag . $ciphertext;
    }

    /**
     * Decrypt file content.
     */
    public function decrypt(string $encryptedData, string $key): string
    {
        if (strlen($encryptedData) < (self::IV_LENGTH + self::TAG_LENGTH)) {
            throw new \RuntimeException('Invalid encrypted data: too short.');
        }

        $iv = substr($encryptedData, 0, self::IV_LENGTH);
        $tag = substr($encryptedData, self::IV_LENGTH, self::TAG_LENGTH);
        $ciphertext = substr($encryptedData, self::IV_LENGTH + self::TAG_LENGTH);

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            throw new \RuntimeException('File decryption failed: ' . openssl_error_string());
        }

        return $plaintext;
    }

    /**
     * Encrypt a file on disk and replace it.
     * Returns the new file path (same path, encrypted content).
     */
    public function encryptFile(string $filePath, string $key): void
    {
        if (!file_exists($filePath)) {
            throw new \RuntimeException('File not found for encryption: ' . $filePath);
        }

        $plaintext = file_get_contents($filePath);
        $encrypted = $this->encrypt($plaintext, $key);
        file_put_contents($filePath, $encrypted);
    }

    /**
     * Decrypt a file and return its plaintext content.
     * For large files, use decryptFileStream instead.
     */
    public function decryptFile(string $filePath, string $key): string
    {
        if (!file_exists($filePath)) {
            throw new \RuntimeException('File not found for decryption: ' . $filePath);
        }

        $encryptedData = file_get_contents($filePath);
        return $this->decrypt($encryptedData, $key);
    }

    /**
     * Stream-decrypt a file and return a temporary path to the decrypted content.
     */
    public function decryptFileToTemp(string $filePath, string $key): string
    {
        $decrypted = $this->decryptFile($filePath, $key);
        $tempPath = tempnam(sys_get_temp_dir(), 'ecvaultz_dec_');
        file_put_contents($tempPath, $decrypted);
        return $tempPath;
    }
}
