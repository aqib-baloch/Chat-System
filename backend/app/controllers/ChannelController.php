<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Http\Response;
use App\Exceptions\HttpException;
use App\Services\ChannelService;
use App\Validation\Validator;
use MongoDB\BSON\ObjectId;

final class ChannelController
{
    private ChannelService $channelService;

    public function __construct(ChannelService $channelService)
    {
        $this->channelService = $channelService;
    }

    public function create(ObjectId $userId, string $workspaceId, array $body): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $name = Validator::channelName(Validator::requireString($body, 'name'));
        $description = Validator::channelDescription(Validator::requireString($body, 'description'));
        $visibility = Validator::channelVisibility(Validator::requireString($body, 'visibility'));

        $channel = $this->channelService->createChannel($workspaceObjectId, $name, $description, $visibility, $userId);

        Response::json([
            'success' => true,
            'message' => 'Channel created successfully',
            'channel' => [
                'id' => (string)$channel->getId(),
                'workspace_id' => (string)$channel->getWorkspaceId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
            ],
        ], 201);
    }

    public function getAll(ObjectId $userId, string $workspaceId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $items = $this->channelService->getWorkspaceChannelsWithAccess($workspaceObjectId, $userId);

        $channelData = array_map(function (array $item) {
            $channel = $item['channel'];
            return [
                'id' => (string)$channel->getId(),
                'workspace_id' => (string)$channel->getWorkspaceId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $channel->getUpdatedAt()?->format(DATE_ATOM),
                'locked' => (bool)($item['locked'] ?? false),
                'can_read' => (bool)($item['can_read'] ?? false),
                'can_post' => (bool)($item['can_post'] ?? false),
            ];
        }, $items);

        Response::json([
            'success' => true,
            'channels' => $channelData,
        ]);
    }

    public function getPublic(ObjectId $userId, string $workspaceId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $items = $this->channelService->getPublicChannelsWithAccess($workspaceObjectId, $userId);

        $channelData = array_map(function (array $item) {
            $channel = $item['channel'];
            return [
                'id' => (string)$channel->getId(),
                'workspace_id' => (string)$channel->getWorkspaceId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $channel->getUpdatedAt()?->format(DATE_ATOM),
                'locked' => (bool)($item['locked'] ?? false),
                'can_read' => (bool)($item['can_read'] ?? false),
                'can_post' => (bool)($item['can_post'] ?? false),
            ];
        }, $items);

        Response::json([
            'success' => true,
            'channels' => $channelData,
        ]);
    }

    public function getById(ObjectId $userId, string $workspaceId, string $channelId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');

        $channel = $this->channelService->getChannel($workspaceObjectId, $channelObjectId, $userId);
        if (!$channel) {
            throw new HttpException(404, 'Channel not found');
        }

        Response::json([
            'success' => true,
            'channel' => [
                'id' => (string)$channel->getId(),
                'workspace_id' => (string)$channel->getWorkspaceId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $channel->getUpdatedAt()?->format(DATE_ATOM),
                'locked' => !$this->channelService->canUserReadChannel($channel, $userId) && $channel->isPrivate(),
                'can_read' => $this->channelService->canUserReadChannel($channel, $userId),
                'can_post' => $this->channelService->canUserReadChannel($channel, $userId),
            ],
        ]);
    }

    public function update(ObjectId $userId, string $workspaceId, string $channelId, array $body): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');

        $existing = $this->channelService->getChannel($workspaceObjectId, $channelObjectId, $userId);
        if (!$existing) {
            throw new HttpException(404, 'Channel not found');
        }

        $name = Validator::channelName(Validator::optionalString($body, 'name', $existing->getName()));
        $description = Validator::channelDescription(Validator::optionalString($body, 'description', $existing->getDescription()));

        $channel = $this->channelService->updateChannel($workspaceObjectId, $channelObjectId, $name, $description, $userId);

        Response::json([
            'success' => true,
            'message' => 'Channel updated successfully',
            'channel' => [
                'id' => (string)$channel->getId(),
                'workspace_id' => (string)$channel->getWorkspaceId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $channel->getUpdatedAt()?->format(DATE_ATOM),
            ],
        ]);
    }

    public function delete(ObjectId $userId, string $workspaceId, string $channelId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');

        $deleted = $this->channelService->deleteChannel($workspaceObjectId, $channelObjectId, $userId);

        if ($deleted) {
            Response::json([
                'success' => true,
                'message' => 'Channel deleted successfully',
            ]);
        } else {
            throw new HttpException(500, 'Failed to delete channel');
        }
    }

    public function addMember(ObjectId $userId, string $workspaceId, string $channelId, array $body): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');
        $memberUserId = Validator::objectId(Validator::requireString($body, 'user_id'), 'user_id');

        $this->channelService->addMember($workspaceObjectId, $channelObjectId, $userId, $memberUserId);

        Response::json([
            'success' => true,
            'message' => 'Member added successfully',
        ], 200);
    }

    public function removeMember(ObjectId $userId, string $workspaceId, string $channelId, string $memberUserId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');
        $memberObjectId = Validator::objectId($memberUserId, 'user_id');

        $this->channelService->removeMember($workspaceObjectId, $channelObjectId, $userId, $memberObjectId);

        Response::json([
            'success' => true,
            'message' => 'Member removed successfully',
        ], 200);
    }
}
