<?php
declare(strict_types=1);

namespace App\Http;

use App\Exceptions\HttpException;

final class Response
{
    public static function json(array $payload, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    }

    public static function error(HttpException $e): void
    {
        $body = self::formatErrorBody($e, $e->getStatusCode(), $e->getCodeString());
        self::json($body, $e->getStatusCode());
    }

    public static function throwable(\Throwable $e): void
    {
        $debug = (string)(getenv('APP_DEBUG') ?: '');
        $isDebug = $debug === '1' || strtolower($debug) === 'true';

        if ($isDebug) {
            self::json(self::formatErrorBody($e, 500, 'INTERNAL_ERROR', [
                'type' => get_class($e),
            ]), 500);
            return;
        }

        self::json(self::formatErrorBody($e, 500, 'INTERNAL_ERROR'), 500);
    }

    private static function formatErrorBody(\Throwable $e, int $statusCode, string $code, array $extraDetails = []): array
    {
        $body = [
            'success' => false,
            'error' => $e->getMessage(),
            'code' => $code,
            'status' => $statusCode,
        ];

        if ($e instanceof HttpException) {
            $details = $e->getDetails();
            if ($details !== []) {
                $body['details'] = $details;
            }
        }

        if ($extraDetails !== []) {
            $body['details'] = array_merge($body['details'] ?? [], $extraDetails);
        }

        return $body;
    }
}
