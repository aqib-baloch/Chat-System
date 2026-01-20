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
                'attachment_ids' => array_map(fn ($id) => (string)$id, $message->getAttachmentIds()),
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

        $attachmentIds = [];
        $raw = $body['attachment_ids'] ?? [];
        if ($raw !== null && $raw !== []) {
            if (!is_array($raw)) {
                throw new \App\Exceptions\HttpException(422, 'Invalid field: attachment_ids');
            }
            foreach ($raw as $item) {
                if (!is_string($item)) {
                    throw new \App\Exceptions\HttpException(422, 'Invalid field: attachment_ids');
                }
                $attachmentIds[] = Validator::objectId($item, 'attachment_id');
            }
        }

        $contentRaw = Validator::optionalString($body, 'content', '');
        $content = $contentRaw !== '' ? Validator::messageContent($contentRaw) : '';

        if ($content === '' && $attachmentIds === []) {
            // Keep the original validation behavior when no attachments are provided.
            Validator::messageContent($content);
        }

        $message = $attachmentIds !== []
            ? $this->messageService->sendMessageWithAttachments($workspaceObjectId, $channelObjectId, $userId, $content, $attachmentIds)
            : $this->messageService->sendMessage($workspaceObjectId, $channelObjectId, $userId, $content);

        Response::json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => [
                'id' => (string)$message->getId(),
                'workspace_id' => (string)$message->getWorkspaceId(),
                'channel_id' => (string)$message->getChannelId(),
                'sender_id' => (string)$message->getSenderId(),
                'content' => $message->getContent(),
                'attachment_ids' => array_map(fn ($id) => (string)$id, $message->getAttachmentIds()),
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
                'attachment_ids' => array_map(fn ($id) => (string)$id, $message->getAttachmentIds()),
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
                'attachment_ids' => array_map(fn ($id) => (string)$id, $message->getAttachmentIds()),
                'created_at' => $message->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $message->getUpdatedAt()?->format(DATE_ATOM),
                'deleted' => $message->isDeleted(),
            ],
        ]);
    }
}
