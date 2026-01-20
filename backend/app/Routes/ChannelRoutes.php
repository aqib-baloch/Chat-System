<?php
declare(strict_types=1);

namespace App\Routes;

use App\Controllers\ChannelController;
use App\Http\Middleware\AuthMiddleware;
use App\Http\Router;

final class ChannelRoutes
{
    public static function register(Router $router, ChannelController $channelController, AuthMiddleware $authMiddleware, array $body): void
    {
        $router->post('workspaces/{workspaceId}/channels', $authMiddleware->handle(function ($userId, string $workspaceId) use ($channelController, $body): void {
            $channelController->create($userId, $workspaceId, $body);
        }));
        $router->get('workspaces/{workspaceId}/channels', $authMiddleware->handle(function ($userId, string $workspaceId) use ($channelController): void {
            $channelController->getAll($userId, $workspaceId);
        }));
        $router->get('workspaces/{workspaceId}/channels/public', $authMiddleware->handle(function ($userId, string $workspaceId) use ($channelController): void {
            $channelController->getPublic($userId, $workspaceId);
        }));
        $router->get('workspaces/{workspaceId}/channels/{channelId}', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId) use ($channelController): void {
            $channelController->getById($userId, $workspaceId, $channelId);
        }));
        $router->put('workspaces/{workspaceId}/channels/{channelId}', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId) use ($channelController, $body): void {
            $channelController->update($userId, $workspaceId, $channelId, $body);
        }));
        $router->delete('workspaces/{workspaceId}/channels/{channelId}', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId) use ($channelController): void {
            $channelController->delete($userId, $workspaceId, $channelId);
        }));

        // Channel membership
        $router->post('workspaces/{workspaceId}/channels/{channelId}/members', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId) use ($channelController, $body): void {
            $channelController->addMember($userId, $workspaceId, $channelId, $body);
        }));

        $router->delete('workspaces/{workspaceId}/channels/{channelId}/members/{memberUserId}', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId, string $memberUserId) use ($channelController): void {
            $channelController->removeMember($userId, $workspaceId, $channelId, $memberUserId);
        }));
    }
}
