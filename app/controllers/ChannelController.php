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

    public function create(ObjectId $userId, array $body): void
    {
        $name = Validator::channelName(Validator::requireString($body, 'name'));
        $description = Validator::optionalString($body, 'description', '');
        $visibility = Validator::channelVisibility(Validator::optionalString($body, 'visibility', Validator::optionalString($body, 'type', 'public')));

        $channel = $this->channelService->createChannel($name, $description, $visibility, $userId);

        Response::json([
            'success' => true,
            'message' => 'Channel created successfully',
            'channel' => [
                'id' => (string)$channel->getId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
            ],
        ], 201);
    }

    public function getAll(ObjectId $userId): void
    {
        $channels = $this->channelService->getUserChannels($userId);

        $channelData = array_map(function ($channel) {
            return [
                'id' => (string)$channel->getId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $channel->getUpdatedAt()?->format(DATE_ATOM),
            ];
        }, $channels);

        Response::json([
            'success' => true,
            'channels' => $channelData,
        ]);
    }

    public function getPublic(): void
    {
        $channels = $this->channelService->getPublicChannels();

        $channelData = array_map(function ($channel) {
            return [
                'id' => (string)$channel->getId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $channel->getUpdatedAt()?->format(DATE_ATOM),
            ];
        }, $channels);

        Response::json([
            'success' => true,
            'channels' => $channelData,
        ]);
    }

    public function getById(ObjectId $userId, string $channelId): void
    {
        $channelObjectId = Validator::objectId($channelId, 'channel_id');

        $channel = $this->channelService->getChannel($channelObjectId, $userId);
        if (!$channel) {
            throw new HttpException(404, 'Channel not found');
        }

        Response::json([
            'success' => true,
            'channel' => [
                'id' => (string)$channel->getId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $channel->getUpdatedAt()?->format(DATE_ATOM),
            ],
        ]);
    }

    public function update(ObjectId $userId, string $channelId, array $body): void
    {
        $channelObjectId = Validator::objectId($channelId, 'channel_id');

        $name = Validator::channelName(Validator::requireString($body, 'name'));
        $description = Validator::optionalString($body, 'description', '');

        $channel = $this->channelService->updateChannel($channelObjectId, $name, $description, $userId);

        Response::json([
            'success' => true,
            'message' => 'Channel updated successfully',
            'channel' => [
                'id' => (string)$channel->getId(),
                'name' => $channel->getName(),
                'description' => $channel->getDescription(),
                'visibility' => $channel->getType(),
                'created_by' => (string)$channel->getCreatedBy(),
                'created_at' => $channel->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $channel->getUpdatedAt()?->format(DATE_ATOM),
            ],
        ]);
    }

    public function delete(ObjectId $userId, string $channelId): void
    {
        $channelObjectId = Validator::objectId($channelId, 'channel_id');

        $deleted = $this->channelService->deleteChannel($channelObjectId, $userId);

        if ($deleted) {
            Response::json([
                'success' => true,
                'message' => 'Channel deleted successfully',
            ]);
        } else {
            throw new HttpException(500, 'Failed to delete channel');
        }
    }
}
