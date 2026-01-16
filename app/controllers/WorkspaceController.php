<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Exceptions\HttpException;
use App\Http\Response;
use App\Services\WorkspaceService;
use App\Validation\Validator;
use MongoDB\BSON\ObjectId;

final class WorkspaceController
{
    private WorkspaceService $workspaceService;

    public function __construct(WorkspaceService $workspaceService)
    {
        $this->workspaceService = $workspaceService;
    }

    public function create(ObjectId $userId, array $body): void
    {
        $name = Validator::workspaceName(Validator::requireString($body, 'name'));
        $description = Validator::workspaceDescription(Validator::requireString($body, 'description'));

        $workspace = $this->workspaceService->createWorkspace($name, $description, $userId);

        Response::json([
            'success' => true,
            'message' => 'Workspace created successfully',
            'workspace' => [
                'id' => (string)$workspace->getId(),
                'name' => $workspace->getName(),
                'description' => $workspace->getDescription(),
                'created_by' => (string)$workspace->getCreatedBy(),
                'created_at' => $workspace->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $workspace->getUpdatedAt()?->format(DATE_ATOM),
            ],
        ], 201);
    }

    public function getAll(ObjectId $userId): void
    {
        $workspaces = $this->workspaceService->getUserWorkspaces($userId);

        $workspaceData = array_map(function ($workspace) {
            return [
                'id' => (string)$workspace->getId(),
                'name' => $workspace->getName(),
                'description' => $workspace->getDescription(),
                'created_by' => (string)$workspace->getCreatedBy(),
                'created_at' => $workspace->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $workspace->getUpdatedAt()?->format(DATE_ATOM),
            ];
        }, $workspaces);

        Response::json([
            'success' => true,
            'workspaces' => $workspaceData,
        ]);
    }

    public function getById(ObjectId $userId, string $workspaceId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');

        $workspace = $this->workspaceService->getWorkspace($workspaceObjectId, $userId);
        if (!$workspace) {
            throw new HttpException(404, 'Workspace not found');
        }

        Response::json([
            'success' => true,
            'workspace' => [
                'id' => (string)$workspace->getId(),
                'name' => $workspace->getName(),
                'description' => $workspace->getDescription(),
                'created_by' => (string)$workspace->getCreatedBy(),
                'created_at' => $workspace->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $workspace->getUpdatedAt()?->format(DATE_ATOM),
            ],
        ]);
    }

    public function update(ObjectId $userId, string $workspaceId, array $body): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');

        $existing = $this->workspaceService->getWorkspace($workspaceObjectId, $userId);
        if (!$existing) {
            throw new HttpException(404, 'Workspace not found');
        }

        $name = Validator::workspaceName(Validator::optionalString($body, 'name', $existing->getName()));
        $description = Validator::workspaceDescription(Validator::optionalString($body, 'description', $existing->getDescription()));

        $workspace = $this->workspaceService->updateWorkspace($workspaceObjectId, $name, $description, $userId);

        Response::json([
            'success' => true,
            'message' => 'Workspace updated successfully',
            'workspace' => [
                'id' => (string)$workspace->getId(),
                'name' => $workspace->getName(),
                'description' => $workspace->getDescription(),
                'created_by' => (string)$workspace->getCreatedBy(),
                'created_at' => $workspace->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $workspace->getUpdatedAt()?->format(DATE_ATOM),
            ],
        ]);
    }

    public function delete(ObjectId $userId, string $workspaceId): void
    {
        $workspaceObjectId = Validator::objectId($workspaceId, 'workspace_id');

        $deleted = $this->workspaceService->deleteWorkspace($workspaceObjectId, $userId);
        if (!$deleted) {
            throw new HttpException(500, 'Failed to delete workspace');
        }

        Response::json([
            'success' => true,
            'message' => 'Workspace deleted successfully',
        ]);
    }
}
