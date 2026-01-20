<?php
declare(strict_types=1);

namespace App\Services;

use App\Exceptions\HttpException;
use App\Models\Message;
use App\Repositories\ChannelMemberRepository;
use App\Repositories\ChannelRepository;
use App\Repositories\MessageRepository;
use MongoDB\BSON\ObjectId;

final class MessageService
{
    private MessageRepository $messageRepo;
    private ChannelRepository $channelRepo;
    private ChannelMemberRepository $channelMemberRepo;

    public function __construct(
        MessageRepository $messageRepo,
        ChannelRepository $channelRepo,
        ChannelMemberRepository $channelMemberRepo
    ) {
        $this->messageRepo = $messageRepo;
        $this->channelRepo = $channelRepo;
        $this->channelMemberRepo = $channelMemberRepo;
    }

    public function listMessages(ObjectId $workspaceId, ObjectId $channelId, ObjectId $userId, int $limit = 50): array
    {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel || (string)$channel->getWorkspaceId() !== (string)$workspaceId) {
            throw new HttpException(404, 'Channel not found');
        }

        if (!$this->canUserReadChannel($channelId, $channel->isPublic(), $channel->getCreatedBy(), $userId)) {
            throw new HttpException(403, 'Forbidden');
        }

        return $this->messageRepo->listByChannel($workspaceId, $channelId, $limit);
    }

    public function sendMessage(ObjectId $workspaceId, ObjectId $channelId, ObjectId $userId, string $content): Message
    {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel || (string)$channel->getWorkspaceId() !== (string)$workspaceId) {
            throw new HttpException(404, 'Channel not found');
        }

        if (!$this->canUserPostChannel($channelId, $channel->isPublic(), $channel->getCreatedBy(), $userId)) {
            throw new HttpException(403, 'Forbidden');
        }

        $message = Message::createNew($workspaceId, $channelId, $userId, $content);
        return $this->messageRepo->create($message);
    }

    /**
     * @param ObjectId[] $attachmentIds
     */
    public function sendMessageWithAttachments(
        ObjectId $workspaceId,
        ObjectId $channelId,
        ObjectId $userId,
        string $content,
        array $attachmentIds
    ): Message {
        $channel = $this->channelRepo->findById($channelId);
        if (!$channel || (string)$channel->getWorkspaceId() !== (string)$workspaceId) {
            throw new HttpException(404, 'Channel not found');
        }

        if (!$this->canUserPostChannel($channelId, $channel->isPublic(), $channel->getCreatedBy(), $userId)) {
            throw new HttpException(403, 'Forbidden');
        }

        $message = Message::createNew($workspaceId, $channelId, $userId, $content, $attachmentIds);
        return $this->messageRepo->create($message);
    }

    public function editMessage(
        ObjectId $workspaceId,
        ObjectId $channelId,
        ObjectId $messageId,
        ObjectId $userId,
        string $content
    ): Message {
        $message = $this->messageRepo->findById($messageId);
        if (!$message) {
            throw new HttpException(404, 'Message not found');
        }

        if ((string)$message->getWorkspaceId() !== (string)$workspaceId || (string)$message->getChannelId() !== (string)$channelId) {
            throw new HttpException(404, 'Message not found');
        }

        $channel = $this->channelRepo->findById($channelId);
        if (!$channel || (string)$channel->getWorkspaceId() !== (string)$workspaceId) {
            throw new HttpException(404, 'Channel not found');
        }

        if (!$this->canUserPostChannel($channelId, $channel->isPublic(), $channel->getCreatedBy(), $userId)) {
            throw new HttpException(403, 'Forbidden');
        }

        if ((string)$message->getSenderId() !== (string)$userId) {
            throw new HttpException(403, 'Forbidden');
        }

        if ($message->isDeleted()) {
            throw new HttpException(409, 'Message deleted');
        }

        $message->updateContent($content);
        $this->messageRepo->update($message);
        return $message;
    }

    public function deleteMessage(ObjectId $workspaceId, ObjectId $channelId, ObjectId $messageId, ObjectId $userId): Message
    {
        $message = $this->messageRepo->findById($messageId);
        if (!$message) {
            throw new HttpException(404, 'Message not found');
        }

        if ((string)$message->getWorkspaceId() !== (string)$workspaceId || (string)$message->getChannelId() !== (string)$channelId) {
            throw new HttpException(404, 'Message not found');
        }

        $channel = $this->channelRepo->findById($channelId);
        if (!$channel || (string)$channel->getWorkspaceId() !== (string)$workspaceId) {
            throw new HttpException(404, 'Channel not found');
        }

        if (!$this->canUserPostChannel($channelId, $channel->isPublic(), $channel->getCreatedBy(), $userId)) {
            throw new HttpException(403, 'Forbidden');
        }

        if ((string)$message->getSenderId() !== (string)$userId) {
            throw new HttpException(403, 'Forbidden');
        }

        if ($message->isDeleted()) {
            return $message;
        }

        $message->markDeleted();
        $this->messageRepo->update($message);
        return $message;
    }

    private function canUserReadChannel(ObjectId $channelId, bool $isPublic, ObjectId $createdBy, ObjectId $userId): bool
    {
        if ($isPublic) {
            return true;
        }

        if ((string)$createdBy === (string)$userId) {
            return true;
        }

        return $this->channelMemberRepo->isMember($channelId, $userId);
    }

    private function canUserPostChannel(ObjectId $channelId, bool $isPublic, ObjectId $createdBy, ObjectId $userId): bool
    {
        return $this->canUserReadChannel($channelId, $isPublic, $createdBy, $userId);
    }
}
