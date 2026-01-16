<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Models\Workspace;
use MongoDB\BSON\ObjectId;
use MongoDB\Collection;
use MongoDB\Database as MongoDatabase;

final class WorkspaceRepository
{
    private Collection $workspaces;

    public function __construct(MongoDatabase $db)
    {
        $this->workspaces = $db->selectCollection('workspaces');
    }

    public function ensureIndexes(): void
    {
        $this->workspaces->createIndex(['name' => 1], ['unique' => true]);
        $this->workspaces->createIndex(['created_by' => 1]);
    }

    public function findById(ObjectId $id): ?Workspace
    {
        $data = $this->workspaces->findOne(['_id' => $id]);
        if (!$data) {
            return null;
        }

        return Workspace::fromArray($data->getArrayCopy());
    }

    public function findByName(string $name): ?Workspace
    {
        $data = $this->workspaces->findOne(['name' => trim($name)]);
        if (!$data) {
            return null;
        }

        return Workspace::fromArray($data->getArrayCopy());
    }

    public function findByCreator(ObjectId $userId): array
    {
        $cursor = $this->workspaces->find(['created_by' => $userId], ['sort' => ['created_at' => -1]]);
        $workspaces = [];
        foreach ($cursor as $data) {
            $workspaces[] = Workspace::fromArray($data->getArrayCopy());
        }
        return $workspaces;
    }

    public function create(Workspace $workspace): Workspace
    {
        $result = $this->workspaces->insertOne($workspace->toArray());
        /** @var ObjectId $id */
        $id = $result->getInsertedId();

        return new Workspace(
            $id,
            $workspace->getName(),
            $workspace->getDescription(),
            $workspace->getCreatedBy(),
            $workspace->getCreatedAt(),
            $workspace->getUpdatedAt()
        );
    }

    public function update(Workspace $workspace): bool
    {
        if (!$workspace->getId()) {
            return false;
        }

        $set = $workspace->toArray();
        unset($set['_id'], $set['created_by'], $set['created_at']);

        $result = $this->workspaces->updateOne(
            ['_id' => $workspace->getId()],
            ['$set' => $set]
        );

        return $result->getModifiedCount() > 0;
    }

    public function delete(ObjectId $id): bool
    {
        $result = $this->workspaces->deleteOne(['_id' => $id]);
        return $result->getDeletedCount() > 0;
    }
}

