<?php
declare(strict_types=1);

namespace App\Exceptions;

class HttpException extends \RuntimeException
{
    private int $statusCode;
    private string $codeString;
    private array $details;

    public function __construct(int $statusCode, string $message, string $codeString = '', array $details = [])
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->codeString = $codeString !== '' ? $codeString : self::defaultCodeForStatus($statusCode);
        $this->details = $details;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getDetails(): array
    {
        return $this->details;
    }

    public function getCodeString(): string
    {
        return $this->codeString;
    }

    private static function defaultCodeForStatus(int $statusCode): string
    {
        return match ($statusCode) {
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            409 => 'CONFLICT',
            422 => 'VALIDATION_ERROR',
            default => 'HTTP_ERROR',
        };
    }
}
