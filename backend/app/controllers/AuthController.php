<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\AuthService;
use App\Validation\Validator;
use MongoDB\BSON\ObjectId;

final class AuthController
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(array $body): void
    {
        $email = Validator::email(Validator::requireString($body, 'email'));
        $password = Validator::password(Validator::requireString($body, 'password'));
        $name = Validator::name(Validator::requireString($body, 'name'));

        $user = $this->authService->register($email, $password, $name);

        Response::json([
            'success' => true,
            'message' => 'User registered successfully',
            'user_id' => (string)$user->getId(),
        ], 201);
    }

    public function login(array $body): void
    {
        $email = Validator::email(Validator::requireString($body, 'email'));
        $password = Validator::requireString($body, 'password');

        $result = $this->authService->login($email, $password, Request::ip(), Request::userAgent());

        Response::json([
            'success' => true,
            'user_id' => (string)$result['user']->getId(),
            'token' => $result['token'],
            'expires_at' => $result['expiresAt']->format(DATE_ATOM),
        ], 200);
    }

    public function logout(string $token): void
    {
        $this->authService->logout($token);
        Response::json(['success' => true], 200);
    }

    public function getUser(string $token): void
    {
        $user = $this->authService->authenticate($token);

        Response::json([
            'success' => true,
            'user' => [
                'id' => (string)$user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'created_at' => $user->getCreatedAt()->format(DATE_ATOM),
            ],
        ], 200);
    }

    public function forgotPassword(array $body): void
    {
        $email = Validator::email(Validator::requireString($body, 'email'));
        $this->authService->requestPasswordReset($email, Request::ip(), Request::userAgent());

        Response::json([
            'success' => true,
            'message' => 'If the email exists, a reset link has been sent',
        ], 200);
    }

    public function resetPassword(array $body): void
    {
        $token = Validator::requireString($body, 'token');
        $newPassword = Validator::password(Validator::requireString($body, 'password'));

        $this->authService->resetPassword($token, $newPassword);

        Response::json([
            'success' => true,
            'message' => 'Password reset successfully',
        ], 200);
    }

    public function changePassword(ObjectId $userId, array $body): void
    {
        $currentPassword = Validator::requireString($body, 'current_password');
        $newPassword = Validator::password(Validator::requireString($body, 'new_password'));

        $this->authService->changePassword($userId, $currentPassword, $newPassword);

        Response::json([
            'success' => true,
            'message' => 'Password changed successfully',
        ], 200);
    }
}
