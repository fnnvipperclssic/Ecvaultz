# Stage 1: Build frontend assets
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY vite.config.js tailwind.config.js postcss.config.js ./
COPY resources/css ./resources/css
COPY resources/js ./resources/js
COPY resources/views ./resources/views
COPY public ./public
RUN npm run build

# Stage 2: Production
FROM php:8.2-fpm-alpine

# Install runtime packages + PHP extensions via pre-compiled binary installer (FAST)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN apk add --no-cache nginx supervisor curl libpng libzip oniguruma libxml2 mariadb-client \
    && install-php-extensions \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
        opcache \
        redis \
    && rm -rf /tmp/* /var/cache/apk/*

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php/opcache.ini "$PHP_INI_DIR/conf.d/opcache.ini"
RUN echo "upload_max_filesize=52M" >> "$PHP_INI_DIR/conf.d/ecvaultz.ini" \
    && echo "post_max_size=52M" >> "$PHP_INI_DIR/conf.d/ecvaultz.ini"

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-autoloader --no-scripts --prefer-dist
COPY . .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

COPY --from=frontend /app/public/build ./public/build

RUN mkdir -p /var/www/storage/framework/views \
    /var/www/storage/framework/cache/data \
    /var/www/storage/app/private \
    /var/www/bootstrap/cache \
    /run/nginx \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf
COPY docker/scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
