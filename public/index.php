<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Controllers\AuthController;
use App\Controllers\ChannelController;
use App\Core\Database;
use App\Exceptions\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Http\Router;
use App\Http\Middleware\AuthMiddleware;
use App\Repositories\AuthTokenRepository;
use App\Repositories\ChannelRepository;
use App\Repositories\UserRepository;
use App\Services\AuthService;
use App\Services\ChannelService;

try {
    $db = Database::getInstance()->getDB();

    $userRepo = new UserRepository($db);
    $userRepo->ensureIndexes();
    $tokenRepo = new AuthTokenRepository();
    $authService = new AuthService($userRepo, $tokenRepo);
    $authController = new AuthController($authService);

    $channelRepo = new ChannelRepository($db);
    $channelRepo->ensureIndexes();
    $channelService = new ChannelService($channelRepo, $userRepo);
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

    // Channel routes
    $router->post('channels', $authMiddleware->handle(fn ($userId) => $channelController->create($userId, $body)));
    $router->get('channels', $authMiddleware->handle(fn ($userId) => $channelController->getAll($userId)));
    $router->get('channels/public', fn () => $channelController->getPublic());
    $router->get('channels/{channelId}', $authMiddleware->handle(function ($userId, string $channelId) use ($channelController): void {
        $channelController->getById($userId, $channelId);
    }));
    $router->put('channels/{channelId}', $authMiddleware->handle(function ($userId, string $channelId) use ($channelController, $body): void {
        $channelController->update($userId, $channelId, $body);
    }));
    $router->delete('channels/{channelId}', $authMiddleware->handle(function ($userId, string $channelId) use ($channelController): void {
        $channelController->delete($userId, $channelId);
    }));

    $router->dispatch($method, $path);
} catch (HttpException $e) {
    Response::error($e);
} catch (\Throwable $e) {
    Response::throwable($e);
}
