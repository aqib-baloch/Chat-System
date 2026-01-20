<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Models\Channel;
use MongoDB\BSON\ObjectId;
use MongoDB\Collection;
use MongoDB\Database as MongoDatabase;

final class ChannelRepository
{
    private Collection $channels;

    public function __construct(MongoDatabase $db)
    {
        $this->channels = $db->selectCollection('channels');
    }

    public function ensureIndexes(): void
    {
        $this->channels->createIndex(['workspace_id' => 1, 'name' => 1], ['unique' => true]);
        $this->channels->createIndex(['workspace_id' => 1]);
        $this->channels->createIndex(['created_by' => 1]);
        $this->channels->createIndex(['type' => 1]);
    }

    public function findById(ObjectId $id): ?Channel
    {
        $data = $this->channels->findOne(['_id' => $id]);
        if (!$data) {
            return null;
        }

        return Channel::fromArray($data->getArrayCopy());
    }

    public function findByName(ObjectId $workspaceId, string $name): ?Channel
    {
        $data = $this->channels->findOne(['workspace_id' => $workspaceId, 'name' => trim($name)]);
        if (!$data) {
            return null;
        }

        return Channel::fromArray($data->getArrayCopy());
    }

    public function findPublicChannels(ObjectId $workspaceId): array
    {
        $cursor = $this->channels->find([
            'workspace_id' => $workspaceId,
            'type' => Channel::TYPE_PUBLIC,
        ]);
        $channels = [];

        foreach ($cursor as $data) {
            $channels[] = Channel::fromArray($data->getArrayCopy());
        }

        return $channels;
    }

    public function findByWorkspace(ObjectId $workspaceId): array
    {
        $cursor = $this->channels->find(
            ['workspace_id' => $workspaceId],
            ['sort' => ['created_at' => -1]]
        );
        $channels = [];

        foreach ($cursor as $data) {
            $channels[] = Channel::fromArray($data->getArrayCopy());
        }

        return $channels;
    }

    public function findByCreator(ObjectId $workspaceId, ObjectId $creatorId): array
    {
        $cursor = $this->channels->find(['workspace_id' => $workspaceId, 'created_by' => $creatorId]);
        $channels = [];

        foreach ($cursor as $data) {
            $channels[] = Channel::fromArray($data->getArrayCopy());
        }

        return $channels;
    }

    public function findAccessibleChannels(ObjectId $workspaceId, ObjectId $userId): array
    {
        // Public channels + channels created by the user
        $cursor = $this->channels->find([
            'workspace_id' => $workspaceId,
            '$or' => [
                ['type' => Channel::TYPE_PUBLIC],
                ['created_by' => $userId]
            ]
        ]);

        $channels = [];
        foreach ($cursor as $data) {
            $channels[] = Channel::fromArray($data->getArrayCopy());
        }

        return $channels;
    }

    public function create(Channel $channel): Channel
    {
        $result = $this->channels->insertOne($channel->toArray());
        /** @var ObjectId $id */
        $id = $result->getInsertedId();

        return new Channel(
            $id,
            $channel->getWorkspaceId(),
            $channel->getName(),
            $channel->getDescription(),
            $channel->getType(),
            $channel->getCreatedBy(),
            $channel->getCreatedAt(),
            $channel->getUpdatedAt()
        );
    }

    public function update(Channel $channel): bool
    {
        if (!$channel->getId()) {
            return false;
        }

        $set = $channel->toArray();
        unset($set['_id'], $set['created_by'], $set['created_at']);

        $result = $this->channels->updateOne(
            ['_id' => $channel->getId()],
            ['$set' => $set]
        );

        return $result->getModifiedCount() > 0;
    }

    public function delete(ObjectId $id): bool
    {
        $result = $this->channels->deleteOne(['_id' => $id]);
        return $result->getDeletedCount() > 0;
    }

    public function canUserAccessChannel(ObjectId $userId, ObjectId $channelId): bool
    {
        $channel = $this->findById($channelId);
        if (!$channel) {
            return false;
        }

        // Public channels are accessible to everyone
        if ($channel->isPublic()) {
            return true;
        }

        // Private channels are only accessible to the creator
        return (string)$channel->getCreatedBy() === (string)$userId;
    }

    public function canUserModifyChannel(ObjectId $userId, ObjectId $channelId): bool
    {
        $channel = $this->findById($channelId);
        if (!$channel) {
            return false;
        }

        // Only the creator can modify their channels
        return (string)$channel->getCreatedBy() === (string)$userId;
    }
}
