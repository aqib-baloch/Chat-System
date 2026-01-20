<?php
declare(strict_types=1);

namespace App\Http\Middleware;

use App\Exceptions\HttpException;
use App\Http\Request;
use App\Repositories\AuthTokenRepository;
use MongoDB\BSON\ObjectId;

final class AuthMiddleware
{
    private AuthTokenRepository $tokenRepo;

    public function __construct(AuthTokenRepository $tokenRepo)
    {
        $this->tokenRepo = $tokenRepo;
    }

    public function handle(callable $next): callable
    {
        return function (...$params) use ($next): void {
            $token = Request::bearerToken();
            if (!$token) {
                throw new HttpException(401, 'Unauthorized');
            }

            $userId = $this->tokenRepo->findUserIdByValidToken($token);
            if (!$userId instanceof ObjectId) {
                throw new HttpException(401, 'Unauthorized');
            }

            $next($userId, ...$params);
        };
    }
}

