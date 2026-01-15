<?php
declare(strict_types=1);

namespace App\Services;

use App\Exceptions\HttpException;
use App\Models\User;
use App\Repositories\AuthTokenRepository;
use App\Repositories\UserRepository;
use MongoDB\Driver\Exception\BulkWriteException;
final class AuthService
{
    private UserRepository $userRepo;
    private AuthTokenRepository $tokenRepo;
    private int $tokenTtlSeconds;

    public function __construct(UserRepository $userRepo, AuthTokenRepository $tokenRepo, int $tokenTtlSeconds = 604800)
    {
        $this->userRepo = $userRepo;
        $this->tokenRepo = $tokenRepo;
        $this->tokenTtlSeconds = $tokenTtlSeconds;
    }

    public function register(string $email, string $password, string $name): User
    {
        if ($this->userRepo->findByEmail($email)) {
            throw new HttpException(409, 'Email already registered');
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $user = User::createNew($email, $hash, $name);

        try {
            $created = $this->userRepo->create($user);
        } catch (BulkWriteException $e) {
            $message = $e->getMessage();
            if (str_contains($message, 'E11000') && str_contains($message, 'email')) {
                throw new HttpException(409, 'Email already registered');
            }
            throw $e;
        }
        if (!$created->getId()) {
            throw new HttpException(500, 'User creation failed');
        }

        return $created;
    }

    public function login(string $email, string $password, ?string $ip, ?string $userAgent): array
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user) {
            throw new HttpException(401, 'Invalid credentials');
        }

        if (!password_verify($password, $user->getPasswordHash())) {
            throw new HttpException(401, 'Invalid credentials');
        }

        $userId = $user->getId();
        if (!$userId) {
            throw new HttpException(500, 'User record missing id');
        }

        $token = $this->tokenRepo->issueToken($userId, $this->tokenTtlSeconds, $ip, $userAgent);
        return ['user' => $user, 'token' => $token['token'], 'expiresAt' => $token['expiresAt']];
    }

    public function logout(string $token): void
    {
        $this->tokenRepo->revokeToken($token);
    }

    public function authenticate(string $token): User
    {
        $userId = $this->tokenRepo->findUserIdByValidToken($token);
        if (!$userId) {
            throw new HttpException(401, 'Unauthorized');
        }

        $user = $this->userRepo->findById($userId);
        if (!$user) {
            throw new HttpException(401, 'Unauthorized');
        }

        return $user;
    }
}
