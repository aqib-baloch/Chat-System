<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Controllers\AuthController;
use App\Controllers\ChannelController;
use App\Controllers\WorkspaceController;
use App\Core\Database;
use App\Exceptions\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Http\Router;
use App\Http\Middleware\AuthMiddleware;
use App\Repositories\AuthTokenRepository;
use App\Repositories\ChannelRepository;
use App\Repositories\UserRepository;
use App\Repositories\WorkspaceRepository;
use App\Services\AuthService;
use App\Services\ChannelService;
use App\Services\WorkspaceService;

try {
    $db = Database::getInstance()->getDB();

    $userRepo = new UserRepository($db);
    $userRepo->ensureIndexes();
    $tokenRepo = new AuthTokenRepository();
    $authService = new AuthService($userRepo, $tokenRepo);
    $authController = new AuthController($authService);

    $workspaceRepo = new WorkspaceRepository($db);
    $workspaceRepo->ensureIndexes();
    $workspaceService = new WorkspaceService($workspaceRepo, $userRepo);
    $workspaceController = new WorkspaceController($workspaceService);

    $channelRepo = new ChannelRepository($db);
    $channelRepo->ensureIndexes();
    $channelService = new ChannelService($channelRepo, $userRepo, $workspaceRepo);
    $channelController = new ChannelController($channelService);
    $authMiddleware = new AuthMiddleware($tokenRepo);

    $method = Request::method();
    $path = Request::path();
    $body = Request::jsonBody();

    $router = new Router();

    // Auth routes
    $router->post('register', fn () => $authController->register($body));
    $router->post('login', fn () => $authController->login($body));

    $router->post('logout', function () use ($authController): void {
        $token = Request::bearerToken();
        if (!$token) {
            throw new HttpException(401, 'Unauthorized');
        }
        $authController->logout($token);
    });

    $router->get('getUser', function () use ($authController): void {
        $token = Request::bearerToken();
        if (!$token) {
            throw new HttpException(401, 'Unauthorized');
        }
        $authController->getUser($token);
    });

    // Workspace routes
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

    // Channel routes (scoped under workspace)
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

    $router->dispatch($method, $path);
} catch (HttpException $e) {
    Response::error($e);
} catch (\Throwable $e) {
    Response::throwable($e);
}
