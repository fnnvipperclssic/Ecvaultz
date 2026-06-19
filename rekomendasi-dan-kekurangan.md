# Rekomendasi Pengembangan & Kekurangan Project Ecvaultz

> **File ini berisi analisis kekurangan saat ini dan rekomendasi fitur/tambahan untuk pengembangan ke depan.**

---

## Daftar Isi

1. [Kekurangan Saat Ini](#1-kekurangan-saat-ini)
2. [Rekomendasi Prioritas Tinggi](#2-rekomendasi-prioritas-tinggi)
3. [Rekomendasi Prioritas Menengah](#3-rekomendasi-prioritas-menengah)
4. [Rekomendasi Prioritas Rendah / Jangka Panjang](#4-rekomendasi-prioritas-rendah--jangka-panjang)
5. [Rekomendasi Arsitektur & DevOps](#5-rekomendasi-arsitektur--devops)
6. [Peta Jalan (Roadmap)](#6-peta-jalan-roadmap)

---

## 1. Kekurangan Saat Ini

### 1.1 Enkripsi File — Palsu / Tidak Nyata 🔴 KRITIS
**Masalah:** File di-upload dengan flag `is_encrypted = true` di database, tetapi file di disk **tidak dienkripsi sama sekali**. Tidak ada proses enkripsi/dekripsi pada `FileService::upload()` maupun `FileService::download()`. Ini adalah **celah keamanan paling serius** karena klaim aplikasi adalah "brankas digital" yang aman — kenyataannya file disimpan sebagai plaintext.

**Dampak:** Siapa pun yang mendapat akses ke filesystem dapat membaca semua file.

**Rekomendasi:** Implementasi enkripsi AES-256-GCM (atau minimal AES-256-CBC dengan HMAC) pada saat upload dengan encryption key per-user yang di-enkripsi lagi dengan master key. Libsodium/native `sodium_crypto_secretbox` adalah opsi modern untuk ini.

### 1.2 Tidak Ada Key Management Per-User 🔴
**Masalah:** Tidak ada mekanisme enkripsi key management. Jika enkripsi file diimplementasikan, perlu ada infrastruktur key management.

### 1.3 Common Password List Sangat Terbatas 🔴
**Masalah:** `SecurityService::isCommonPassword()` hanya mengecek 15 password hardcoded. Sangat tidak memadai.
**Rekomendasi:** Gunakan library dedicated atau integrasi HaveIBeenPwned API (sudah tersedia di Laravel 11 via `->uncompromised()` di register).

### 1.4 Spatie Laravel Permission Terpasang Tapi Tidak Digunakan 🟡
**Masalah:** Package ter-install di composer.json namun tidak ada migration, role, atau permission yang didefinisikan. Saat ini hanya menggunakan flag `is_admin` boolean.

**Rekomendasi:** Manfaatkan Spatie untuk role-based access control yang lebih granular (misal: admin, moderator, user, viewer).

### 1.5 Tidak Ada Enkripsi pada Share Link Token di Database 🟡
**Masalah:** `share_link_token` disimpan sebagai plaintext di database. Jika database bocor, semua share link bisa diakses.

**Rekomendasi:** Hash share_link_token di database (seperti password), dan hanya bandingkan hash saat akses.

### 1.6 Preview File Load Semua ke Memory 🟡
**Masalah:** `FileController::preview()` membaca seluruh file dengan `file_get_contents()` lalu encode base64. Untuk file besar (50MB PDF), ini akan menyebabkan OOM error.

**Rekomendasi:** Untuk file di atas threshold tertentu (misal 5MB), gunakan streaming response atau tampilkan thumbnail saja.

### 1.7 Tidak Ada Queue/Job Processing 🟡
**Masalah:** Semua operasi bersifat synchronous — upload, ClamAV scan, delete, semua blocking request-response cycle. ClamAV scan yang lambat akan membuat upload sangat lama.

**Rekomendasi:** Pindahkan operasi berat (scan virus, generate thumbnail, enkripsi) ke queue job dengan Laravel Queue (Redis/database).

### 1.8 Tidak Ada File Versioning 🟡
**Masalah:** File hanya bisa di-upload sekali; tidak ada revisi. Jika user upload file dengan nama yang sama, akan menjadi file terpisah. Tidak ada history versi.

### 1.9 Tidak Ada Preview untuk File Office (DOCX, XLSX) 🟡
**Masalah:** `File::isPreviewable()` hanya support PDF, JPG, PNG. DOCX dan XLSX tidak bisa dipreview.

### 1.10 Tidak Ada Download Resume / Partial Download 🟡
**Masalah:** Download menggunakan `response()->download()` standar tanpa Range header support.

### 1.11 Session Driver Default: File 🔴
**Masalah:** `.env` saat ini `SESSION_DRIVER=file` yang tidak cocok untuk production (file lock contention, tidak scalable). Sementara aplikasi sudah terkonfigurasi untuk database session (tabel `sessions` ada).

**Rekomendasi:** Ubah default ke `database` atau `redis`.

### 1.12 Tidak Ada Test Coverage 🔴
**Masalah:** Tidak ada file test di direktori `tests/`. Semua logic (upload, download, share, 2FA) tidak memiliki automated test.

### 1.13 Tidak Ada Admin Panel 🟡
**Masalah:** Tidak ada interface terpisah untuk admin. Admin hanya bypass Gate policy tapi tidak bisa manage users, lihat semua file, atau lihat statistik global.

### 1.14 Tidak Ada Backup Mechanism 🟡
**Masalah:** Konfigurasi S3 backup disk sudah ada di `config/filesystems.php` tapi tidak ada job/command untuk automated backup.

### 1.15 Tidak Ada Notification / Email 🟡
**Masalah:** Email verification, password reset, dan share notification tidak berfungsi karena konfigurasi mail belum di-setup dengan benar (SMTP Mailtrap untuk dev).

### 1.16 Tidak Ada Recursive Delete Folder 🟡
**Masalah:** Saat folder dihapus, file dan subfolder hanya dipindahkan ke root. Tidak ada opsi untuk menghapus seluruh isi folder.

### 1.17 Upload Rate Limit Terlalu Ketat 🟡
**Masalah:** Hanya 10 upload per menit. User yang mengupload banyak file kecil akan cepat kena rate limit.

### 1.18 Tidak Ada Drag & Drop Folder Upload (Hanya File) 🟡
**Masalah:** React-dropzone hanya menerima file, bukan folder. Tidak bisa upload folder langsung.

### 1.19 Delete Share Tidak Revoke Akses File yang Sudah Dibagikan 🟡
**Masalah:** `ShareController@destroy` hanya menghapus record share. File yang sudah dibagikan tetap bisa diakses sampai share dihapus.

### 1.20 Tidak Ada MIME Type Validation yang Ketat 🟡
**Masalah:** Hanya validasi ekstensi di `SecurityService::validateFileExtension()`. Magic byte / MIME content sniffing tidak dilakukan. File `.exe` bisa direname jadi `.pdf` dan lolos.

---

## 2. Rekomendasi Prioritas Tinggi

### 2.1 Implementasi Enkripsi File Sebenarnya
**Prioritas: 🔴 KRITIS**

Implementasi enkripsi file dengan alur:
1. Generate per-user encryption key saat registrasi (RSA atau symmetric key)
2. Enkripsi per-user key dengan aplikasi master key
3. Saat upload: enkripsi file dengan per-user key menggunakan AES-256-GCM
4. Simpan encrypted file + metadata (IV, tag) ke storage
5. Saat download: dekripsi on-the-fly dan streaming ke client
6. Gunakan Laravel Queue untuk proses enkripsi/dekripsi file besar

### 2.2 MIME Type Content-Based Detection
**Prioritas: 🔴 KRITIS**

Tambahkan validasi MIME type berbasis content (bukan hanya ekstensi):
- Gunakan `finfo` (FileInfo) atau `mime_content_type()` untuk membaca magic bytes
- Bandingkan dengan ekstensi yang diklaim
- Tolak file yang mismatch
- Tambahkan daftar MIME types yang diizinkan (bukan hanya ekstensi) — sudah ada di config `security.allowed_mimes` tapi tidak digunakan

### 2.3 Test Suite
**Prioritas: 🔴 KRITIS**

Minimal implementasi:
- **Unit Tests:** FileService, SecurityService, TwoFactorService
- **Feature Tests:** Upload flow, download flow, share flow, 2FA flow, auth flow
- **Integration Tests:** Rate limiting, security headers

Target coverage: minimal 70%

### 2.4 Session Driver ke Database/Redis
**Prioritas: 🔴 KRITIS**

Ubah `SESSION_DRIVER` default ke `database` (tabel session sudah ada) atau `redis`. Hapus opsi `file` dari production config.

### 2.5 Share Link Token Hashing
**Prioritas: 🔴 TINGGI**

Hash `share_link_token` di database menggunakan SHA-256 atau bcrypt. Cari share dengan membandingkan hash (bukan plaintext token lookup).

### 2.6 Brute Force Protection
**Prioritas: 🔴 TINGGI**

Tambahkan:
- Account locking setelah N percobaan gagal (5x dalam 15 menit)
- CAPTCHA setelah beberapa percobaan gagal
- Progressive delay pada login attempt
- Rate limiting spesifik per-account (bukan hanya per-IP)

---

## 3. Rekomendasi Prioritas Menengah

### 3.1 Integrasi Spatie Laravel Permission
Definisikan role dan permission:
- **Super Admin** — semua akses
- **Admin** — manage users, lihat global stats
- **User** — upload, download, share file sendiri
- **Viewer** — hanya lihat file yang dibagikan

### 3.2 File Preview untuk Office Documents
Gunakan library:
- LibreOffice headless conversion ke PDF
- Atau Office Online / OnlyOffice integration
- Atau Google Docs Viewer embed

### 3.3 Queue-Based Processing
Pindahkan ke queue job:
- `ProcessFileUpload` — scan virus + generate thumbnail + enkripsi
- `ProcessFileDownload` — dekripsi + streaming
- `CleanupExpiredFiles` — sudah ada command, tapi tanpa queue
- `SendShareNotification` — kirim email notifikasi share

### 3.4 File Versioning
- Tambahkan tabel `file_versions`
- Setiap upload baru ke file yang sama = buat versi baru
- User bisa restore versi sebelumnya
- Konfigurasi jumlah maksimum versi per file

### 3.5 Download dengan Range Support
Implementasi streaming download dengan:
- HTTP Range header support
- Resume download capability
- `Symphony\Component\HttpFoundation\StreamedResponse` dengan callback streaming

### 3.6 Admin Dashboard
Buat halaman admin terpisah:
- `/admin/dashboard` — statistik global (total users, files, storage)
- `/admin/users` — manage users (suspend, delete, reset 2FA)
- `/admin/files` — lihat semua file
- `/admin/activity-log` — audit log global
- `/admin/settings` — kelola konfigurasi aplikasi

### 3.7 Real-Time Notifications
Gunakan Laravel Reverb / Pusher / SSE:
- Notifikasi share diterima
- Notifikasi file di-download
- Notifikasi share expired
- Notifikasi keamanan (login dari IP baru)

### 3.8 Automated Backup
- Daily backup database + file ke S3/cloud storage
- Retention policy (7 daily, 4 weekly, 12 monthly)
- Restore procedure

### 3.9 Email Notification System
- Verifikasi email (sudah ada route)
- Notifikasi share diterima (internal)
- Notifikasi share link created (external)
- Notifikasi security (password changed, new login, 2FA changes)
- Weekly activity digest

### 3.10 MIME Type Content Validation
Gunakan `finfo` untuk membaca magic bytes file dan validasi terhadap whitelist MIME types (config `security.allowed_mimes` sudah ada tapi tidak dipakai).

---

## 4. Rekomendasi Prioritas Rendah / Jangka Panjang

### 4.1 Integrasi Cloud Storage
- Primary: S3 / S3-compatible (DigitalOcean Spaces, MinIO, Wasabi)
- Secondary: Azure Blob, Google Cloud Storage
- Fallback chain: local → cloud → cold storage

### 4.2 Zero-Knowledge Encryption
Implementasi enkripsi end-to-end (client-side):
- File dienkripsi di browser sebelum upload (Web Crypto API / crypto-js)
- Server tidak pernah melihat isi file plaintext
- Password-derived key + public key cryptography

### 4.3 File Sharing dengan Link yang Lebih Kaya
- Custom domain untuk share link
- Landing page kustom untuk share link (logo, pesan)
- Multiple files dalam satu share link
- Batch download sebagai ZIP
- Watermark pada preview

### 4.4 Collaborative Features
- Real-time collaborative editing (via OnlyOffice/CRDT)
- File comments / annotations
- Activity feed per file

### 4.5 Advanced Search
- Full-text search (Laravel Scout + Meilisearch/Algolia)
- Search inside PDF/DOCX content
- OCR untuk image
- Metadata search (EXIF, tanggal, tipe)

### 4.6 API yang Lebih Kaya
- RESTful API dengan dokumentasi (Scramble/Scribe)
- Webhook untuk event (file uploaded, downloaded, shared)
- SDK client (PHP, JavaScript)

### 4.7 Mobile App
- React Native / Flutter
- Push notification
- Offline access dengan sync
- Biometric auth (FaceID/Fingerprint)

### 4.8 Compliance & Certification Readiness
- ISO 27001 checklist
- SOC 2 Type II preparation
- GDPR compliance (data residency, right to erasure, DSAR)
- HIPAA readiness untuk healthcare use case

### 4.9 Multi-Tenancy
- Organization/workspace support
- Team management
- Cross-organization sharing
- Quota management per organization

### 4.10 Audit & Compliance
- SIEM integration (log ke ELK/Splunk)
- Automated incident response (suspicious activity alerting)
- Compliance report generation

---

## 5. Rekomendasi Arsitektur & DevOps

### 5.1 Containerization
- Dockerfile sudah dihapus (terlihat di git status). Buat ulang:
  - Multi-stage build untuk production
  - Development docker-compose dengan PHP-FPM, Nginx, Redis, MariaDB
  - Production docker-compose / Kubernetes manifests

### 5.2 CI/CD Pipeline
- GitHub Actions / GitLab CI:
  - Lint (PHPStan/Psalm level 5+)
  - Test (PHPUnit + Laravel Dusk)
  - Build assets (npm run build)
  - Deploy ke staging/production

### 5.3 Monitoring & Observability
- Laravel Telescope (dev)
- Sentry / Bugsnag untuk error tracking
- Prometheus + Grafana untuk metrics
- File storage metrics (total size, growth rate)

### 5.4 Performance Optimization
- Redis untuk cache (sudah dikonfigurasi tapi belum digunakan untuk session)
- Database query optimization (N+1 sudah ditangani dengan `->with()`)
- Lazy loading untuk file list (sudah paginate)
- CDN untuk asset statis

---

## 6. Peta Jalan (Roadmap)

### Fase 1: Keamanan Fundamental (1-2 minggu)
- [ ] Enkripsi file aktual (AES-256-GCM)
- [ ] MIME type content validation
- [ ] Share link token hashing
- [ ] Session driver database/redis
- [ ] Brute force protection per-account

### Fase 2: Stabilitas & Testing (1-2 minggu)
- [ ] Unit & feature tests (target 70%)
- [ ] Queue-based processing untuk upload
- [ ] Preview untuk DOCX/XLSX
- [ ] Download dengan Range support
- [ ] Spatie Permission integration

### Fase 3: Fitur Bisnis (2-4 minggu)
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] File versioning
- [ ] Automated backup
- [ ] Enhanced share links (custom domain, multi-file)

### Fase 4: Scale & Advanced (4-8 minggu)
- [ ] Cloud storage integration
- [ ] Full-text search (Meilisearch)
- [ ] Real-time notifications (Reverb)
- [ ] API documentation
- [ ] Docker + CI/CD

### Fase 5: Enterprise (8+ minggu)
- [ ] Zero-knowledge encryption
- [ ] Multi-tenancy
- [ ] Compliance readiness
- [ ] Mobile app
- [ ] SIEM integration

---

*File ini adalah living document — update seiring perkembangan project.*
*Update terakhir: 2026-06-16*
