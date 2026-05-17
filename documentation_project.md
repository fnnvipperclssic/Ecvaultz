# Ecvaultz — Digital Vault Web Application

## Project Documentation

**Version:** 1.0.0
**Date:** 2026-05-11
**Status:** MVP Implementation Complete

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Security Implementation (11 Points)](#4-security-implementation)
5. [Database Schema](#5-database-schema)
6. [UI/UX Design & Workflow](#6-uiux-design--workflow)
7. [API Route Reference](#7-api-route-reference)
8. [File Structure](#8-file-structure)
9. [Deployment Guide](#9-deployment-guide)
10. [Monitoring & Maintenance](#10-monitoring--maintenance)

---

## 1. Project Overview

Ecvaultz is a **digital vault** (brankas digital) web application that enables users to securely store, manage, and share digital files. The application prioritizes **confidentiality, integrity, and availability** with security standards equivalent to OWASP and NIST industry standards.

### Core Features

| Module | Description |
|--------|-------------|
| **Authentication** | Login/Register, 2FA TOTP, forgot password, device session management |
| **Dashboard** | File/folder listing, grid/list view, search, usage statistics |
| **Upload** | Drag & drop, progress bar, simultaneous uploads, ClamAV scanning |
| **Download** | Single file or ZIP batch download via secure streaming endpoint |
| **File Preview** | PDF and image preview via secure base64 streaming |
| **Sharing** | Internal user sharing (read/write), external share links with password & expiry |
| **File Management** | Rename, move to folder, delete, restore from trash, bulk operations |
| **Profile & Settings** | Profile edit, password change, 2FA enable/disable, account deletion |
| **Activity Log** | Full audit trail of all user actions (login, upload, download, share, delete) |

### Security Posture

- HTTPS-only with HSTS (max-age=31536000)
- Argon2id password hashing
- TOTP-based Two-Factor Authentication
- Server-side input validation with Form Requests
- CSP, X-Frame-Options, X-Content-Type-Options headers
- Eloquent parameter binding (SQL injection prevention)
- Encrypted file storage outside public directory
- ClamAV antivirus integration
- Session encryption with Redis backend
- Rate limiting on all sensitive endpoints
- Signed/controlled download URLs

---

## 2. Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Backend** | Laravel | 11.x | Built-in CSRF/XSS/SQLi protection, 2FA support, queue system, policy authorization |
| **Language** | PHP | 8.2+ | Type safety, performance improvements, enum support |
| **Frontend** | React | 18.x | Component-based UI, efficient rendering, rich ecosystem |
| **Frontend Bridge** | Inertia.js | 1.x | SPA-like UX without API overhead, server-side routing security retained |
| **Database** | MariaDB | 10.11+ | ACID compliance, MySQL compatibility, at-rest encryption |
| **Cache/Session** | Redis | 7.x | Fast session handling, atomic locks, rate limiting backend |
| **Web Server** | Nginx | latest | Lightweight, high concurrency, HTTP/2 support |
| **Containerization** | Docker | 24+ | Environment isolation, reproducible deployments |
| **CSS Framework** | Tailwind CSS | 3.4 | Utility-first, small bundle size, design system consistency |
| **Notifications** | notistack | 3.x | Snackbar/toast notifications for user feedback |

### Key Composer Packages

| Package | Purpose |
|---------|---------|
| `laravel/sanctum` | API token & SPA authentication |
| `pragmarx/google2fa-laravel` | TOTP generation & verification for 2FA |
| `bacon/bacon-qr-code` | QR code generation for 2FA setup |
| `spatie/laravel-permission` | Role/permission management |
| `spatie/laravel-password-validation` | Common password blacklisting |
| `predis/predis` | Redis client for PHP |
| `laravel/horizon` | Queue monitoring dashboard |

---

## 3. System Architecture

### High-Level Diagram

```
┌──────────┐     HTTPS      ┌──────────┐     FastCGI      ┌─────────────┐
│  Client   │ ◄────────────► │  Nginx    │ ◄──────────────► │  Laravel 11  │
│ (Browser) │                │  (SSL)    │                  │  (PHP-FPM)   │
└──────────┘                └──────────┘                  └──────┬───────┘
                                  │                              │
                                  │                      ┌───────┴───────┐
                                  │                      │               │
                                  │                 ┌────▼────┐   ┌─────▼──────┐
                                  │                 │  MariaDB │   │   Redis    │
                                  │                 │ (Data)   │   │ (Session)  │
                                  │                 └─────────┘   └────────────┘
                                  │
                            ┌─────▼─────┐
                            │  Storage   │
                            │ (Private)  │
                            └───────────┘
```

### Design Decisions

1. **All files stored in `storage/app/private/`** — no direct URL access possible. Every download goes through a secure controller endpoint with policy checks.

2. **File naming**: `sha256(uniqid + random_bytes(32)) + .extension` — 64-character hash filenames, original names stored only in the database.

3. **Session backend**: Redis — enables atomic session operations, faster than database driver, suitable for rate limiting.

4. **Inertia.js instead of pure SPA**: Maintains server-side routing security while providing SPA-like user experience. CSRF tokens are handled automatically.

5. **Soft deletes with 30-day retention**: Files are recoverable within the retention window. A cron job (`ecvaultz:cleanup-expired-files`) permanently removes them after expiry.

---

## 4. Security Implementation

### 4.1 Input Validation (XSS Prevention)

**Backend:**
- All input validated via Laravel Form Requests with strict rules (`string`, `max`, `regex`)
- Sanitization through Eloquent attribute casting
- Raw SQL queries prohibited in production code

**Frontend:**
- React escapes output by default
- Content Security Policy headers block unauthorized scripts
- `HttpOnly` & `Secure` cookies prevent XSS cookie theft

**Headers delivered on every response:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### 4.2 SQL Injection Prevention

- All database queries use **Eloquent ORM** or **Query Builder** with automatic parameter binding
- No raw SQL in production controllers
- Input always passes through validation and binding before reaching the database layer

### 4.3 Password Security

- **Hashing algorithm**: Argon2id (Laravel 11 default, superior to bcrypt)
- **Minimum requirements**: 12+ characters, 1 uppercase, 1 number, 1 symbol
- **Common password check**: Blocked via `spatie/laravel-password-validation`
- Salt is embedded in the Argon2id hash — no separate salt storage needed
- Password confirmation required for: email changes, 2FA changes, account deletion, bulk operations

### 4.4 Session Management

```
Cookie Configuration:
  - Name: ecvaultz_session
  - Secure: true (HTTPS only)
  - HttpOnly: true (no JS access)
  - SameSite: Strict (CSRF protection)
  - Domain: restricted to ecvaultz.test

Session Lifecycle:
  - Lifetime: 30 minutes (configurable)
  - Regeneration: on login, logout, privilege change
  - Storage: Redis (encrypted at rest)
  - Anomaly detection: terminates session on suspicious IP change
  - Idle timeout: enforced by RequireTwoFactor middleware
```

### 4.5 File Upload Security

**Validation chain:**
1. Extension whitelist: `pdf`, `docx`, `xlsx`, `jpg`, `png`, `7z`
2. MIME type verification: `mimes:...` Laravel rule
3. Size limit: 50 MB per file (configurable via `MAX_UPLOAD_SIZE`)
4. ClamAV scan: `clamdscan --fdpass --stream` before storage
5. Filename sanitization: random 64-char hash, original name in DB only
6. Storage: `storage/app/private/` — outside web root, no `+x` on upload directories
7. Permission: `750` for directories, `640` for files

### 4.6 Server-Side Permissions (Authorization)

**Laravel Policy Classes:**

| Policy | Rules |
|--------|-------|
| `FilePolicy::view` | Owner OR user with read/write share |
| `FilePolicy::update` | Owner OR user with write share |
| `FilePolicy::delete` | Owner only |
| `FilePolicy::download` | Same as view |
| `FilePolicy::share` | Owner only |
| `FolderPolicy::view` | Owner only |
| `FolderPolicy::update` | Owner only |

**Middleware integration:**
```php
Route::get('files/{uuid}/download', [FileController::class, 'download'])
    ->middleware('can:download,file');
```

### 4.7 Secure File Downloads

- **Endpoint**: `/files/{uuid}/download` (authenticated, authorized)
- **Share link**: `/share/{token}` (password-protected, expirable)
- **Response**: `Storage::download()` with streaming for large files
- **Headers**: `X-Content-Type-Options: nosniff`, `Content-Disposition: attachment`
- **Audit logging**: IP, user, timestamp, file UUID recorded on every download
- **Rate limiting**: 20 downloads per minute per user

### 4.8 User Data Settings

- **Profile fields**: name, email, avatar, password, 2FA preferences
- **Sensitive changes** (email, password, 2FA): require current password verification
- **Account deletion**: soft delete (30-day recovery window), requires password + 2FA if enabled
- **Data encryption**: payment info (if added) encrypted with AES-256 using Laravel's encryption
- **Activity logging**: every profile change, login, and action is recorded

### 4.9 Password Reset Flow

1. User requests reset → token generated, stored in `password_reset_tokens` table
2. Email queued via Laravel queue (non-blocking)
3. Link valid for **60 minutes**, single-use
4. On successful reset: all other sessions terminated, `password_changed_at` updated
5. **Rate limit**: 3 requests per email per hour

### 4.10 Two-Factor Authentication (TOTP)

**Implementation:** `pragmarx/google2fa` + `bacon/bacon-qr-code`

**Setup flow:**
1. User clicks "Set up 2FA" in profile
2. Secret key generated (temporarily held in session)
3. QR code displayed (scanned with Google Authenticator / Authy)
4. User enters verification code → secret encrypted and stored in DB
5. **8 recovery codes** generated (hashed, displayed once)

**Login flow:**
1. User enters email + password
2. If 2FA enabled → session set to `auth.2fa.challenge` state, user logged out
3. Redirected to `/2fa/challenge` (6-digit OTP input)
4. On valid OTP → full session established with `2fa.verified` flag
5. Recovery codes accepted as alternative (10-char code)

**Security:**
- TOTP window: ±1 period (60s tolerance)
- Recovery codes: single-use, bcrypt-hashed in database
- Rate limiting: 5 attempts per minute
- Global enforcement option via `TWO_FACTOR_REQUIRED=true`

### 4.11 File/Data Deletion

**Soft delete flow:**
1. File moved to trash (`deleted_at` timestamp set)
2. Visible in `/files/trash` for 30 days
3. Restore supported within retention window
4. Cron job (`ecvaultz:cleanup-expired-files`) permanently deletes expired files

**Hard delete flow:**
1. Requires password confirmation
2. Requires 2FA code if 2FA enabled
3. Physical file removed from `storage/app/private/`
4. Database record force-deleted
5. Audit log entry with full metadata

**Bulk operations:**
- Max 100 files per request
- Password confirmation required for >10 files
- All operations logged

---

## 5. Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users      │       │    files      │       │  file_shares  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │──┐    │ id (PK)      │
│ name         │  │    │ uuid (UQ)    │  │    │ uuid (UQ)    │
│ email (UQ)   │  │    │ user_id (FK) │◄─┤    │ file_id (FK) │
│ password     │  ├───►│ folder_id    │  ├───►│ shared_by    │
│ google2fa    │  │    │ original_name│  │    │ shared_with  │
│ 2fa_enabled  │  │    │ stored_name  │  │    │ type         │
│ recovery_codes│ │    │ mime_type    │  │    │ permission   │
│ is_admin     │  │    │ size         │  │    │ expires_at   │
│ timestamps   │  │    │ path         │  │    │ access_count │
│ deleted_at   │  │    │ checksum     │  │    └──────────────┘
└──────────────┘  │    │ deleted_at   │  │
                  │    └──────────────┘  │
                  │                      │
                  │    ┌──────────────┐  │
                  │    │   folders    │  │
                  │    ├──────────────┤  │
                  └───►│ user_id (FK) │  │
                       │ parent_id    │◄─┘
                       │ name         │
                       │ uuid (UQ)    │
                       └──────────────┘

┌──────────────────┐
│  activity_logs    │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │──► users
│ action           │
│ ip_address       │
│ user_agent       │
│ metadata (JSON)  │
│ created_at       │
└──────────────────┘
```

### Key Indexes

- `users`: email (unique), deleted_at
- `files`: user_id, uuid (unique), folder_id, deleted_at, (user_id, folder_id)
- `file_shares`: file_id, shared_with_user_id, share_link_token (unique), expires_at
- `activity_logs`: user_id, action, created_at
- `folders`: uuid (unique), (user_id, parent_id), deleted_at

### Index Justification

- **user_id**: Primary access pattern — users view their own files
- **uuid**: File download/access lookup by UUID instead of auto-increment ID (prevents enumeration)
- **deleted_at**: Soft delete filtering (where deleted_at is null)
- **(user_id, folder_id)**: Composite index for folder-based file listing
- **share_link_token**: Quick external share link lookup
- **expires_at**: Cleanup cron queries for expired shares

---

## 6. UI/UX Design & Workflow

### Design System

**Color Palette:**
- Primary: Blue-600 (`#2563eb`) — trust, security
- Surface: Slate scale — neutral, professional
- Success: Green-600 — positive actions
- Danger: Red-600 — destructive actions
- Warning: Amber-500 — attention needed

**Typography:** Inter (sans-serif) for UI, JetBrains Mono (monospace) for codes/tokens

**Component Library:** Custom Tailwind-based design system with consistent spacing, border radius (rounded-xl for cards)

### Page Workflows

#### Authentication Flow

```
┌─────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────┐
│  Login   │───►│ Password  │───►│  2FA Challenge │───►│ Dashboard│
│  Page    │    │  Verify   │    │  (if enabled)  │    │          │
└─────────┘    └──────────┘    └──────────────┘    └──────────┘
      │              │                  │
      ▼              ▼                  ▼
┌─────────┐    ┌──────────┐    ┌──────────────┐
│ Register │    │  Forgot   │    │   Recovery   │
│          │    │ Password  │    │    Code      │
└─────────┘    └──────────┘    └──────────────┘
```

#### File Upload Workflow

```
Drag & Drop zone (or click to browse)
    │
    ▼
Client-side validation (extension, size)
    │
    ▼
XHR upload with progress tracking
    │
    ▼
Server-side: validate → ClamAV scan → store → hash filename
    │
    ▼
DB record created → cache invalidated → UI updated
```

#### File Sharing Workflow

```
┌──────────────┐
│ Select file   │
│ Click "Share" │
└──────┬───────┘
       │
   ┌───▼───────────┐
   │ Internal User? │
   └───┬───────────┘
       │
  ┌────▼────┐    ┌────▼────┐
  │ Internal│    │ External│
  │ Enter   │    │ Enter   │
  │ email   │    │ email + │
  │ Set perm│    │ password│
  │         │    │ Set exp │
  └────┬────┘    └────┬────┘
       │              │
       ▼              ▼
  Share recorded   Link generated
  (DB entry)       (share_link_token)
       │              │
       ▼              ▼
  Notify user      Copy/share link
  (future)         with password
```

### Responsive Design

- **Desktop**: Full sidebar + table layout
- **Tablet**: Collapsible sidebar, grid view for files
- **Mobile**: Hidden sidebar (hamburger toggle), simplified list view

### Error & Empty States

All pages handle:
- **Loading**: Spinner animations on form submissions
- **Empty**: Illustrated empty states with clear CTAs (e.g., "Upload your first file")
- **Error**: Red-bordered inputs with inline error messages, toast notifications for flash errors
- **404/403**: Proper error pages with navigation back

### Accessibility

- All form inputs have associated labels
- Color contrast meets WCAG AA standards
- Keyboard navigation supported on all interactive elements
- Screen reader friendly semantic HTML

---

## 7. API Route Reference

### Web Routes

#### Guest Routes (unauthenticated)

| Method | URI | Handler | Rate Limit |
|--------|-----|---------|------------|
| GET | `/login` | `Auth\Login::create` | — |
| POST | `/login` | `Auth\Login::store` | 5/min/IP |
| GET | `/register` | `Auth\Register::create` | — |
| POST | `/register` | `Auth\Register::store` | — |
| GET | `/forgot-password` | `PasswordResetLink::create` | — |
| POST | `/forgot-password` | `PasswordResetLink::store` | 3/hr/email |
| GET | `/reset-password/{token}` | `NewPassword::create` | — |
| POST | `/reset-password` | `NewPassword::store` | — |
| GET | `/2fa/challenge` | `TwoFactor::showChallenge` | 5/min |
| POST | `/2fa/challenge` | `TwoFactor::verifyChallenge` | 5/min |

#### Public Routes

| Method | URI | Handler | Notes |
|--------|-----|---------|-------|
| GET | `/share/{token}` | `Share::accessViaLink` | Password prompt if protected |
| POST | `/share/{token}` | `Share::accessViaLink` | Password verification |
| GET | `/share/{token}/download` | `Share::downloadViaLink` | Requires unlocked session |

#### Authenticated Routes

| Method | URI | Handler | Policy |
|--------|-----|---------|--------|
| GET | `/` | `Dashboard::index` | — |
| GET | `/files` | `File::index` | — |
| POST | `/files` | `File::store` | — |
| GET | `/files/trash` | `File::trash` | — |
| GET | `/files/{uuid}` | `File::preview` | `FilePolicy::view` |
| GET | `/files/{uuid}/download` | `File::download` | `FilePolicy::download` |
| PATCH | `/files/{uuid}/rename` | `File::rename` | `FilePolicy::update` |
| PATCH | `/files/{uuid}/move` | `File::move` | `FilePolicy::update` |
| DELETE | `/files/{uuid}` | `File::destroy` | `FilePolicy::delete` |
| POST | `/files/{uuid}/restore` | `File::restore` | `FilePolicy::restore` |
| DELETE | `/files/{uuid}/force` | `File::forceDelete` | `FilePolicy::forceDelete` |
| POST | `/files/bulk` | `File::bulkAction` | — |
| POST | `/folders` | `Folder::store` | — |
| PATCH | `/folders/{uuid}` | `Folder::update` | `FolderPolicy::update` |
| DELETE | `/folders/{uuid}` | `Folder::destroy` | `FolderPolicy::delete` |
| GET | `/shares` | `Share::index` | — |
| POST | `/files/{fileUuid}/share` | `Share::store` | `FilePolicy::share` |
| DELETE | `/shares/{shareUuid}` | `Share::destroy` | — |
| GET | `/activity-log` | `ActivityLog::index` | — |
| GET | `/profile` | `Profile::edit` | — |
| PATCH | `/profile` | `Profile::update` | — |
| PUT | `/profile/password` | `Profile::updatePassword` | — |
| POST | `/profile/avatar` | `Profile::updateAvatar` | — |
| DELETE | `/profile/account` | `Profile::destroyAccount` | — |
| POST | `/profile/logout-others` | `Profile::logoutOtherDevices` | — |
| POST | `/logout` | `Auth\Login::destroy` | — |
| GET | `/2fa/setup` | `TwoFactor::setup` | — |
| POST | `/2fa/enable` | `TwoFactor::enable` | — |
| POST | `/2fa/disable` | `TwoFactor::disable` | — |
| GET | `/2fa/recovery-codes` | `TwoFactor::showRecoveryCodes` | — |
| POST | `/2fa/recovery-codes/regenerate` | `TwoFactor::regenerate` | — |

### Rate Limiting Summary

| Resource | Limit | Window |
|----------|-------|--------|
| Login attempts | 5 | per minute, per IP |
| Password reset | 3 | per hour, per email |
| 2FA verification | 5 | per minute, per user |
| File upload | 10 | per minute, per user |
| File download | 20 | per minute, per user |

---

## 8. File Structure

```
Ecvaultz/
├── app/
│   ├── Console/
│   │   ├── Commands/
│   │   │   ├── CleanupExpiredFiles.php    # Cron: hard-delete expired files
│   │   │   └── CleanupExpiredShares.php   # Cron: remove expired shares
│   │   └── Kernel.php                     # Task scheduler
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthenticatedSessionController.php
│   │   │   │   ├── RegisteredUserController.php
│   │   │   │   ├── TwoFactorController.php
│   │   │   │   ├── PasswordResetLinkController.php
│   │   │   │   ├── NewPasswordController.php
│   │   │   │   └── EmailVerificationController.php
│   │   │   ├── Controller.php
│   │   │   ├── DashboardController.php
│   │   │   ├── FileController.php
│   │   │   ├── FolderController.php
│   │   │   ├── ShareController.php
│   │   │   ├── ProfileController.php
│   │   │   └── ActivityLogController.php
│   │   ├── Middleware/
│   │   │   ├── HandleInertiaRequests.php  # Inertia SSR + shared props
│   │   │   ├── RequireTwoFactor.php       # 2FA session enforcement
│   │   │   └── SecurityHeaders.php        # CSP, HSTS, XSS headers
│   │   └── Requests/
│   │       └── Auth/
│   │           └── LoginRequest.php       # Login validation + rate limit
│   ├── Models/
│   │   ├── User.php
│   │   ├── File.php
│   │   ├── Folder.php
│   │   ├── FileShare.php
│   │   └── ActivityLog.php
│   ├── Policies/
│   │   ├── FilePolicy.php
│   │   └── FolderPolicy.php
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   └── RouteServiceProvider.php       # Rate limiter definitions
│   └── Services/
│       ├── FileService.php                # Upload, download, delete logic
│       ├── TwoFactorService.php           # TOTP gen, QR code, recovery codes
│       └── SecurityService.php            # Password validation, anomaly detection
├── bootstrap/
│   └── app.php                            # Application bootstrap
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cors.php
│   ├── database.php
│   ├── filesystems.php
│   ├── security.php                       # All security constants
│   └── session.php
├── database/
│   ├── migrations/
│   │   ├── ..._create_users_table.php
│   │   ├── ..._create_files_table.php
│   │   └── ..._create_file_shares_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── AdminUserSeeder.php
├── public/
│   ├── .htaccess
│   └── index.php
├── resources/
│   ├── css/
│   │   └── app.css                        # Tailwind + component classes
│   ├── js/
│   │   ├── app.jsx                        # Inertia app bootstrap
│   │   ├── Layouts/
│   │   │   ├── AuthenticatedLayout.jsx    # Sidebar + topbar + content
│   │   │   └── GuestLayout.jsx            # Centered card layout
│   │   ├── Pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ActivityLog.jsx
│   │   │   ├── Trash.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── TwoFactor.jsx
│   │   │   │   ├── TwoFactorSetup.jsx
│   │   │   │   ├── RecoveryCodes.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   └── VerifyEmail.jsx
│   │   │   └── Files/
│   │   │       ├── Index.jsx
│   │   │       ├── Preview.jsx
│   │   │       ├── Share.jsx
│   │   │       └── ShareAccess.jsx
│   └── views/
│       └── app.blade.php                  # Root Blade template
├── routes/
│   ├── web.php                             # All web routes
│   └── api.php                             # Sanctum API routes
├── storage/
│   └── app/
│       └── private/                        # Encrypted file storage
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── rancangan_dasar.txt                    # Original design document
└── documentation_project.md               # This file
```

---

## 9. Deployment Guide

### Prerequisites

- PHP 8.2+ with extensions: `pdo_mysql`, `redis`, `gd`, `zip`, `bcmath`, `intl`, `mbstring`
- MariaDB 10.11+ or MySQL 8.0+
- Redis 7+
- Nginx with PHP-FPM
- Composer 2.x
- Node.js 18+ and npm
- SSL certificate (Let's Encrypt recommended)

### Quick Start (Docker)

```bash
# Clone the project
git clone <repository-url> ecvaultz
cd ecvaultz

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings (DB passwords, app URL, etc.)

# Start all services
docker compose up -d

# Run migrations and seed admin user
docker compose exec app php artisan migrate --seed

# Generate app key
docker compose exec app php artisan key:generate

# Build frontend assets
docker compose exec app npm ci
docker compose exec app npm run build
```

### Manual Deployment (Ubuntu 22.04)

```bash
# Install PHP and extensions
sudo apt update
sudo apt install -y php8.2-fpm php8.2-mysql php8.2-redis \
    php8.2-gd php8.2-zip php8.2-bcmath php8.2-intl php8.2-mbstring \
    php8.2-xml php8.2-curl
sudo apt install -y mariadb-server redis-server nginx composer

# Install ClamAV for virus scanning
sudo apt install -y clamav clamav-daemon
sudo freshclam
sudo systemctl enable --now clamav-daemon

# Clone and configure
cd /var/www
sudo git clone <repository-url> ecvaultz
cd ecvaultz
sudo chown -R www-data:www-data .
sudo -u www-data composer install --no-dev --optimize-autoloader
sudo -u www-data npm ci && sudo -u www-data npm run build

# Environment
sudo -u www-data cp .env.example .env
sudo -u www-data php artisan key:generate
# Edit .env with production settings

# Database
sudo mysql -e "CREATE DATABASE ecvaultz; CREATE USER 'ecvaultz_user'@'localhost' IDENTIFIED BY 'strong_password'; GRANT ALL ON ecvaultz.* TO 'ecvaultz_user'@'localhost'; FLUSH PRIVILEGES;"
sudo -u www-data php artisan migrate --seed

# Nginx site
sudo cp nginx.conf /etc/nginx/sites-available/ecvaultz
sudo ln -s /etc/nginx/sites-available/ecvaultz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Permissions hardening
sudo chmod -R 750 storage bootstrap/cache
sudo find storage -type d -exec chmod 750 {} \;
sudo find storage -type f -exec chmod 640 {} \;
sudo chmod -R 755 public

# SSL via Let's Encrypt
sudo certbot --nginx -d ecvaultz.test

# Queue worker (systemd)
sudo cp .infrastructure/ecvaultz-worker.service /etc/systemd/system/
sudo systemctl enable --now ecvaultz-worker

# Cron jobs
echo "* * * * * www-data php /var/www/ecvaultz/artisan schedule:run >> /dev/null 2>&1" | sudo tee /etc/cron.d/ecvaultz
```

### Environment Variables (Production Checklist)

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://<your-domain>
APP_KEY=<generated-key>

DB_HOST=127.0.0.1
DB_DATABASE=ecvaultz
DB_USERNAME=ecvaultz_user
DB_PASSWORD=<strong-password>

REDIS_PASSWORD=<strong-redis-password>

SESSION_DRIVER=redis
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict
SESSION_DOMAIN=<your-domain>

CLAMAV_SOCKET=unix:///var/run/clamav/clamd.ctl
SCAN_UPLOADS=true

TWO_FACTOR_REQUIRED=false  # Set to true to force 2FA for all users
```

---

## 10. Monitoring & Maintenance

### Scheduled Tasks (Cron)

| Command | Frequency | Purpose |
|---------|-----------|---------|
| `ecvaultz:cleanup-expired-files` | Daily 2 AM | Permanently delete soft-deleted files past 30-day retention |
| `ecvaultz:cleanup-expired-shares` | Hourly | Remove expired share links |
| `backup:run --only-db` | Daily 1 AM | Database backup to S3/secondary storage |

### Logging

All user actions are logged to the `activity_logs` table:
- **Login/logout events**: IP, user agent, timestamp
- **File operations**: upload, download, delete, restore, permanent delete
- **Sharing events**: share created, share removed, link accessed
- **Security events**: 2FA enable/disable, recovery code use, password changes
- **Suspicious activity**: IP changes, failed login bursts

Query logs via admin panel or directly:
```sql
SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100;
```

### Security Audit Checklist

- [ ] Run `composer audit` monthly for dependency vulnerabilities
- [ ] Review CSP headers after frontend changes
- [ ] Test rate limiting on all endpoints
- [ ] Verify ClamAV virus definitions are updating (check `freshclam` log)
- [ ] Review `storage/logs/laravel.log` for errors weekly
- [ ] Rotate `APP_KEY` if ever compromised (requires re-encrypting all encrypted data)
- [ ] Monitor failed login attempts via `activity_logs` for brute force patterns
- [ ] Run OWASP ZAP or similar scanner before major releases
- [ ] Verify SSL certificate renewal (Let's Encrypt auto-renew with certbot)

### Performance Tuning

- **Redis cache**: Adjust `CACHE_TTL_FILES` based on usage patterns (default: 300s)
- **Database**: Monitor slow queries, add indexes if needed
- **Queue**: For high-upload environments, increase queue worker count in `horizon.php`
- **CDN**: For public share links with high traffic, configure CloudFront with signed cookies
- **OPcache**: Ensure PHP OPcache is enabled in production (`opcache.enable=1`)

### Backup & Recovery

1. **Database**: Daily dump via `spatie/laravel-backup` to S3/secondary storage
2. **Files**: Sync `storage/app/private/` to backup location daily
3. **Recovery test**: Restore from backup to staging environment monthly
4. **Disaster recovery plan**: Document steps for full system restore from backups

---

## Appendix: 11 Security Points Compliance Summary

| # | Security Requirement | Implementation | Status |
|---|---------------------|----------------|--------|
| 1 | Input Validation (XSS) | Form Requests + CSP headers + React escaping | Implemented |
| 2 | SQL Injection | Eloquent parameter binding + no raw queries | Implemented |
| 3 | Password Security | Argon2id + 12-char minimum + common password check | Implemented |
| 4 | Session Management | Redis + secure cookies + regeneration + anomaly detection | Implemented |
| 5 | File Upload | Extension/MIME validation + ClamAV + random names + private storage | Implemented |
| 6 | Server Permissions | Laravel Policies + middleware authorization + file/directory permissions | Implemented |
| 7 | File Download | Authenticated endpoint + policy check + streaming + audit log | Implemented |
| 8 | User Data | Profile management + password confirmation + activity logging | Implemented |
| 9 | Password Reset | 60-min token + email queue + session termination + rate limit | Implemented |
| 10 | 2FA TOTP | google2fa + QR code + 8 recovery codes + encrypted secret | Implemented |
| 11 | File/Data Delete | Soft delete + 30-day retention + bulk confirmation + audit log | Implemented |

---

*Ecvaultz — Secure by Design, Built with Laravel*
