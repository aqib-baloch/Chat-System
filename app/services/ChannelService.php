<?php
declare(strict_types=1);

namespace App\Services;

use App\Exceptions\HttpException;
use App\Models\Channel;
use App\Repositories\ChannelRepository;
use App\Repositories\UserRepository;
use MongoDB\BSON\ObjectId;
use MongoDB\Driver\Exception\BulkWriteException;

final class ChannelService
{
    private ChannelRepository $channelRepo;
    private UserRepository $userRepo;

    public function __construct(ChannelRepository $channelRepo, UserRepository $userRepo)
    {
        $this->channelRepo = $channelRepo;
        $this->userRepo = $userRepo;
    }

    public function createChannel(
        string $name,
        string $description,
        string $type,
        ObjectId $createdBy
    ): Channel {
        if (!in_array($type, [Channel::TYPE_PUBLIC, Channel::TYPE_PRIVATE], true)) {
            throw new HttpException(422, 'Invalid channel visibility');
        }

        if ($this->channelRepo->findByName($name)) {
            throw new HttpException(409, 'Channel name already exists');
        }

        $user = $this->userRepo->findById($createdBy);
        if (!$user) {
            throw new HttpException(401, 'Unauthorized');
        }

        $channel = Channel::createNew($name, $description, $type, $createdBy);
        try {
            return $this->channelRepo->create($channel);
        } catch (BulkWriteException $e) {
            $message = $e->getMessage();
            if (str_contains($message, 'E11000') && str_contains($message, 'name')) {
                throw new HttpException(409, 'Channel name already exists');
            }
            throw $e;
        }
    }

    public function getChannel(ObjectId $channelId, ObjectId $userId): ?Channel
    {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel) {
            return null;
        }

        if (!$this->channelRepo->canUserAccessChannel($userId, $channelId)) {
            throw new HttpException(403, 'Forbidden');
        }

        return $channel;
    }

    public function getUserChannels(ObjectId $userId): array
    {
        return $this->channelRepo->findAccessibleChannels($userId);
    }

    public function getPublicChannels(): array
    {
        return $this->channelRepo->findPublicChannels();
    }

    public function updateChannel(
        ObjectId $channelId,
        string $name,
        string $description,
        ObjectId $userId
    ): Channel {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel) {
            throw new HttpException(404, 'Channel not found');
        }

        if (!$this->channelRepo->canUserModifyChannel($userId, $channelId)) {
            throw new HttpException(403, 'Forbidden');
        }

        // Check if new name conflicts (only if name changed)
        if ($name !== $channel->getName()) {
            $existingChannel = $this->channelRepo->findByName($name);
            if ($existingChannel && (string)$existingChannel->getId() !== (string)$channelId) {
                throw new HttpException(409, 'Channel name already exists');
            }
        }

        $channel->update($name, $description);
        $this->channelRepo->update($channel);

        return $channel;
    }

    public function deleteChannel(ObjectId $channelId, ObjectId $userId): bool
    {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel) {
            throw new HttpException(404, 'Channel not found');
        }

        if (!$this->channelRepo->canUserModifyChannel($userId, $channelId)) {
            throw new HttpException(403, 'Forbidden');
        }

        return $this->channelRepo->delete($channelId);
    }

    public function canUserAccessChannel(ObjectId $userId, ObjectId $channelId): bool
    {
        return $this->channelRepo->canUserAccessChannel($userId, $channelId);
    }
}
