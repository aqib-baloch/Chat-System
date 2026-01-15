FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libssl-dev \
    pkg-config \
    git \
    unzip

RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
