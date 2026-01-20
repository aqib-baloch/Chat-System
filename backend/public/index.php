<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Controllers\AuthController;
use App\Controllers\AttachmentController;
use App\Controllers\ChannelController;
use App\Controllers\MessageController;
use App\Controllers\WorkspaceController;
use App\Core\Database;
use App\Core\GridFSManager;
use App\Core\SmtpMailer;
use App\Exceptions\HttpException;
use App\Http\Request;
use App\Http\Response;
use App\Http\Router;
use App\Http\Middleware\AuthMiddleware;
use App\Repositories\AuthTokenRepository;
use App\Repositories\ChannelMemberRepository;
use App\Repositories\ChannelRepository;
use App\Repositories\MessageRepository;
use App\Repositories\PasswordResetRepository;
use App\Repositories\UserRepository;
use App\Repositories\WorkspaceRepository;
use App\Routes\AttachmentRoutes;
use App\Routes\AuthRoutes;
use App\Routes\ChannelRoutes;
use App\Routes\MessageRoutes;
use App\Routes\WorkspaceRoutes;
use App\Services\AuthService;
use App\Services\ChannelService;
use App\Services\MessageService;
use App\Services\WorkspaceService;

try {
    $db = Database::getInstance()->getDB();

    $userRepo = new UserRepository($db);
    $userRepo->ensureIndexes();
    $tokenRepo = new AuthTokenRepository();
    $tokenRepo->ensureIndexes();
    $passwordResetRepo = new PasswordResetRepository($db);
    $passwordResetRepo->ensureIndexes();
    $mailer = SmtpMailer::fromEnv();
    $authService = new AuthService($userRepo, $tokenRepo, $passwordResetRepo, $mailer);
    $authController = new AuthController($authService);

    $workspaceRepo = new WorkspaceRepository($db);
    $workspaceRepo->ensureIndexes();
    $workspaceService = new WorkspaceService($workspaceRepo, $userRepo);
    $workspaceController = new WorkspaceController($workspaceService);

    $channelRepo = new ChannelRepository($db);
    $channelRepo->ensureIndexes();
    $channelMemberRepo = new ChannelMemberRepository($db);
    $channelMemberRepo->ensureIndexes();
    $channelService = new ChannelService($channelRepo, $userRepo, $workspaceRepo, $channelMemberRepo);
    $channelController = new ChannelController($channelService);

    $messageRepo = new MessageRepository($db);
    $messageRepo->ensureIndexes();
    $messageService = new MessageService($messageRepo, $channelRepo, $channelMemberRepo);
    $messageController = new MessageController($messageService);
    $authMiddleware = new AuthMiddleware($tokenRepo);

    $gridFs = new GridFSManager();
    $attachmentController = new AttachmentController($gridFs);

    $method = Request::method();
    $path = Request::path();
    $body = Request::jsonBody();

    $router = new Router();

    AuthRoutes::register($router, $authController, $authMiddleware, $body);
    WorkspaceRoutes::register($router, $workspaceController, $authMiddleware, $body);
    ChannelRoutes::register($router, $channelController, $authMiddleware, $body);
    MessageRoutes::register($router, $messageController, $authMiddleware, $body);
    AttachmentRoutes::register($router, $attachmentController, $authMiddleware);

    $router->dispatch($method, $path);
} catch (HttpException $e) {
    Response::error($e);
} catch (\Throwable $e) {
    Response::throwable($e);
}
