<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Models\Message;
use MongoDB\BSON\ObjectId;
use MongoDB\Collection;
use MongoDB\Database as MongoDatabase;

final class MessageRepository
{
    private Collection $messages;

    public function __construct(MongoDatabase $db)
    {
        $this->messages = $db->selectCollection('messages');
    }

    public function ensureIndexes(): void
    {
        $this->messages->createIndex(['workspace_id' => 1, 'channel_id' => 1, 'created_at' => 1]);
        $this->messages->createIndex(['channel_id' => 1, 'created_at' => 1]);
        $this->messages->createIndex(['sender_id' => 1]);
    }

    public function findById(ObjectId $id): ?Message
    {
        $data = $this->messages->findOne(['_id' => $id]);
        if (!$data) {
            return null;
        }

        return Message::fromArray($data->getArrayCopy());
    }

    public function listByChannel(ObjectId $workspaceId, ObjectId $channelId, int $limit = 50): array
    {
        $limit = max(1, min(200, $limit));

        $cursor = $this->messages->find(
            [
                'workspace_id' => $workspaceId,
                'channel_id' => $channelId,
                'deleted_at' => null,
            ],
            [
                'sort' => ['created_at' => 1],
                'limit' => $limit,
            ]
        );

        $messages = [];
        foreach ($cursor as $data) {
            $messages[] = Message::fromArray($data->getArrayCopy());
        }

        return $messages;
    }

    public function create(Message $message): Message
    {
        $result = $this->messages->insertOne($message->toArray());
        /** @var ObjectId $id */
        $id = $result->getInsertedId();

        return new Message(
            $id,
            $message->getWorkspaceId(),
            $message->getChannelId(),
            $message->getSenderId(),
            $message->getContent(),
            $message->getCreatedAt(),
            $message->getUpdatedAt(),
            $message->getDeletedAt()
        );
    }

    public function update(Message $message): bool
    {
        $id = $message->getId();
        if (!$id) {
            return false;
        }

        $set = $message->toArray();
        unset($set['_id'], $set['workspace_id'], $set['channel_id'], $set['sender_id'], $set['created_at']);

        $result = $this->messages->updateOne(
            ['_id' => $id],
            ['$set' => $set]
        );

        return $result->getModifiedCount() > 0;
    }
}

