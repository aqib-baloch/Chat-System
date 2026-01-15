<?php
declare(strict_types=1);

namespace App\Http;

use App\Exceptions\HttpException;

final class Request
{
    public static function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    public static function path(): string
    {
        if (isset($_GET['path']) && is_string($_GET['path'])) {
            return trim($_GET['path'], '/');
        }

        $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        if (!is_string($uriPath)) {
            return '';
        }

        return trim($uriPath, '/');
    }

    public static function jsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        $data = json_decode($raw, true);
        if (!is_array($data)) {
        throw new HttpException(400, 'Invalid JSON body');
    }

        return $data;
    }

    public static function header(string $name): ?string
    {
        $target = strtolower($name);

        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (is_array($headers)) {
                foreach ($headers as $key => $value) {
                    if (strtolower((string)$key) === $target) {
                        return is_string($value) ? $value : null;
                    }
                }
            }
        }

        $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        $value = $_SERVER[$serverKey] ?? null;
        return is_string($value) ? $value : null;
    }

    public static function bearerToken(): ?string
    {
        $auth = self::header('Authorization');
        if (!is_string($auth)) {
            return null;
        }

        if (!preg_match('/^Bearer\s+(.+)$/i', trim($auth), $m)) {
            return null;
        }

        $token = trim($m[1]);
        return $token !== '' ? $token : null;
    }

    public static function ip(): ?string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        return is_string($ip) && $ip !== '' ? $ip : null;
    }

    public static function userAgent(): ?string
    {
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
        return is_string($ua) && $ua !== '' ? $ua : null;
    }
}
