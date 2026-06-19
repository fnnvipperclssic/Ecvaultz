# Security-Inform — Analisis Keamanan & Kerentanan Ecvaultz

> **File ini berisi analisis keamanan menyeluruh, kerentanan yang teridentifikasi, dan rekomendasi mitigasi.**
> **Sifat: RAHASIA — Hanya untuk tim development. Jangan di-commit ke public repository.**

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Kerentanan KRITIS](#2-kerentanan-kritis)
3. [Kerentanan HIGH](#3-kerentanan-high)
4. [Kerentanan MEDIUM](#4-kerentanan-medium)
5. [Kerentanan LOW](#5-kerentanan-low)
6. [Analisis Attack Surface](#6-analisis-attack-surface)
7. [Analisis Threat Model](#7-analisis-threat-model)
8. [Hardening Checklist](#8-hardening-checklist)
9. [Regulatory Compliance Gap Analysis](#9-regulatory-compliance-gap-analysis)

---

## 1. Ringkasan Eksekutif

| Severity | Jumlah Temuan |
|---|---|
| 🔴 KRITIS | 5 |
| 🟠 HIGH | 6 |
| 🟡 MEDIUM | 9 |
| 🟢 LOW | 5 |
| **TOTAL** | **25** |

**Kesimpulan Umum:** Aplikasi Ecvaultz memiliki fondasi keamanan yang baik (security headers, rate limiting, 2FA, password policy), namun terdapat **celah kritis pada klaim enkripsi file yang tidak benar-benar diimplementasikan**. Sebagai "brankas digital", ketiadaan enkripsi file sesungguhnya adalah kelemahan fundamental. Selain itu, terdapat beberapa vektor serangan lain yang perlu segera dimitigasi.

---

## 2. Kerentanan KRITIS

### 2.1 [C-001] File Disimpan Plaintext — Enkripsi Palsu
**CVSS Score (perkiraan):** 9.1 (AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:N)

**Deskripsi:**
File yang di-upload melalui `FileService::upload()` disimpan di disk tanpa enkripsi apapun. Flag `is_encrypted = true` di database adalah **klaim palsu**. Tidak ada proses enkripsi/dekripsi di seluruh codebase.

```php
// FileService.php line 46-59
$path = $uploadedFile->storeAs($relativePath, $storedName, 'private');
// ...
$file = File::create([
    // ...
    'is_encrypted' => true, // <-- HANYA FLAG, TIDAK ADA ENKRIPSI
    'checksum_sha256' => $checksum,
]);
```

**Dampak:**
- Attacker dengan akses filesystem dapat membaca semua file
- Jika storage disk bocor secara tidak sengaja (misconfig S3 bucket), semua file terekspos
- Klaim "maximum security" adalah menyesatkan

**Eksploitasi:**
Cukup dengan akses file langsung:
```bash
cat storage/app/private/user_1/<stored_name>
```

**Rekomendasi Mitigasi:**
1. Implementasi enkripsi file dengan `sodium_crypto_secretbox` (libsodium) — AES-256-GCM
2. Generate per-user encryption key, enkripsi dengan master key aplikasi
3. Enkripsi saat upload, dekripsi on-the-fly saat download
4. Hapus flag `is_encrypted` atau ganti menjadi validasi hasil enkripsi

**Referensi:**
- PHP Libsodium: `sodium_crypto_secretbox`, `sodium_crypto_secretbox_open`
- Laravel Encryption: `Crypt::encrypt()` / `Crypt::decrypt()` (hanya untuk data kecil)

---

### 2.2 [C-002] Share Link Token Plaintext di Database
**CVSS Score (perkiraan):** 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

**Deskripsi:**
`share_link_token` di tabel `file_shares` disimpan sebagai plaintext. Token ini digunakan untuk lookup share:
```php
// ShareController.php line 181-183
$share = FileShare::where('share_link_token', $token)
    ->with('file')
    ->firstOrFail();
```

**Dampak:**
- Jika database bocor (SQL injection, backup exposure, misconfig), semua share link bisa diakses
- Attacker bisa langsung download semua file yang di-share eksternal
- Share link password menjadi satu-satunya proteksi untuk file yang di-share

**Rekomendasi Mitigasi:**
Hash `share_link_token` dengan SHA-256 saat disimpan:
```php
$shareData['share_link_token'] = hash('sha256', $token);
```
Saat lookup, bandingkan hash:
```php
$share = FileShare::where('share_link_token', hash('sha256', $token))->firstOrFail();
```
**Perhatian:** Ini berarti token asli hanya ditampilkan sekali (saat dibuat). User harus menyimpan link saat itu juga.

---

### 2.3 [C-003] Validasi MIME Hanya Berbasis Ekstensi — File Masking Attack
**CVSS Score (perkiraan):** 8.1 (AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:N)

**Deskripsi:**
Validasi file hanya mengecek ekstensi nama file, bukan content-type sebenarnya:
```php
// SecurityService.php line 105-109
public function validateFileExtension(string $filename): bool
{
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return in_array($ext, config('security.allowed_extensions', []));
}
```

**Dampak:**
- File executable (`.exe`, `.sh`, `.php`) bisa di-rename ke `.pdf` dan lolos validasi
- Malware bisa dikamuflase sebagai file yang diizinkan
- Jika ada kerentanan di aplikasi client (misal preview), bisa menyebabkan RCE
- File `.php` yang direname ke `.pdf` tidak bisa dieksekusi langsung, tapi berbahaya jika dibagikan

**Eksploitasi:**
1. Ganti nama `malware.exe` → `invoice.pdf`
2. Upload — lolos validasi ekstensi
3. Download oleh korban — eksekusi malware

**Rekomendasi Mitigasi:**
1. Gunakan `finfo` (PHP FileInfo) untuk mendeteksi MIME type sesungguhnya:
```php
$finfo = new \finfo(FILEINFO_MIME_TYPE);
$actualMime = $finfo->file($filePath);
$allowedMimes = config('security.allowed_mimes', []);
if (!in_array($actualMime, $allowedMimes)) {
    throw new \RuntimeException('File type not allowed based on content analysis.');
}
```
2. Bandingkan MIME hasil `finfo` dengan ekstensi yang diklaim
3. Config `security.allowed_mimes` sudah ada — gunakan sebagai whitelist

---

### 2.4 [C-004] Brute Force pada Login — Tidak Ada Account Lockout
**CVSS Score (perkiraan):** 7.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:H)

**Deskripsi:**
Rate limiting login hanya 5 request per menit **per IP address**. Tidak ada lockout per-account setelah percobaan gagal berulang:
```php
// RouteServiceProvider.php line 25-33
RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)
        ->by($request->ip())  // <-- HANYA BY IP, BUKAN BY ACCOUNT
        ->response(function () {
            return response()->json(['message' => 'Too many login attempts...'], 429);
        });
});
```

**Dampak:**
- Attacker dengan botnet (multiple IPs) bisa brute force tanpa batas per-account
- Menggunakan kombinasi [user] + [IP] berbeda bisa bypass rate limit
- Account takeover mungkin jika password lemah
- Tidak ada mekanisme pemberitahuan ke user saat banyak percobaan gagal

**Rekomendasi Mitigasi:**
1. Implementasi account locking: setelah 5 percobaan gagal dalam 15 menit → lock 30 menit
2. Notifikasi email ke user: "Ada N percobaan login gagal di akun Anda"
3. Rate limiting harus kombinasi IP + email/username
4. Tambahkan progressive delay (exponential backoff)
5. Pertimbangkan CAPTCHA setelah beberapa percobaan gagal

---

### 2.5 [C-005] Brute Force pada Share Link — Tidak Ada Rate Limiting
**CVSS Score (perkiraan):** 6.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

**Deskripsi:**
Route share link (`/share/{token}` dan `/share/{token}/download`) **tidak dilindungi rate limiting apapun**. Token 64-char random memang sulit ditebak, tapi:
- Jika token ditebak (misal karena PRNG weakness), tidak ada proteksi
- Password share link juga bisa di-brute force tanpa batas
- Session unlock (`share_unlocked_{id}`) tidak di-rate-limit

**Rekomendasi Mitigasi:**
1. Rate limiting pada `/share/{token}` — 10 request/menit per IP
2. Rate limiting password attempt — 5 percobaan per IP per 10 menit
3. Log dan alert untuk percobaan akses share link gagal berulang
4. Pertimbangkan token dengan entropy lebih tinggi (128 char) atau gunakan UUID v7

---

## 3. Kerentanan HIGH

### 3.1 [H-001] Session Fixation Risk — 2FA Flow
**Deskripsi:**
Pada flow 2FA, user login → session diset → logout → redirect ke 2FA challenge → setelah verifikasi → login ulang. Meskipun `session()->regenerate()` dipanggil, ada potensi race condition atau session fixation jika session ID sebelumnya bocor.

**Rekomendasi:**
- Pastikan session regenerate terjadi SEBELUM dan SESUDAH 2FA verification
- Tambahkan session fixation protection di `config/session.php`

### 3.2 [H-002] CSRF Token Ter-expose Global
**Deskripsi:**
CSRF token dishare ke frontend via Inertia props (semua halaman):
```php
'csrf_token' => csrf_token(),
```
Ini normal untuk SPA, tapi semua halaman (termasuk landing page publik) mendapatkan CSRF token.

**Rekomendasi:**
- Hanya share CSRF token untuk halaman authenticated
- Atau ini bisa dibiarkan karena memang diperlukan Inertia pattern — tapi perlu dicatat sebagai eksposur

### 3.3 [H-003] ClamAV Disabled by Default
**Deskripsi:**
ClamAV scanning diatur `SCAN_UPLOADS=false` di `.env`. Tanpa ini, malware bisa diupload tanpa deteksi.

**Rekomendasi:**
- Aktifkan `SCAN_UPLOADS=true` untuk production
- Tambahkan fallback ke scanner lain jika ClamAV tidak tersedia
- Atau integrasikan dengan cloud-based malware scanning API (VirusTotal, MetaDefender)

### 3.4 [H-004] No Rate Limiting pada 2FA Challenge
**Deskripsi:**
Rate limiter `2fa` (5 per menit) sudah didefinisikan tapi **tidak diterapkan di route**:
```php
// routes/web.php line 38
Route::post('2fa/challenge', [TwoFactorController::class, 'verifyChallenge']);
// TIDAK ADA ->middleware('throttle:2fa')
```
**Rekomendasi:** Terapkan rate limiter ke route 2FA challenge.

### 3.5 [H-005] Admin Password Hardcoded di Seeder
**Deskripsi:**
Password admin disimpan dalam plaintext di source code:
```php
// AdminUserSeeder.php line 16
'password' => Hash::make('Ecvaultz@Admin2024!'),
```

**Dampak:**
- Password admin ada di git history selamanya
- Semua developer bisa tahu password admin
- Jika source code bocor, password admin terekspos

**Rekomendasi:**
- Gunakan environment variable untuk default admin password
- Atau generate random password dan tampilkan sekali di CLI output
- Wajibkan ganti password admin saat first login

---

### 3.6 [H-006] Tidak Ada Checksum Verification saat Download
**Deskripsi:**
SHA-256 checksum dihitung saat upload (`hash_file('sha256', ...)`) tapi **tidak pernah diverifikasi saat download**. File bisa rusak atau dimodifikasi di disk tanpa terdeteksi.

**Rekomendasi:**
1. Verifikasi checksum saat download
2. Jika checksum mismatch → log alert, blokir download, notifikasi admin
3. Pertimbangkan HMAC untuk mendeteksi tampering

---

## 4. Kerentanan MEDIUM

### 4.1 [M-001] Infinite Session Lifetime untuk Share Link Password
**Deskripsi:**
Session unlock share link (`share_unlocked_{id}`) tidak memiliki expiry — sekali dibuka, berlaku seumur sesi browser.

**Rekomendasi:** Set TTL (misal 30 menit) untuk session unlock share.

### 4.2 [M-002] User Enumeration via Registration & Password Reset
**Deskripsi:**
- Registrasi: validasi `unique:users` memberi tahu bahwa email sudah terdaftar
- Password reset: response selalu sukses (sudah benar) tapi timing bisa berbeda
- Share internal: "User with this email not found" → enumerasi user terdaftar

**Rekomendasi:**
- Untuk share internal: jangan bedakan antara "email tidak ditemukan" dan "share berhasil"
- Pertimbangkan generic error message
- Implementasikan response time normalization

### 4.3 [M-003] Activity Log Tanpa Retention
**Deskripsi:**
Tidak ada mekanisme pembersihan log lama. Activity logs akan tumbuh tanpa batas dan bisa menyebabkan database bloating.

**Rekomendasi:** Tambahkan scheduled command untuk menghapus log > 90 hari (atau archive dulu).

### 4.4 [M-004] Metadata Log Berisi Data Sensitif
**Deskripsi:**
Activity log menyimpan metadata termasuk `original_name` file, IP address, user agent:
```php
ActivityLog::log($user->id, 'upload', ..., [
    'file_uuid' => $file->uuid,
    'original_name' => $uploadedFile->getClientOriginalName(),
    'size' => $uploadedFile->getSize(),
]);
```
Nama file bisa mengandung informasi sensitif (misal: "Laporan-Pecat-Karyawan.pdf").

**Rekomendasi:**
- Enkripsi kolom `metadata` di database
- Atau jangan simpan `original_name` — simpan hash saja

### 4.5 [M-005] Tidak Ada Content-Disposition Security
**Deskripsi:**
Download file tidak menyertakan header `Content-Disposition` yang mengontrol nama file. Browser akan menggunakan `original_name`:
```php
return response()->download($data['path'], $data['name'], [...]);
```

**Rekomendasi:**
- Sanitasi `original_name` sebelum digunakan sebagai download filename
- Set `Content-Disposition: attachment; filename="sanitized_name"` 
- Hindari karakter spesial yang bisa menyebabkan header injection

### 4.6 [M-006] CORS Allow Credentials with Specific Origins
**Deskripsi:**
CORS config mengizinkan credentials (`supports_credentials: true`) dengan origins spesifik. Jika `VITE_DEV_URL` tidak difilter dengan benar, bisa ada origin spoofing di dev.

**Rekomendasi:**
- Untuk production, batasi `allowed_origins` hanya ke domain production
- Jangan set `supports_credentials: true` jika tidak diperlukan
- Pertimbangkan menggunakan `allowed_origins_patterns` dengan regex ketat

### 4.7 [M-007] CSP `unsafe-inline` dan `unsafe-eval`
**Deskripsi:**
Content Security Policy mengizinkan `script-src 'unsafe-inline' 'unsafe-eval'`:
```php
"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
```
Ini melemahkan CSP secara signifikan — XSS bisa mengeksekusi inline script.

**Rekomendasi:**
- Gunakan nonce-based CSP
- Hapus `unsafe-inline` dan `unsafe-eval` jika memungkinkan
- Jika diperlukan untuk React/Inertia dev, batasi hanya untuk development environment

### 4.8 [M-008] Tidak Ada Two-Factor untuk API Token (Sanctum)
**Deskripsi:**
API routes dengan Sanctum tidak memerlukan 2FA. Token yang dicuri bisa digunakan langsung tanpa verifikasi 2FA.

**Rekomendasi:**
- Dokumentasikan bahwa API token memiliki akses penuh tanpa 2FA
- Pertimbangkan scope-based tokens (read-only, write-only)
- Token expiration yang pendek

### 4.9 [M-009] Tidak Ada File Integrity Monitoring
**Deskripsi:**
Tidak ada mekanisme untuk mendeteksi apakah file di storage telah dimodifikasi, rusak, atau terhapus secara tidak sah.

**Rekomendasi:**
- Periodik scan: bandingkan checksum di DB dengan file di disk
- Alert jika mismatch
- File audit log terpisah

---

## 5. Kerentanan LOW

### 5.1 [L-001] APP_DEBUG=true di .env (Development)
**Deskripsi:** Debug mode aktif di environment development. Ini normal untuk development, tapi pastikan TIDAK PERNAH true di production.

**Rekomendasi:** Tidak ada (normal untuk dev). Tambahkan safeguard di production deploy pipeline.

### 5.2 [L-002] Session Cookie `secure=false` di Development
**Deskripsi:** `SESSION_SECURE_COOKIE=false` di `.env` karena development menggunakan HTTP.

**Rekomendasi:** Pastikan true di production (.env production).

### 5.3 [L-003] HSTS `max-age=0` di Development
**Deskripsi:** `HSTS_MAX_AGE=0` di `.env` menonaktifkan HSTS.

**Rekomendasi:** Set ke 31536000 di production.

### 5.4 [L-004] AES-256-CBC Cipher (Bukan GCM)
**Deskripsi:** Laravel encryption cipher menggunakan `AES-256-CBC` (default). CBC tidak menyediakan built-in authentication.

**Rekomendasi:** Pertimbangkan upgrade ke GCM jika library mendukung (PHP 7.1+ via openssl, atau libsodium).

### 5.5 [L-005] Tidak Ada DNSSEC / CAA Record Guidance
**Deskripsi:** Tidak ada dokumentasi tentang konfigurasi DNS security (DNSSEC, CAA records, SPF/DKIM/DMARC untuk email).

**Rekomendasi:** Tambahkan dokumentasi deployment checklist dengan security DNS configurations.

---

## 6. Analisis Attack Surface

### Attack Surface Matrix

| Entry Point | Auth Required | Rate Limited | Input Validation | Attack Vectors |
|---|---|---|---|---|
| `POST /login` | No | Yes (5/min/IP) | Email format | Brute force, credential stuffing, user enumeration |
| `POST /register` | No | No | Strict | Mass registration, bot account creation |
| `POST /files` | Yes (2FA) | Yes (10/min) | Ext + Size only | Malware upload, MIME spoofing, resource exhaustion |
| `GET /files/{uuid}/download` | Yes (2FA) | Yes (20/min) | UUID | IDOR (via policy check) |
| `GET /share/{token}` | No | **No** | Token lookup | Token bruteforce, password bruteforce |
| `GET /share/{token}/download` | No | **No** | Session check | Unauthorized download jika session bocor |
| `POST /2fa/challenge` | No (guest) | **Not applied** | Code format | TOTP bruteforce, recovery code bruteforce |
| `POST /forgot-password` | No | Yes (3/hr) | Email format | User enumeration (timing), email bombing |
| `POST /files/bulk` | Yes (2FA) | No | Array UUIDs | Bulk data manipulation |
| `GET /secure/avatar/{user}` | Yes (2FA) | No | User model binding | IDOR (avatar akses) |

### Unprotected Surfaces:
- ⚠️ Share routes — NO rate limiting, NO auth
- ⚠️ 2FA challenge — rate limiter defined but NOT applied
- ⚠️ Registration — no rate limiting (bisa mass-registration)
- ⚠️ Bulk file operations — no rate limiting
- ⚠️ Avatar serving — could enumerate users by ID

---

## 7. Analisis Threat Model

### Threat Actors:
1. **External Attacker (No Access)** — Mencoba exploit dari internet
2. **Malicious User (Authenticated)** — User terdaftar dengan niat jahat
3. **Insider Threat (Admin/Developer)** — Akses internal ke sistem/infrastruktur
4. **Compromised Third-Party** — Package dependency atau service eksternal

### Key Threats:

| Threat | Actor | Likelihood | Impact | Current Mitigation |
|---|---|---|---|---|
| Data breach (file plaintext) | #2, #3 | Medium | **Critical** | ❌ None |
| Credential stuffing | #1 | High | High | Rate limiting (IP only) |
| Malware distribution | #2 | Medium | **Critical** | ❌ Ext-only validation |
| Share link compromise | #1 | Low-Medium | High | Token entropy + optional password |
| Session hijacking | #1, #4 | Low | High | HTTP-only cookies, session encryption |
| Insider data theft | #3 | Low | **Critical** | ❌ No encryption, audit log exists |
| Mass registration / spam | #1 | Medium | Medium | ❌ No rate limiting on register |
| API token abuse | #2 | Medium | High | ❌ No scope limitation, no 2FA |
| Supply chain attack | #4 | Low | High | Composer.lock + npm lock |
| Ransomware (encrypt storage) | #2, #3 | Low | **Critical** | ❌ No backup, no file integrity check |

---

## 8. Hardening Checklist

### Immediate (Before Production Launch):
- [ ] **Enkripsi file aktual** — implementasi sodium/Libsodium encryption
- [ ] **MIME content validation** — gunakan `finfo` + whitelist MIME types
- [ ] **Account lockout** — setelah 5 percobaan gagal
- [ ] **Share route rate limiting** — minimal 10/menit per IP
- [ ] **2FA route rate limiting** — terapkan throttle yang sudah ada
- [ ] **Share link token hashing** — SHA-256 di database
- [ ] **Admin password di env variable** — hapus dari source code
- [ ] **Session driver database/redis** — jangan file driver
- [ ] **`APP_DEBUG=false`** — production check
- [ ] **`SESSION_SECURE_COOKIE=true`** — production check
- [ ] **`HSTS_MAX_AGE=31536000`** — production check
- [ ] **`SCAN_UPLOADS=true`** — production check

### Short-term (1-2 weeks):
- [ ] Registration rate limiting
- [ ] Bulk operation rate limiting
- [ ] Activity log retention policy
- [ ] File integrity monitoring
- [ ] Security alerting (failed logins, malware detected, IP anomalies)
- [ ] Encrypt activity log metadata
- [ ] Content-Disposition header sanitization
- [ ] Share link password session TTL

### Medium-term (1-2 months):
- [ ] CSP nonce-based (remove unsafe-inline)
- [ ] API token scope system
- [ ] Multi-factor untuk API access
- [ ] Backup system dengan encryption
- [ ] Automated vulnerability scanning pipeline
- [ ] Dependency audit (composer audit, npm audit) di CI
- [ ] Security.txt + responsible disclosure policy
- [ ] Penetration testing (external vendor)

### Long-term (3+ months):
- [ ] Zero-knowledge / end-to-end encryption
- [ ] SIEM/SOAR integration
- [ ] ISO 27001 / SOC 2 preparation
- [ ] Bug bounty program
- [ ] Hardware Security Module (HSM) untuk key management
- [ ] FIPS 140-2 compliance untuk kriptografi

---

## 9. Regulatory Compliance Gap Analysis

### GDPR (General Data Protection Regulation)

| Requirement | Status | Gap |
|---|---|---|
| Data encryption at rest | ❌ FAIL | Tidak ada enkripsi file |
| Right to erasure | ✅ PARTIAL | Soft delete + force delete, tapi perlu full data purge |
| Data portability | ❌ FAIL | Tidak ada export mechanism |
| Breach notification (72 jam) | ❌ FAIL | Tidak ada detection mechanism |
| Data Processing Agreement | ❌ FAIL | Tidak ada DPA template |
| Data retention policy | ✅ PARTIAL | 30 hari soft delete, tapi log tidak ada retention |
| Access control | ✅ GOOD | Policy-based authorization |
| Audit trail | ✅ GOOD | Activity log komprehensif |
| Pseudonymization | ❌ FAIL | File disimpan dengan identifier user |

### OWASP Top 10 (2021) Coverage

| Category | Status |
|---|---|
| A01: Broken Access Control | ✅ Policy + Gate (tapi perlu di-test ketat) |
| A02: Cryptographic Failures | ❌ **FAIL** — Enkripsi file tidak nyata |
| A03: Injection | ✅ Eloquent ORM |
| A04: Insecure Design | ⚠️ Threat model belum dilakukan |
| A05: Security Misconfiguration | ⚠️ CSP unsafe-inline, debug mode dev |
| A06: Vulnerable Components | ⚠️ Tidak ada automated audit |
| A07: Auth Failures | ⚠️ No account lockout, weak brute force |
| A08: Software & Data Integrity | ⚠️ No file integrity check |
| A09: Logging & Monitoring | ✅ Activity log baik, tapi tanpa alerting |
| A10: SSRF | N/A (tidak ada URL fetch di app) |

---

## Ringkasan Tindakan Prioritas

1. **🔥 KRITIS #1:** Implementasi enkripsi file aktual (sodium/Libsodium)
2. **🔥 KRITIS #2:** MIME content-based validation (finfo)
3. **🔥 KRITIS #3:** Share link token hashing
4. **🔥 KRITIS #4:** Account lockout + brute force protection
5. **🔥 KRITIS #5:** Rate limiting untuk share routes
6. **⚠️ HIGH:** ClamAV enabled di production + admin password dari env
7. **⚠️ HIGH:** File integrity verification (checksum saat download)
8. **⚠️ MEDIUM:** Activity log retention + metadata encryption
9. **⚠️ MEDIUM:** CSP hardening (nonce-based)
10. **⚠️ LOW:** Production config safety checklist

---

*File ini berisi informasi keamanan sensitif. Jangan disebarluaskan tanpa izin.*
*Update terakhir: 2026-06-16*
