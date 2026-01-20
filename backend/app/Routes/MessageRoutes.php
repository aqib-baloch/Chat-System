<?php
declare(strict_types=1);

namespace App\Routes;

use App\Controllers\MessageController;
use App\Http\Middleware\AuthMiddleware;
use App\Http\Router;

final class MessageRoutes
{
    public static function register(Router $router, MessageController $messageController, AuthMiddleware $authMiddleware, array $body): void
    {
        $router->get('workspaces/{workspaceId}/channels/{channelId}/messages', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId) use ($messageController): void {
            $messageController->list($userId, $workspaceId, $channelId);
        }));
        $router->post('workspaces/{workspaceId}/channels/{channelId}/messages', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId) use ($messageController, $body): void {
            $messageController->send($userId, $workspaceId, $channelId, $body);
        }));
        $router->put('workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId, string $messageId) use ($messageController, $body): void {
            $messageController->update($userId, $workspaceId, $channelId, $messageId, $body);
        }));
        $router->delete('workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}', $authMiddleware->handle(function ($userId, string $workspaceId, string $channelId, string $messageId) use ($messageController): void {
            $messageController->delete($userId, $workspaceId, $channelId, $messageId);
        }));
    }
}

