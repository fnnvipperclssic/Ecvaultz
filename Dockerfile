FROM php:8.3-cli-alpine

# Install system dependencies
RUN apk add --no-cache \
    mariadb-client \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    libxml2-dev \
    nodejs \
    npm \
    supervisor \
    redis \
    autoconf \
    build-base \
    pkgconf

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mysqli \
    gd \
    zip \
    exif \
    bcmath \
    intl \
    opcache \
    mbstring

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Dev PHP config
RUN cp "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"
RUN echo "upload_max_filesize = 52M" >> "$PHP_INI_DIR/php.ini"
RUN echo "post_max_size = 52M" >> "$PHP_INI_DIR/php.ini"

EXPOSE 8000

# Create storage directories and set permissions
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/testing \
    storage/logs \
    storage/app/private \
    storage/app/public \
    bootstrap/cache

# Startup script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "composer install --no-interaction && (php artisan key:generate --show 2>/dev/null || php artisan key:generate --force) && php artisan storage:link --force && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000"]
