<?php
declare(strict_types=1);

namespace App\Models;

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

final class Message
{
    private ?ObjectId $id;
    private ObjectId $workspaceId;
    private ObjectId $channelId;
    private ObjectId $senderId;
    private string $content;
    /** @var ObjectId[] */
    private array $attachmentIds;
    private \DateTime $createdAt;
    private ?\DateTime $updatedAt;
    private ?\DateTime $deletedAt;

    public function __construct(
        ?ObjectId $id,
        ObjectId $workspaceId,
        ObjectId $channelId,
        ObjectId $senderId,
        string $content,
        array $attachmentIds,
        \DateTime $createdAt,
        ?\DateTime $updatedAt = null,
        ?\DateTime $deletedAt = null
    ) {
        $this->id = $id;
        $this->workspaceId = $workspaceId;
        $this->channelId = $channelId;
        $this->senderId = $senderId;
        $this->content = $content;
        $this->attachmentIds = $attachmentIds;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->deletedAt = $deletedAt;
    }

    /**
     * @param ObjectId[] $attachmentIds
     */
    public static function createNew(ObjectId $workspaceId, ObjectId $channelId, ObjectId $senderId, string $content, array $attachmentIds = []): self
    {
        return new self(
            null,
            $workspaceId,
            $channelId,
            $senderId,
            $content,
            $attachmentIds,
            new \DateTime('now', new \DateTimeZone('UTC')),
            null,
            null
        );
    }

    public function getId(): ?ObjectId
    {
        return $this->id;
    }

    public function getWorkspaceId(): ObjectId
    {
        return $this->workspaceId;
    }

    public function getChannelId(): ObjectId
    {
        return $this->channelId;
    }

    public function getSenderId(): ObjectId
    {
        return $this->senderId;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    /**
     * @return ObjectId[]
     */
    public function getAttachmentIds(): array
    {
        return $this->attachmentIds;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function getDeletedAt(): ?\DateTime
    {
        return $this->deletedAt;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function updateContent(string $content): void
    {
        $this->content = $content;
        $this->updatedAt = new \DateTime('now', new \DateTimeZone('UTC'));
    }

    public function markDeleted(): void
    {
        $this->deletedAt = new \DateTime('now', new \DateTimeZone('UTC'));
    }

    public function toArray(): array
    {
        $array = [
            'workspace_id' => $this->workspaceId,
            'channel_id' => $this->channelId,
            'sender_id' => $this->senderId,
            'content' => $this->content,
            'attachment_ids' => $this->attachmentIds,
            'created_at' => new UTCDateTime($this->createdAt),
            'updated_at' => $this->updatedAt ? new UTCDateTime($this->updatedAt) : null,
            'deleted_at' => $this->deletedAt ? new UTCDateTime($this->deletedAt) : null,
        ];

        if ($this->id) {
            $array['_id'] = $this->id;
        }

        return $array;
    }

    public static function fromArray(array $data): self
    {
        $createdAtData = $data['created_at'] ?? null;
        if ($createdAtData instanceof UTCDateTime) {
            $createdAt = $createdAtData->toDateTime();
        } elseif ($createdAtData instanceof \DateTime) {
            $createdAt = $createdAtData;
        } else {
            $createdAt = new \DateTime('now', new \DateTimeZone('UTC'));
        }

        $updatedAtData = $data['updated_at'] ?? null;
        if ($updatedAtData instanceof UTCDateTime) {
            $updatedAt = $updatedAtData->toDateTime();
        } elseif ($updatedAtData instanceof \DateTime) {
            $updatedAt = $updatedAtData;
        } else {
            $updatedAt = null;
        }

        $deletedAtData = $data['deleted_at'] ?? null;
        if ($deletedAtData instanceof UTCDateTime) {
            $deletedAt = $deletedAtData->toDateTime();
        } elseif ($deletedAtData instanceof \DateTime) {
            $deletedAt = $deletedAtData;
        } else {
            $deletedAt = null;
        }

        $attachmentIds = [];
        $rawAttachmentIds = $data['attachment_ids'] ?? [];
        if (is_array($rawAttachmentIds)) {
            foreach ($rawAttachmentIds as $item) {
                if ($item instanceof ObjectId) {
                    $attachmentIds[] = $item;
                }
            }
        }

        return new self(
            $data['_id'] ?? null,
            $data['workspace_id'],
            $data['channel_id'],
            $data['sender_id'],
            (string)($data['content'] ?? ''),
            $attachmentIds,
            $createdAt,
            $updatedAt,
            $deletedAt
        );
    }
}
