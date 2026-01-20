<?php
declare(strict_types=1);

namespace App\Services;

use App\Exceptions\HttpException;
use App\Models\Workspace;
use App\Repositories\UserRepository;
use App\Repositories\WorkspaceRepository;
use MongoDB\BSON\ObjectId;
use MongoDB\Driver\Exception\BulkWriteException;

final class WorkspaceService
{
    private WorkspaceRepository $workspaceRepo;
    private UserRepository $userRepo;

    public function __construct(WorkspaceRepository $workspaceRepo, UserRepository $userRepo)
    {
        $this->workspaceRepo = $workspaceRepo;
        $this->userRepo = $userRepo;
    }

    public function createWorkspace(string $name, string $description, ObjectId $createdBy): Workspace
    {
        $user = $this->userRepo->findById($createdBy);
        if (!$user) {
            throw new HttpException(401, 'Unauthorized');
        }

        if ($this->workspaceRepo->findByName($name)) {
            throw new HttpException(409, 'Workspace name already exists');
        }

        $workspace = Workspace::createNew($name, $description, $createdBy);

        try {
            return $this->workspaceRepo->create($workspace);
        } catch (BulkWriteException $e) {
            $message = $e->getMessage();
            if (str_contains($message, 'E11000') && str_contains($message, 'name')) {
                throw new HttpException(409, 'Workspace name already exists');
            }
            throw $e;
        }
    }

    public function getWorkspace(ObjectId $workspaceId, ObjectId $userId): ?Workspace
    {
        $workspace = $this->workspaceRepo->findById($workspaceId);
        if (!$workspace) {
            return null;
        }
        return $workspace;
    }

    public function getAllWorkspaces(): array
    {
        return $this->workspaceRepo->findAll();
    }

    public function updateWorkspace(ObjectId $workspaceId, string $name, string $description, ObjectId $userId): Workspace
    {
        $workspace = $this->workspaceRepo->findById($workspaceId);
        if (!$workspace) {
            throw new HttpException(404, 'Workspace not found');
        }

        if ((string)$workspace->getCreatedBy() !== (string)$userId) {
            throw new HttpException(403, 'Forbidden');
        }

        if ($name !== $workspace->getName()) {
            $existing = $this->workspaceRepo->findByName($name);
            if ($existing && (string)$existing->getId() !== (string)$workspaceId) {
                throw new HttpException(409, 'Workspace name already exists');
            }
        }

        $workspace->update($name, $description);
        $this->workspaceRepo->update($workspace);

        return $workspace;
    }

    public function deleteWorkspace(ObjectId $workspaceId, ObjectId $userId): bool
    {
        $workspace = $this->workspaceRepo->findById($workspaceId);
        if (!$workspace) {
            throw new HttpException(404, 'Workspace not found');
        }

        if ((string)$workspace->getCreatedBy() !== (string)$userId) {
            throw new HttpException(403, 'Forbidden');
        }

        return $this->workspaceRepo->delete($workspaceId);
    }
}
