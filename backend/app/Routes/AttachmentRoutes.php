<?php
declare(strict_types=1);

namespace App\Routes;

use App\Controllers\AttachmentController;
use App\Http\Middleware\AuthMiddleware;
use App\Http\Router;

final class AttachmentRoutes
{
    public static function register(Router $router, AttachmentController $attachmentController, AuthMiddleware $authMiddleware): void
    {
        $router->post('attachments', $authMiddleware->handle(function ($userId) use ($attachmentController): void {
            $attachmentController->upload($userId);
        }));

        $router->get('attachments/{fileId}', $authMiddleware->handle(function ($userId, string $fileId) use ($attachmentController): void {
            $attachmentController->download($userId, $fileId);
        }));
    }
}

