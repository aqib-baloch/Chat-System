<?php
declare(strict_types=1);

namespace App\Services;

use App\Exceptions\HttpException;
use App\Models\Channel;
use App\Repositories\ChannelRepository;
use App\Repositories\UserRepository;
use App\Repositories\WorkspaceRepository;
use MongoDB\BSON\ObjectId;
use MongoDB\Driver\Exception\BulkWriteException;

final class ChannelService
{
    private ChannelRepository $channelRepo;
    private UserRepository $userRepo;
    private WorkspaceRepository $workspaceRepo;

    public function __construct(ChannelRepository $channelRepo, UserRepository $userRepo, WorkspaceRepository $workspaceRepo)
    {
        $this->channelRepo = $channelRepo;
        $this->userRepo = $userRepo;
        $this->workspaceRepo = $workspaceRepo;
    }

    public function createChannel(
        ObjectId $workspaceId,
        string $name,
        string $description,
        string $type,
        ObjectId $createdBy
    ): Channel {
        if (!in_array($type, [Channel::TYPE_PUBLIC, Channel::TYPE_PRIVATE], true)) {
            throw new HttpException(422, 'Invalid channel visibility');
        }

        if ($this->channelRepo->findByName($workspaceId, $name)) {
            throw new HttpException(409, 'Channel name already exists');
        }

        $user = $this->userRepo->findById($createdBy);
        if (!$user) {
            throw new HttpException(401, 'Unauthorized');
        }

        $workspace = $this->workspaceRepo->findById($workspaceId);
        if (!$workspace) {
            throw new HttpException(404, 'Workspace not found');
        }
        if ((string)$workspace->getCreatedBy() !== (string)$createdBy) {
            throw new HttpException(403, 'Forbidden');
        }

        $channel = Channel::createNew($workspaceId, $name, $description, $type, $createdBy);
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

    public function getChannel(ObjectId $workspaceId, ObjectId $channelId, ObjectId $userId): ?Channel
    {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel) {
            return null;
        }

        if ((string)$channel->getWorkspaceId() !== (string)$workspaceId) {
            return null;
        }

        if (!$this->channelRepo->canUserAccessChannel($userId, $channelId)) {
            throw new HttpException(403, 'Forbidden');
        }

        return $channel;
    }

    public function getUserChannels(ObjectId $workspaceId, ObjectId $userId): array
    {
        $workspace = $this->workspaceRepo->findById($workspaceId);
        if (!$workspace) {
            throw new HttpException(404, 'Workspace not found');
        }
        if ((string)$workspace->getCreatedBy() !== (string)$userId) {
            throw new HttpException(403, 'Forbidden');
        }

        return $this->channelRepo->findAccessibleChannels($workspaceId, $userId);
    }

    public function getPublicChannels(ObjectId $workspaceId, ObjectId $userId): array
    {
        $workspace = $this->workspaceRepo->findById($workspaceId);
        if (!$workspace) {
            throw new HttpException(404, 'Workspace not found');
        }
        if ((string)$workspace->getCreatedBy() !== (string)$userId) {
            throw new HttpException(403, 'Forbidden');
        }

        return $this->channelRepo->findPublicChannels($workspaceId);
    }

    public function updateChannel(
        ObjectId $workspaceId,
        ObjectId $channelId,
        string $name,
        string $description,
        ObjectId $userId
    ): Channel {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel) {
            throw new HttpException(404, 'Channel not found');
        }

        if ((string)$channel->getWorkspaceId() !== (string)$workspaceId) {
            throw new HttpException(404, 'Channel not found');
        }

        if (!$this->channelRepo->canUserModifyChannel($userId, $channelId)) {
            throw new HttpException(403, 'Forbidden');
        }

        // Check if new name conflicts (only if name changed)
        if ($name !== $channel->getName()) {
            $existingChannel = $this->channelRepo->findByName($workspaceId, $name);
            if ($existingChannel && (string)$existingChannel->getId() !== (string)$channelId) {
                throw new HttpException(409, 'Channel name already exists');
            }
        }

        $channel->update($name, $description);
        $this->channelRepo->update($channel);

        return $channel;
    }

    public function deleteChannel(ObjectId $workspaceId, ObjectId $channelId, ObjectId $userId): bool
    {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel) {
            throw new HttpException(404, 'Channel not found');
        }

        if ((string)$channel->getWorkspaceId() !== (string)$workspaceId) {
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
