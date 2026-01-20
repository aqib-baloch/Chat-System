<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Http\Response;
use App\Services\MessageService;
use App\Validation\Validator;
use MongoDB\BSON\ObjectId;

final class MessageController
{
    private MessageService $messageService;

    public function __construct(MessageService $messageService)
    {
        $this->messageService = $messageService;
    }

    public function list(ObjectId $userId, string $workspaceId, string $channelId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

        $messages = $this->messageService->listMessages($workspaceObjectId, $channelObjectId, $userId, $limit);

        $data = array_map(function ($message) {
            return [
                'id' => (string)$message->getId(),
                'workspace_id' => (string)$message->getWorkspaceId(),
                'channel_id' => (string)$message->getChannelId(),
                'sender_id' => (string)$message->getSenderId(),
                'content' => $message->getContent(),
                'created_at' => $message->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $message->getUpdatedAt()?->format(DATE_ATOM),
            ];
        }, $messages);

        Response::json([
            'success' => true,
            'messages' => $data,
        ]);
    }

    public function send(ObjectId $userId, string $workspaceId, string $channelId, array $body): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');
        $content = Validator::messageContent(Validator::requireString($body, 'content'));

        $message = $this->messageService->sendMessage($workspaceObjectId, $channelObjectId, $userId, $content);

        Response::json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => [
                'id' => (string)$message->getId(),
                'workspace_id' => (string)$message->getWorkspaceId(),
                'channel_id' => (string)$message->getChannelId(),
                'sender_id' => (string)$message->getSenderId(),
                'content' => $message->getContent(),
                'created_at' => $message->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $message->getUpdatedAt()?->format(DATE_ATOM),
            ],
        ], 201);
    }

    public function update(ObjectId $userId, string $workspaceId, string $channelId, string $messageId, array $body): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');
        $messageObjectId = Validator::objectId($messageId, 'message_id');
        $content = Validator::messageContent(Validator::requireString($body, 'content'));

        $message = $this->messageService->editMessage($workspaceObjectId, $channelObjectId, $messageObjectId, $userId, $content);

        Response::json([
            'success' => true,
            'message' => 'Message updated successfully',
            'data' => [
                'id' => (string)$message->getId(),
                'workspace_id' => (string)$message->getWorkspaceId(),
                'channel_id' => (string)$message->getChannelId(),
                'sender_id' => (string)$message->getSenderId(),
                'content' => $message->getContent(),
                'created_at' => $message->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $message->getUpdatedAt()?->format(DATE_ATOM),
            ],
        ]);
    }

    public function delete(ObjectId $userId, string $workspaceId, string $channelId, string $messageId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');
        $channelObjectId = Validator::objectId($channelId, 'channel_id');
        $messageObjectId = Validator::objectId($messageId, 'message_id');

        $message = $this->messageService->deleteMessage($workspaceObjectId, $channelObjectId, $messageObjectId, $userId);

        Response::json([
            'success' => true,
            'message' => 'Message deleted successfully',
            'data' => [
                'id' => (string)$message->getId(),
                'workspace_id' => (string)$message->getWorkspaceId(),
                'channel_id' => (string)$message->getChannelId(),
                'sender_id' => (string)$message->getSenderId(),
                'content' => $message->getContent(),
                'created_at' => $message->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $message->getUpdatedAt()?->format(DATE_ATOM),
                'deleted' => $message->isDeleted(),
            ],
        ]);
    }
}
