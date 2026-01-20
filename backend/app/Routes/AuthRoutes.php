<?php
declare(strict_types=1);

namespace App\Routes;

use App\Controllers\AuthController;
use App\Exceptions\HttpException;
use App\Http\Middleware\AuthMiddleware;
use App\Http\Request;
use App\Http\Router;

final class AuthRoutes
{
    public static function register(Router $router, AuthController $authController, AuthMiddleware $authMiddleware, array $body): void
    {
        $router->post('register', fn () => $authController->register($body));
        $router->post('login', fn () => $authController->login($body));
        $router->post('forgotPassword', fn () => $authController->forgotPassword($body));
        $router->post('resetPassword', fn () => $authController->resetPassword($body));

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

        $router->post('changePassword', $authMiddleware->handle(function ($userId) use ($authController, $body): void {
            $authController->changePassword($userId, $body);
        }));
    }
}

