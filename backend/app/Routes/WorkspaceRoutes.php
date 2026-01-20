<?php
declare(strict_types=1);

namespace App\Routes;

use App\Controllers\WorkspaceController;
use App\Http\Middleware\AuthMiddleware;
use App\Http\Router;

final class WorkspaceRoutes
{
    public static function register(Router $router, WorkspaceController $workspaceController, AuthMiddleware $authMiddleware, array $body): void
    {
        $router->post('workspaces', $authMiddleware->handle(fn ($userId) => $workspaceController->create($userId, $body)));
        $router->get('workspaces', $authMiddleware->handle(fn ($userId) => $workspaceController->getAll($userId)));
        $router->get('workspaces/{workspaceId}', $authMiddleware->handle(function ($userId, string $workspaceId) use ($workspaceController): void {
            $workspaceController->getById($userId, $workspaceId);
        }));
        $router->put('workspaces/{workspaceId}', $authMiddleware->handle(function ($userId, string $workspaceId) use ($workspaceController, $body): void {
            $workspaceController->update($userId, $workspaceId, $body);
        }));
        $router->delete('workspaces/{workspaceId}', $authMiddleware->handle(function ($userId, string $workspaceId) use ($workspaceController): void {
            $workspaceController->delete($userId, $workspaceId);
        }));
    }
}

