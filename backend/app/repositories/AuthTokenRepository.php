<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use App\Exceptions\HttpException;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use MongoDB\Collection;

final class AuthTokenRepository
{
    private Collection $tokens;

    public function __construct()
    {
        $db = Database::getInstance()->getDB();
        $this->tokens = $db->selectCollection('auth_tokens');
    }

    public function ensureIndexes(): void
    {
        $this->tokens->createIndex(['token_hash' => 1], ['unique' => true]);
        $this->tokens->createIndex(['user_id' => 1]);
        $this->tokens->createIndex(['expires_at' => 1], ['expireAfterSeconds' => 0]);
    }

    public function issueToken(ObjectId $userId, int $ttlSeconds, ?string $ip, ?string $userAgent): array
    {
        if ($ttlSeconds < 60) {
            throw new HttpException(500, 'Invalid token TTL');
        }

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $expiresAt = $now->add(new \DateInterval('PT' . $ttlSeconds . 'S'));

        $this->tokens->insertOne([
            'user_id' => $userId,
            'token_hash' => $tokenHash,
            'created_at' => new UTCDateTime($now),
            'expires_at' => new UTCDateTime($expiresAt),
            'revoked_at' => null,
            'last_used_at' => null,
            'ip' => $ip,
            'user_agent' => $userAgent,
        ]);

        return ['token' => $token, 'expiresAt' => $expiresAt];
    }

    public function findUserIdByValidToken(string $token): ?ObjectId
    {
        $token = trim($token);
        if ($token === '' || strlen($token) < 32) {
            return null;
        }

        $tokenHash = hash('sha256', $token);
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));

        $doc = $this->tokens->findOne([
            'token_hash' => $tokenHash,
            'revoked_at' => null,
            'expires_at' => ['$gt' => new UTCDateTime($now)],
        ]);

        if (!$doc) {
            return null;
        }

        $arr = $doc->getArrayCopy();
        $userId = $arr['user_id'] ?? null;
        if (!$userId instanceof ObjectId) {
            return null;
        }

        $this->tokens->updateOne(
            ['_id' => $arr['_id']],
            ['$set' => ['last_used_at' => new UTCDateTime($now)]]
        );

        return $userId;
    }

    public function revokeToken(string $token): void
    {
        $tokenHash = hash('sha256', trim($token));
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));

        $this->tokens->updateOne(
            ['token_hash' => $tokenHash, 'revoked_at' => null],
            ['$set' => ['revoked_at' => new UTCDateTime($now)]]
        );
    }

    public function revokeAllForUser(ObjectId $userId): void
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $this->tokens->updateMany(
            ['user_id' => $userId, 'revoked_at' => null],
            ['$set' => ['revoked_at' => new UTCDateTime($now)]]
        );
    }
}
