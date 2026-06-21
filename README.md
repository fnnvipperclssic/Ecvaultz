# 🔐 Ecvaultz — Digital Vault

> **Enterprise-grade digital vault for secure file storage, management, and collaboration.**
> AES-256-GCM encryption · Two-Factor Authentication · Virtual Data Rooms · OWASP Compliant
> Built with Laravel 11 + React + Inertia.js

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.2%2B-7c22ff?logo=php" alt="PHP">
  <img src="https://img.shields.io/badge/Laravel-11.x-7c22ff?logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/React-18.x-7c22ff?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tailwind-3.4-7c22ff?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-10b981" alt="Encryption">
  <img src="https://img.shields.io/badge/Auth-2FA%20TOTP-10b981" alt="2FA">
  <img src="https://img.shields.io/badge/OWASP-Compliant-10b981" alt="OWASP">
  <img src="https://img.shields.io/badge/PWA-Enabled-10b981" alt="PWA">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
</p>

---

## 📖 Table of Contents

- [What is Ecvaultz?](#-what-is-ecvaultz)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start (Docker)](#-docker-recommended)
- [Local Development](#-local-development)
- [Production Deployment](#-production-deployment-ubuntu)
- [Environment Variables](#-environment-variables-reference)
- [Security Architecture](#-security-architecture)
- [Project Structure](#-project-structure)
- [Default Accounts](#-default-accounts)
- [Scheduled Tasks](#-scheduled-tasks)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Security Policy](#-security-policy)
- [License](#-license)

---

## 🎯 What is Ecvaultz?

Ecvaultz is a **self-hosted digital vault** — a secure web application for storing, managing, sharing, and collaborating on sensitive digital files. Think of it as your personal bank vault, but for digital documents — with enterprise features like Virtual Data Rooms, dynamic watermarking, and complete chain-of-custody auditing.

### Why Ecvaultz?

| Problem | Ecvaultz Solution |
|---|---|
| Files stored in plaintext on cloud | AES-256-GCM encryption with per-user keys |
| Weak authentication | TOTP 2FA + Account lockout + Password expiry + HIBP breach detection |
| No audit trail | Complete activity logging with IP tracking + per-file audit trail |
| Uncontrolled sharing | Password-protected links with expiry + Dynamic watermarking + Data Rooms |
| No access control | 28 granular permissions via Spatie RBAC |
| No recovery mechanism | BIP39 encryption key recovery kit (12-word mnemonic) |
| Weak passwords | Real-time password strength meter + Common password detection |
| Storage abuse | Per-user storage quotas with visual dashboard |

### Use Cases
- **Personal:** Store sensitive documents (passports, contracts, tax records) with favorites & tags
- **Business:** Secure file sharing with clients via Virtual Data Rooms with full branding
- **Enterprise:** Compliance-ready storage with immutable audit trails and retention policies
- **Legal/Medical:** HIPAA-ready architecture with chain of custody tracking + watermarking
- **M&A / Due Diligence:** Curated data rooms with granular access control and expiry

---

## ✨ Features

### 🔒 File Security
- **AES-256-GCM Encryption** — Per-user encryption keys. Files encrypted at rest, decrypted on-demand
- **Encryption Key Recovery** — BIP39 12-word mnemonic recovery kit (PDF downloadable)
- **SHA-256 Checksums** — Integrity verification on every download
- **ClamAV Integration** — Optional malware scanning on upload
- **Dynamic Watermarking** — Auto-watermark previews with viewer email, timestamp, IP, "CONFIDENTIAL" stamp for shared files
- **HIBP Breach Detection** — k-anonymity password breach check on login and password change
- **File Expiry / Self-Destruct** — Set expiration dates on files with automatic cleanup

### 📂 File Management
- **Drag-and-Drop Upload** — Multi-file upload with progress bars and dropzone
- **Favorites & Tags** — Star important files. Color-coded labels with custom tag creation
- **Global Search** — Search across all folders with keyboard navigation (debounced, min 2 chars)
- **File Copy/Duplicate** — One-click file duplication preserving encryption
- **File Descriptions** — Add notes/descriptions to any file
- **Preview** — Inline preview for images, PDFs, with zoom controls
- **Version History** — Track file versions with side-by-side diff comparison (text files)
- **Breadcrumb Navigation** — Clickable folder path breadcrumbs
- **Right-Click Context Menu** — 9 quick actions on file rows

### 📁 Organization
- **Nested Folders** — Hierarchical folder structure with tree sidebar
- **Storage Quota** — Per-user quota limits with color-coded dashboard bar
- **Trash & Recovery** — 30-day soft-delete with search, bulk restore, empty trash, per-file countdown

### 🔗 Sharing & Collaboration
- **Internal Sharing** — User-to-user with read/write permissions + email notifications
- **External Share Links** — Password-protected, expiry dates, SHA-256 token hashing
- **Share Access Tracking** — View count, last accessed time, access audit
- **Share Preview** — Inline file preview through share links (images/PDFs)
- **Virtual Data Rooms** — Branded, curated spaces for external collaboration with:
  - Custom branding (logo, colors)
  - File collections with granular access
  - Invite management with access codes
  - Full audit trail per room
  - Room expiry dates

### 🛡️ Authentication & Security
- **TOTP 2FA** — Google Authenticator / Authy with 8 recovery codes
- **Password Policy** — Min 12 chars, mixed case, numbers, symbols, 90-day expiry
- **Password Strength Meter** — Real-time 6-criteria indicator on all password forms
- **Account Lockout** — 5 attempts → 15 min lockout with email notification
- **Security Questions** — Fallback for password reset
- **Session Security** — HTTP-only cookies, SameSite strict, idle timeout, session regeneration
- **Security Headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP
- **Rate Limiting** — Per-IP + per-account on login, upload, download, 2FA, password reset

### 📊 Administration
- **RBAC** — Admin & User roles with 28 granular Spatie permissions
- **Admin Dashboard** — Global stats, recent registrations, top uploaders
- **User Management** — Search, role/permission editing, ban/unban (with soft-delete)
- **System Settings** — Persistent key-value configuration management
- **Activity Log** — Global + per-file audit trails with CSV export and date filters
- **Notification System** — In-app + email notifications for shares, logins, security events

### 🎨 User Experience
- **Dark/Light Theme** — Glass morphism design with persistent preference
- **Command Palette** — `Ctrl+K` quick navigation
- **Keyboard Shortcuts** — `?` dialog with categorized shortcuts
- **Onboarding Tour** — 8-step guided tour for new users
- **PWA Support** — Service worker with offline page and push notifications
- **Responsive Design** — Mobile-friendly with adaptive sidebar
- **Notification Preferences** — 7 toggle switches for email + in-app notifications

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | PHP 8.2+, Laravel 11 | Application framework |
| **Frontend** | React 18, Inertia.js | SPA with server-driven routing |
| **CSS** | Tailwind CSS 3 | Utility-first design system |
| **Database** | MariaDB 10.11+ / MySQL 8.0+ | Primary data store |
| **Cache** | Redis 7+ (predis) | Session, cache, queue |
| **Auth** | Laravel Sanctum, pragmarx/google2fa | Token auth + TOTP 2FA |
| **RBAC** | Spatie Laravel Permission 6.x | Role-based access control |
| **Encryption** | OpenSSL AES-256-GCM | File encryption at rest |
| **Queue** | Database / Redis | Async job processing |
| **Mail** | SMTP (Mailpit for dev) | Email notifications |
| **Container** | Docker, Docker Compose | Production deployment |

---

## 🐳 Docker (Recommended)

### One-Command Start

```bash
# Windows / Linux / Mac:
docker compose up -d

# Open: http://localhost:8080
```

**That's it.** Docker automatically:
- Builds the PHP + React application
- Starts MariaDB, Redis, and Mailpit
- Generates `.env` from environment variables
- Creates APP_KEY (if not set)
- Runs all 17 database migrations
- Seeds default accounts (first run only)
- Optimizes caches (config, route, view)

**First run takes 2-3 minutes.** Subsequent starts are instant.

### Access After Start

| Service | URL | Purpose |
|---------|-----|---------|
| **Ecvaultz App** | http://localhost:8080 | Main application |
| **Email Testing** | http://localhost:8025 | Mailpit — view all sent emails |

### Default Accounts (Docker)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ecvaultz.test` | `Admin@Ecvaultz#2024!` |
| User | `user@ecvaultz.test` | `User@Ecvaultz#2024!` |
| Demo | `demo@ecvaultz.test` | `Demo@Ecvaultz#2024!` |

> ⚠️ **Change default passwords after first login!**

### Services

| Service | Container | Port |
|---------|-----------|------|
| **App** (Nginx + PHP-FPM + Supervisor) | `ecvaultz-app` | 8080 |
| **Database** (MariaDB 10.11) | `ecvaultz-db` | 3307 |
| **Cache** (Redis 7 Alpine) | `ecvaultz-redis` | — (internal) |
| **Mail** (Mailpit) | `ecvaultz-mailpit` | 8025 (UI), 1025 (SMTP) |

### Useful Docker Commands

```bash
# View logs
docker compose logs -f app

# Run artisan commands
docker compose exec app php artisan migrate:status
docker compose exec app php artisan route:list

# Reset everything (delete all data)
docker compose down -v
docker compose up -d

# Rebuild after code changes
docker compose build
docker compose up -d

# Stop
docker compose down
```

### Windows Quick Start

Double-click **`start.bat`** — builds and starts everything automatically.

---

## 💻 Local Development

### Prerequisites
- PHP 8.2+ with extensions: `pdo_mysql`, `mbstring`, `gd`, `zip`, `exif`, `intl`, `bcmath`, `openssl`
- Composer 2.x
- Node.js 20+ & npm 10+
- MariaDB 10.11+ or MySQL 8.0+
- Redis 7+ (optional for dev)

### Steps

```bash
# 1. Clone repository
git clone https://github.com/your-username/ecvaultz.git
cd ecvaultz

# 2. Install dependencies
composer install
npm install

# 3. Configure environment
cp .env.example .env
php artisan key:generate

# 4. Create database
mysql -u root -e "CREATE DATABASE ecvaultz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Edit .env with your database credentials

# 6. Run migrations and seed
php artisan migrate --seed

# 7. Build frontend assets
npm run build

# 8. Start development server
php artisan serve --host=127.0.0.1 --port=8000
```

Open **http://127.0.0.1:8000** in your browser.

### Hot Module Replacement (Dev)

```bash
npm run dev
```
Frontend changes reflected instantly without manual rebuild.

---

## 🏭 Production Deployment (Ubuntu)

### Quick Steps

```bash
# 1. Install system packages
sudo apt install -y nginx mysql-server redis-server \
    php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-gd \
    php8.2-zip php8.2-exif php8.2-intl php8.2-bcmath \
    php8.2-redis php8.2-opcache php8.2-cli \
    composer nodejs npm certbot supervisor

# 2. Clone and setup
git clone https://github.com/your-username/ecvaultz.git /var/www/ecvaultz
cd /var/www/ecvaultz
composer install --no-dev --optimize-autoloader --no-interaction
npm ci --no-audit && npm run build

# 3. Configure .env for production
cp .env.example .env
# Edit: APP_ENV=production, APP_DEBUG=false, APP_URL=https://your-domain.com
# Set DB credentials, Redis, and SMTP settings
# FORCE_HTTPS=true (enable HTTPS URL generation)
php artisan key:generate

# 4. Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 5. Run migrations and optimize
php artisan migrate --seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Configure Nginx (see nginx config in docker/nginx/default.conf for reference)
# 7. SSL: sudo certbot --nginx -d your-domain.com
# 8. Queue worker: configure supervisor (see docker/supervisor/supervisord.conf)
# 9. Scheduler: add cron: * * * * * php /var/www/ecvaultz/artisan schedule:run
```

### Production `.env` Notes

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
FORCE_HTTPS=true          # Enable HTTPS URL generation for assets
SESSION_SECURE_COOKIE=true
HSTS_MAX_AGE=31536000
SCAN_UPLOADS=true         # Enable ClamAV
TRUSTED_PROXIES=*         # If behind Cloudflare/load balancer
```

---

## 🔧 Environment Variables Reference

### Application
| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | Ecvaultz | Application name |
| `APP_ENV` | production | `local`, `staging`, `production` |
| `APP_DEBUG` | false | **MUST be false in production** |
| `APP_URL` | http://localhost:8080 | Full application URL |
| `APP_KEY` | (required) | Generate: `php artisan key:generate` |
| `ASSET_URL` | "" | Asset base URL (empty = relative paths) |
| `FORCE_HTTPS` | false | Force HTTPS URL generation |

### Database
| Variable | Default | Description |
|---|---|---|
| `DB_CONNECTION` | mariadb | `mariadb` or `mysql` |
| `DB_HOST` | db | Database host |
| `DB_PORT` | 3306 | Database port |
| `DB_DATABASE` | ecvaultz | Database name |
| `DB_USERNAME` | ecvaultz | Database user |
| `DB_PASSWORD` | ecvaultz_secret | Database password |

### Redis
| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | redis | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `REDIS_PASSWORD` | (empty) | Redis password |

### Mail
| Variable | Default | Description |
|---|---|---|
| `MAIL_MAILER` | smtp | `smtp`, `log`, `mailgun` |
| `MAIL_HOST` | mailpit | SMTP server hostname |
| `MAIL_PORT` | 1025 | SMTP port |
| `MAIL_FROM_ADDRESS` | noreply@ecvaultz.test | Sender email |

### Security
| Variable | Default | Description |
|---|---|---|
| `MAX_UPLOAD_SIZE` | 52428800 | Max file size in bytes (50MB) |
| `ALLOWED_EXTENSIONS` | pdf,docx,xlsx,jpg,png,7z | Allowed file extensions |
| `SCAN_UPLOADS` | false | Enable ClamAV virus scanning |
| `PASSWORD_MIN_LENGTH` | 12 | Minimum password length |
| `PASSWORD_EXPIRY_DAYS` | 90 | Password expiry in days (0=never) |
| `TWO_FACTOR_REQUIRED` | false | Force 2FA for all users |
| `ACCOUNT_LOCKOUT_THRESHOLD` | 5 | Failed logins before lockout |
| `ACCOUNT_LOCKOUT_MINUTES` | 15 | Lockout duration in minutes |
| `SESSION_DRIVER` | database | `database` or `redis` |
| `SESSION_LIFETIME` | 30 | Session lifetime (minutes) |
| `SESSION_IDLE_TIMEOUT` | 1800 | Idle timeout (seconds) |
| `SOFT_DELETE_RETENTION_DAYS` | 30 | Trash retention (days) |
| `TRUSTED_PROXIES` | * | Proxy IPs (`*` behind LB, empty for none) |
| `HSTS_MAX_AGE` | 0 | HSTS duration (0=disable, 31536000=production) |

### Rate Limiting
| Variable | Default | Description |
|---|---|---|
| `UPLOAD_RATE_LIMIT` | 10 | Uploads/min per user |
| `DOWNLOAD_RATE_LIMIT` | 20 | Downloads/min per user |
| `RESET_REQUEST_LIMIT` | 3 | Password resets/hour |

---

## 🔐 Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────┐
│                  NETWORK LAYER                           │
│  HTTPS (TLS 1.3) + HSTS + Trusted Proxies               │
├─────────────────────────────────────────────────────────┤
│               APPLICATION LAYER                          │
│  CSP + X-Frame-Options + CSRF + Rate Limits             │
├─────────────────────────────────────────────────────────┤
│              AUTHENTICATION LAYER                        │
│  Password Policy + 2FA TOTP + HIBP + Account Lockout    │
├─────────────────────────────────────────────────────────┤
│              AUTHORIZATION LAYER                         │
│  Spatie RBAC (28 permissions) + Gates + Policies        │
├─────────────────────────────────────────────────────────┤
│                DATA LAYER                                │
│  AES-256-GCM Encryption + SHA-256 Checksums + Watermark │
├─────────────────────────────────────────────────────────┤
│               STORAGE LAYER                              │
│  Per-User Private Disk + Path Traversal Protection      │
├─────────────────────────────────────────────────────────┤
│              MONITORING LAYER                            │
│  Complete Activity Audit Trail + Per-File Audit         │
└─────────────────────────────────────────────────────────┘
```

### File Encryption Flow
1. User registers → per-user 256-bit AES-256-GCM key generated
2. Per-user key encrypted with `APP_KEY` via Laravel Crypt facade
3. File uploaded → validated (extension + MIME finfo + size + ClamAV + quota check) → stored to private disk → SHA-256 checksum calculated → encrypted with per-user key
4. File downloaded → authorization check → path traversal protection → decrypted on-the-fly → checksum verified → streamed to browser
5. Shared file previewed → dynamic watermark applied (viewer email, timestamp, IP, "CONFIDENTIAL")

### Authentication Flow
1. Login → credentials verified → rate limit check → lockout check → HIBP password check
2. 2FA enabled? → TOTP challenge (or 10-char recovery code)
3. Session created → regenerated → `2fa.verified` flag with idle timeout
4. Each request → RequireTwoFactor middleware verifies 2FA session

---

## 📂 Project Structure

```
ecvaultz/
├── app/
│   ├── Console/
│   │   ├── Commands/             # 5 Artisan commands (cleanup + notifications)
│   │   └── Kernel.php            # Scheduled tasks
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/            # Dashboard, User Management, Settings, Activity Log
│   │   │   ├── Auth/             # Login, Register, 2FA, Password Reset, Security Qs
│   │   │   ├── DataRoomController.php
│   │   │   ├── FileController.php
│   │   │   ├── FileVersionController.php
│   │   │   ├── FolderController.php
│   │   │   ├── ShareController.php
│   │   │   ├── TagController.php
│   │   │   └── ProfileController.php
│   │   ├── Middleware/           # SecurityHeaders, Require2FA, CheckPasswordExpiry
│   │   └── Requests/             # Form request validation
│   ├── Jobs/                     # ProcessFileUpload queue job
│   ├── Mail/                     # AccountLockout, SecurityAlert, FileShared, ShareAccessed
│   ├── Models/                   # User, File, Folder, FileShare, FileVersion, ActivityLog,
│   │                             #   Notification, SecurityQuestion, UserSetting,
│   │                             #   LoginAttempt, Tag, SystemSetting, DataRoom
│   ├── Policies/                 # FilePolicy, FolderPolicy
│   ├── Providers/                # App, Auth, Route service providers
│   └── Services/                 # FileService, FileEncryptionService, FileValidationService,
│                                 #   FileVersionService, SecurityService, AuthenticationService,
│                                 #   TwoFactorService, SecurityQuestionService,
│                                 #   NotificationService, WatermarkService,
│                                 #   RecoveryKitService, HIBPService
├── bootstrap/                    # Application bootstrap + cache
├── config/                       # app, auth, database, cache, filesystems, session,
│                                 #   permission, cors, security
├── database/
│   ├── migrations/               # 17 migration files
│   └── seeders/                  # Role, admin, demo user seeders
├── docker/                       # Nginx, PHP (opcache), Supervisor configs + entrypoint
├── public/                       # Web root, PWA manifest, service worker
├── resources/
│   ├── css/app.css               # Design system with custom properties
│   ├── js/
│   │   ├── Components/           # 20+ reusable React components
│   │   ├── Hooks/                # Custom React hooks (ThemeContext, etc.)
│   │   ├── Layouts/              # AuthenticatedLayout, GuestLayout, AdminLayout
│   │   └── Pages/                # 35+ Inertia.js pages
│   └── views/                    # Blade views + email templates
├── routes/
│   ├── web.php                   # 100+ web routes
│   └── api.php                   # API routes (Sanctum)
├── storage/                      # Logs, cache, encrypted files
├── .env.example                  # Full environment template
├── Dockerfile                    # Multi-stage production build
├── docker-compose.yml            # 4-service orchestration
├── report.txt                    # Competitive improvement report
├── start.bat                     # Windows quick-start script
├── tailwind.config.js            # Design tokens + animations
└── vite.config.js                # Vite + React + Laravel plugin
```

---

## 📦 Default Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@ecvaultz.test` | `Admin@Ecvaultz#2024!` | All 28 permissions |
| **User** | `user@ecvaultz.test` | `User@Ecvaultz#2024!` | Standard file operations |
| **Demo** | `demo@ecvaultz.test` | `Demo@Ecvaultz#2024!` | Standard file operations |

> ⚠️ **SECURITY WARNING:** Change ALL default passwords immediately after deployment. Delete demo accounts in production.

---

## 🔄 Scheduled Tasks

| Command | Schedule | Purpose |
|---|---|---|
| `ecvaultz:cleanup-expired-files` | Daily | Soft-delete files past `expires_at` date |
| `ecvaultz:cleanup-expired-shares` | Daily | Remove expired share links |
| `ecvaultz:cleanup-activity-logs --days=90` | Daily | Purge activity logs older than 90 days |
| `ecvaultz:send-pending-notifications` | Hourly | Process pending email notifications |

---

## 🛠️ Common Artisan Commands

| Command | Purpose |
|---|---|
| `php artisan migrate:fresh --seed` | Reset database + seed default accounts |
| `php artisan config:cache` | Cache config for production |
| `php artisan route:cache` | Cache routes for production |
| `php artisan view:cache` | Cache Blade views |
| `php artisan optimize` | Full production optimization |
| `php artisan down --secret="token"` | Maintenance mode with bypass URL |
| `php artisan up` | Disable maintenance mode |
| `php artisan queue:work` | Process queue jobs |
| `php artisan schedule:work` | Run scheduler (development) |
| `php artisan route:list` | List all registered routes |
| `php artisan migrate:status` | Check migration status |
| `php artisan tinker` | Interactive PHP REPL |

---

## 🚨 Troubleshooting

### White screen / CSS/JS not loading
```bash
# Check APP_URL scheme matches actual protocol (http vs https)
docker compose exec app cat /var/www/.env | grep APP_URL
# If using HTTP, ensure FORCE_HTTPS is not enabled
```
**Cause:** `URL::forceScheme('https')` in production with HTTP-only Docker setup.
**Fix:** Set `FORCE_HTTPS=true` only when using actual SSL/TLS.

### "Please provide a valid cache path"
```bash
mkdir -p storage/framework/views storage/framework/cache/data bootstrap/cache
php artisan config:clear && php artisan view:clear
```

### Database connection refused
```bash
# Docker: check if DB container is healthy
docker compose ps

# Local: check MySQL status
sudo systemctl status mysql
```

### 404 on all routes except homepage
Ensure Nginx `try_files` is configured:
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

### File upload fails
- Check `MAX_UPLOAD_SIZE` in `.env` (bytes)
- Verify `upload_max_filesize` and `post_max_size` in `php.ini` (≥ 52M)
- Check `client_max_body_size` in Nginx config (≥ 52M)

### Permission denied on storage
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following code standards
4. Commit: `git commit -m 'feat: add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **PHP:** PSR-12, strict type declarations, PHPDoc for public methods
- **JavaScript:** ES6+, functional components with hooks
- **CSS:** Tailwind utility classes, custom components in `@layer components`
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `security:`)

---

## ⚠️ Security Policy

### Reporting a Vulnerability

If you discover a security vulnerability, **DO NOT** open a public GitHub issue.

Email: `security@ecvaultz.test` (replace with actual contact)

Please include:
- Detailed description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We follow responsible disclosure and will respond within 48 hours.

### Security Headers (Production)

| Header | Value |
|---|---|
| `Content-Security-Policy` | Strict (script-src 'self', no unsafe-eval in production) |
| `X-Frame-Options` | DENY |
| `X-Content-Type-Options` | nosniff |
| `Strict-Transport-Security` | max-age=31536000; includeSubDomains |
| `Referrer-Policy` | strict-origin-when-cross-origin |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=() |
| `Cross-Origin-Opener-Policy` | same-origin |
| `Cross-Origin-Resource-Policy` | same-origin |

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <b>Ecvaultz</b> — Your files. Your control. Our security.<br>
  <sub>Protected by AES-256-GCM encryption. OWASP Top 10 compliant. PWA enabled.</sub>
</p>
