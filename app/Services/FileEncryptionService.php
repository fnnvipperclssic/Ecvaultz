<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Crypt;

/**
 * Handles AES-256-GCM encryption and decryption of user files.
 *
 * Each user gets a unique 256-bit key generated at registration,
 * stored in the database encrypted with the application's master key (APP_KEY).
 * Files are encrypted on upload and decrypted on-the-fly during download.
 *
 * The encrypted file format is: [12-byte IV] + [16-byte auth tag] + [ciphertext]
 */
class FileEncryptionService
{
    private const CIPHER    = 'aes-256-gcm';
    private const IV_LENGTH  = 12;  // GCM standard nonce size
    private const TAG_LENGTH = 16;  // 128-bit authentication tag
    private const KEY_LENGTH = 32;  // 256-bit symmetric key

    /**
     * Generate a fresh 256-bit key encoded as base64 for storage.
     */
    public function generateUserKey(): string
    {
        return base64_encode(random_bytes(self::KEY_LENGTH));
    }

    /**
     * Retrieve a user's decrypted encryption key. If they don't have one yet
     * (e.g. legacy users), generate and persist a new one on the fly.
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
     * Encrypt raw content with a given key. Returns the binary blob
     * [IV || TAG || CIPHERTEXT] that gets written to disk.
     */
    public function encrypt(string $plaintext, string $key): string
    {
        $iv  = random_bytes(self::IV_LENGTH);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext, self::CIPHER, $key,
            OPENSSL_RAW_DATA, $iv, $tag, '', self::TAG_LENGTH
        );

        if ($ciphertext === false) {
            throw new \RuntimeException('File encryption failed: ' . openssl_error_string());
        }

        return $iv . $tag . $ciphertext;
    }

    /**
     * Reverse an encrypt() call — extracts IV, tag, and ciphertext, then decrypts.
     */
    public function decrypt(string $encryptedData, string $key): string
    {
        if (strlen($encryptedData) < (self::IV_LENGTH + self::TAG_LENGTH)) {
            throw new \RuntimeException('Invalid encrypted data: too short.');
        }

        $iv         = substr($encryptedData, 0, self::IV_LENGTH);
        $tag        = substr($encryptedData, self::IV_LENGTH, self::TAG_LENGTH);
        $ciphertext = substr($encryptedData, self::IV_LENGTH + self::TAG_LENGTH);

        $plaintext = openssl_decrypt(
            $ciphertext, self::CIPHER, $key,
            OPENSSL_RAW_DATA, $iv, $tag
        );

        if ($plaintext === false) {
            throw new \RuntimeException('File decryption failed: ' . openssl_error_string());
        }

        return $plaintext;
    }

    /**
     * Read a file from disk, encrypt its contents in-place.
     * The file at $filePath is overwritten with the encrypted blob.
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
     * Decrypt a file from disk and return the plaintext as a string.
     * Best for smaller files; for large payloads use decryptFileToTemp() instead.
     */
    public function decryptFile(string $filePath, string $key): string
    {
        if (!file_exists($filePath)) {
            throw new \RuntimeException('File not found for decryption: ' . $filePath);
        }

        return $this->decrypt(file_get_contents($filePath), $key);
    }

    /**
     * Decrypt the file to a temporary location so it can be streamed to the
     * browser without holding the entire plaintext in memory.
     *
     * Caller is responsible for cleaning up the temp file after use.
     */
    public function decryptFileToTemp(string $filePath, string $key): string
    {
        $decrypted = $this->decryptFile($filePath, $key);
        $tempPath  = tempnam(sys_get_temp_dir(), 'ecvaultz_dec_');
        file_put_contents($tempPath, $decrypted);
        return $tempPath;
    }
}
