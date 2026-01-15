<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Models\User;
use MongoDB\BSON\ObjectId;
use MongoDB\Collection;
use MongoDB\Database as MongoDatabase;

final class UserRepository
{
    private Collection $users;

    public function __construct(MongoDatabase $db)
    {
        $this->users = $db->selectCollection('users');
    }

    public function ensureIndexes(): void
    {
        $this->users->createIndex(['email' => 1], ['unique' => true]);
    }

    
    public function findByEmail(string $email): ?User
    {
        $data = $this->users->findOne(['email' => strtolower(trim($email))]);
        if (!$data) {
            return null;
        }

        return User::fromArray($data->getArrayCopy());
    }

    public function findById(ObjectId $id): ?User
    {
        $data = $this->users->findOne(['_id' => $id]);
        if (!$data) {
            return null;
        }

        return User::fromArray($data->getArrayCopy());
    }

    public function create(User $user): User
    {
        $result = $this->users->insertOne($user->toArray());
        /** @var ObjectId $id */
        $id = $result->getInsertedId();
        $created = $this->findById($id);
        if (!$created) {
            throw new \RuntimeException('Failed to load created user');
        }
        return $created;
    }
}
