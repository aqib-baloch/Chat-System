<?php
declare(strict_types=1);

namespace App\Models;

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

final class User
{
    private ?ObjectId $id;
    private string $email;
    private string $passwordHash;
    private string $name;
    private \DateTime $createdAt;

    public function __construct(
        ?ObjectId $id,
        string $email,
        string $passwordHash,
        string $name,
        \DateTime $createdAt
    ) {
        $this->id = $id;
        $this->email = strtolower(trim($email));
        $this->passwordHash = $passwordHash;
        $this->name = trim($name);
        $this->createdAt = $createdAt;
    }

    public static function createNew(string $email, string $passwordHash, string $name): self
    {
        return new self(
            null,
            $email,
            $passwordHash,
            $name,
            new \DateTime('now', new \DateTimeZone('UTC'))
        );
    }

    public function getId(): ?ObjectId
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function toArray(): array
    {
        $createdAtUtc = (clone $this->createdAt)->setTimezone(new \DateTimeZone('UTC'));

        $array = [
            'email' => $this->email,
            'password' => $this->passwordHash,
            'name' => $this->name,
            'created_at' => new UTCDateTime($createdAtUtc),
        ];

        if ($this->id !== null) {
            $array['_id'] = $this->id;
        }

        return $array;
    }

    public static function fromArray(array $data): self
    {
        $createdAtData = $data['created_at'] ?? null;
        if ($createdAtData instanceof UTCDateTime) {
            $createdAt = $createdAtData->toDateTime();
        } elseif (is_string($createdAtData)) {
            $createdAt = new \DateTime($createdAtData);
        } else {
            $createdAt = new \DateTime('now', new \DateTimeZone('UTC'));
        }

        return new self(
            $data['_id'] ?? null,
            (string)($data['email'] ?? ''),
            (string)($data['password'] ?? ''),
            (string)($data['name'] ?? ''),
            $createdAt
        );
    }
}

