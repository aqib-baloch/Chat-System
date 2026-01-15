<?php
declare(strict_types=1);

namespace App\Models;

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

final class Channel
{
    public const TYPE_PUBLIC = 'public';
    public const TYPE_PRIVATE = 'private';

    private ?ObjectId $id;
    private string $name;
    private string $description;
    private string $type; // 'public' or 'private'
    private ObjectId $createdBy;
    private \DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?ObjectId $id,
        string $name,
        string $description,
        string $type,
        ObjectId $createdBy,
        \DateTime $createdAt,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->name = trim($name);
        $this->description = trim($description);
        $this->type = $type;
        $this->createdBy = $createdBy;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    public static function createNew(
        string $name,
        string $description,
        string $type,
        ObjectId $createdBy
    ): self {
        return new self(
            null,
            $name,
            $description,
            $type,
            $createdBy,
            new \DateTime('now', new \DateTimeZone('UTC')),
            null
        );
    }

    public function getId(): ?ObjectId
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function isPublic(): bool
    {
        return $this->type === self::TYPE_PUBLIC;
    }

    public function isPrivate(): bool
    {
        return $this->type === self::TYPE_PRIVATE;
    }

    public function getCreatedBy(): ObjectId
    {
        return $this->createdBy;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function update(string $name, string $description): void
    {
        $this->name = trim($name);
        $this->description = trim($description);
        $this->updatedAt = new \DateTime('now', new \DateTimeZone('UTC'));
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

        return new self(
            $data['_id'] ?? null,
            $data['name'],
            $data['description'],
            $data['type'],
            $data['created_by'],
            $createdAt,
            $updatedAt
        );
    }

    public function toArray(): array
    {
        $array = [
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'created_by' => $this->createdBy,
            'created_at' => new UTCDateTime($this->createdAt),
        ];

        if ($this->updatedAt) {
            $array['updated_at'] = new UTCDateTime($this->updatedAt);
        }

        if ($this->id) {
            $array['_id'] = $this->id;
        }

        return $array;
    }
}
