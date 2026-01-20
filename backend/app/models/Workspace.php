<?php
declare(strict_types=1);

namespace App\Models;

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

final class Workspace
{
    private ?ObjectId $id;
    private string $name;
    private string $description;
    private ObjectId $createdBy;
    private \DateTime $createdAt;
    private ?\DateTime $updatedAt;

    public function __construct(
        ?ObjectId $id,
        string $name,
        string $description,
        ObjectId $createdBy,
        \DateTime $createdAt,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->name = trim($name);
        $this->description = trim($description);
        $this->createdBy = $createdBy;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    public static function createNew(string $name, string $description, ObjectId $createdBy): self
    {
        return new self(
            null,
            $name,
            $description,
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

    public function toArray(): array
    {
        $array = [
            'name' => $this->name,
            'description' => $this->description,
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
            (string)($data['name'] ?? ''),
            (string)($data['description'] ?? ''),
            $data['created_by'],
            $createdAt,
            $updatedAt
        );
    }
}

