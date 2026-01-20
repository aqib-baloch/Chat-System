<?php
declare(strict_types=1);

namespace App\Repositories;

use MongoDB\BSON\ObjectId;
use MongoDB\Collection;
use MongoDB\Database as MongoDatabase;

final class ChannelMemberRepository
{
    private Collection $members;

    public function __construct(MongoDatabase $db)
    {
        $this->members = $db->selectCollection('channel_members');
    }

    public function ensureIndexes(): void
    {
        $this->members->createIndex(['channel_id' => 1, 'user_id' => 1], ['unique' => true]);
        $this->members->createIndex(['user_id' => 1]);
        $this->members->createIndex(['channel_id' => 1]);
    }

    public function isMember(ObjectId $channelId, ObjectId $userId): bool
    {
        $doc = $this->members->findOne([
            'channel_id' => $channelId,
            'user_id' => $userId,
        ]);
        return (bool)$doc;
    }

    public function addMember(ObjectId $channelId, ObjectId $userId, ObjectId $addedBy): void
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $this->members->insertOne([
            'channel_id' => $channelId,
            'user_id' => $userId,
            'added_by' => $addedBy,
            'created_at' => new \MongoDB\BSON\UTCDateTime($now),
        ]);
    }

    public function removeMember(ObjectId $channelId, ObjectId $userId): bool
    {
        $result = $this->members->deleteOne([
            'channel_id' => $channelId,
            'user_id' => $userId,
        ]);
        return $result->getDeletedCount() > 0;
    }
}
