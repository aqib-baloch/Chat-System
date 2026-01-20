<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Exceptions\HttpException;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use MongoDB\Collection;
use MongoDB\Database as MongoDatabase;

final class PasswordResetRepository
{
    private Collection $resets;

    public function __construct(MongoDatabase $db)
    {
        $this->resets = $db->selectCollection('password_resets');
    }

    public function ensureIndexes(): void
    {
        $this->resets->createIndex(['token_hash' => 1], ['unique' => true]);
        $this->resets->createIndex(['user_id' => 1]);
        $this->resets->createIndex(['expires_at' => 1], ['expireAfterSeconds' => 0]);
    }

    public function invalidateAllForUser(ObjectId $userId): void
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $this->resets->updateMany(
            ['user_id' => $userId, 'used_at' => null],
            ['$set' => ['used_at' => new UTCDateTime($now)]]
        );
    }

    public function issueToken(ObjectId $userId, int $ttlSeconds, ?string $ip, ?string $userAgent): array
    {
        if ($ttlSeconds < 60) {
            throw new HttpException(500, 'Invalid password reset TTL');
        }

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $expiresAt = $now->add(new \DateInterval('PT' . $ttlSeconds . 'S'));

        $this->resets->insertOne([
            'user_id' => $userId,
            'token_hash' => $tokenHash,
            'created_at' => new UTCDateTime($now),
            'expires_at' => new UTCDateTime($expiresAt),
            'used_at' => null,
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

        $doc = $this->resets->findOne([
            'token_hash' => $tokenHash,
            'used_at' => null,
            'expires_at' => ['$gt' => new UTCDateTime($now)],
        ]);
        if (!$doc) {
            return null;
        }

        $arr = $doc->getArrayCopy();
        $userId = $arr['user_id'] ?? null;
        return $userId instanceof ObjectId ? $userId : null;
    }

    public function markUsed(string $token): void
    {
        $tokenHash = hash('sha256', trim($token));
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));

        $this->resets->updateOne(
            ['token_hash' => $tokenHash, 'used_at' => null],
            ['$set' => ['used_at' => new UTCDateTime($now)]]
        );
    }
}

