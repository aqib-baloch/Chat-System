<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\SmtpMailer;
use App\Exceptions\HttpException;
use App\Models\User;
use App\Repositories\AuthTokenRepository;
use App\Repositories\PasswordResetRepository;
use App\Repositories\UserRepository;
use MongoDB\Driver\Exception\BulkWriteException;
use MongoDB\BSON\ObjectId;
final class AuthService
{
    private UserRepository $userRepo;
    private AuthTokenRepository $tokenRepo;
    private PasswordResetRepository $passwordResetRepo;
    private SmtpMailer $mailer;
    private int $tokenTtlSeconds;
    private int $passwordResetTtlSeconds;

    public function __construct(
        UserRepository $userRepo,
        AuthTokenRepository $tokenRepo,
        PasswordResetRepository $passwordResetRepo,
        SmtpMailer $mailer,
        int $tokenTtlSeconds = 604800,
        int $passwordResetTtlSeconds = 3600
    ) {
        $this->userRepo = $userRepo;
        $this->tokenRepo = $tokenRepo;
        $this->passwordResetRepo = $passwordResetRepo;
        $this->mailer = $mailer;
        $this->tokenTtlSeconds = $tokenTtlSeconds;
        $this->passwordResetTtlSeconds = $passwordResetTtlSeconds;
    }

    public function register(string $email, string $password, string $name): User
    {
        if ($this->userRepo->findByEmail($email)) {
            throw new HttpException(409, 'Email already registered');
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $user = User::createNew($email, $hash, $name);

        try {
            $created = $this->userRepo->create($user);
        } catch (BulkWriteException $e) {
            $message = $e->getMessage();
            if (str_contains($message, 'E11000') && str_contains($message, 'email')) {
                throw new HttpException(409, 'Email already registered');
            }
            throw $e;
        }
        if (!$created->getId()) {
            throw new HttpException(500, 'User creation failed');
        }

        return $created;
    }

    public function login(string $email, string $password, ?string $ip, ?string $userAgent): array
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user) {
            throw new HttpException(401, 'Invalid credentials');
        }

        if (!password_verify($password, $user->getPasswordHash())) {
            throw new HttpException(401, 'Invalid credentials');
        }

        $userId = $user->getId();
        if (!$userId) {
            throw new HttpException(500, 'User record missing id');
        }

        $token = $this->tokenRepo->issueToken($userId, $this->tokenTtlSeconds, $ip, $userAgent);
        return ['user' => $user, 'token' => $token['token'], 'expiresAt' => $token['expiresAt']];
    }

    public function logout(string $token): void
    {
        $this->tokenRepo->revokeToken($token);
    }

    public function authenticate(string $token): User
    {
        $userId = $this->tokenRepo->findUserIdByValidToken($token);
        if (!$userId) {
            throw new HttpException(401, 'Unauthorized');
        }

        $user = $this->userRepo->findById($userId);
        if (!$user) {
            throw new HttpException(401, 'Unauthorized');
        }

        return $user;
    }

    public function requestPasswordReset(string $email, ?string $ip, ?string $userAgent): void
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user) {
            return;
        }

        $userId = $user->getId();
        if (!$userId instanceof ObjectId) {
            return;
        }

        $this->passwordResetRepo->invalidateAllForUser($userId);
        $issued = $this->passwordResetRepo->issueToken($userId, $this->passwordResetTtlSeconds, $ip, $userAgent);

        $frontendUrl = (string)(getenv('FRONTEND_URL') ?: 'http://localhost:3000');
        $path = (string)(getenv('FRONTEND_RESET_PASSWORD_PATH') ?: '/#/reset-password');
        $resetBase = rtrim($frontendUrl, '/') . self::normalizeFrontendResetPath($path);
        $resetLink = $resetBase . (str_contains($resetBase, '?') ? '&' : '?') . 'token=' . urlencode($issued['token']);

        $subject = 'Reset your password';
        $minutes = (int)floor($this->passwordResetTtlSeconds / 60);
        $textBody = "You requested a password reset.\n\nReset link:\n{$resetLink}\n\nThis link expires in {$minutes} minutes.\nIf you did not request this, you can ignore this email.\n";

        $safeLink = htmlspecialchars($resetLink, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $htmlBody = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>'
            . '<body style="margin:0;padding:0;background:#f5f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">'
            . '<div style="max-width:560px;margin:0 auto;padding:24px;">'
            . '<div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e7eaf3;">'
            . '<h1 style="margin:0 0 12px;font-size:20px;color:#111827;">Reset your password</h1>'
            . '<p style="margin:0 0 18px;font-size:14px;line-height:20px;color:#374151;">You requested a password reset. Click the button below to set a new password.</p>'
            . '<div style="margin:18px 0;">'
            . '<a href="' . $safeLink . '" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:600;font-size:14px;">Reset password</a>'
            . '</div>'
            . '<p style="margin:0 0 10px;font-size:12px;line-height:18px;color:#6b7280;">If the button doesn’t work, use this link:</p>'
            . '<p style="margin:0 0 18px;font-size:12px;line-height:18px;word-break:break-all;"><a href="' . $safeLink . '" style="color:#2563eb;text-decoration:underline;">' . $safeLink . '</a></p>'
            . '<p style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">This link expires in ' . $minutes . " minutes.</p>"
            . '<p style="margin:10px 0 0;font-size:12px;line-height:18px;color:#6b7280;">If you did not request this, you can safely ignore this email.</p>'
            . '</div>'
            . '<div style="text-align:center;color:#9ca3af;font-size:12px;margin-top:14px;">Chat System</div>'
            . '</div></body></html>';

        $this->mailer->send($user->getEmail(), $subject, $textBody, $htmlBody);
    }

    private static function normalizeFrontendResetPath(string $path): string
    {
        $path = trim($path);
        if ($path === '') {
            return '/#/reset-password';
        }

        if (str_starts_with($path, '#')) {
            $path = '/' . $path;
        }

        if (!str_starts_with($path, '/')) {
            $path = '/' . $path;
        }

        if (!str_contains($path, '#')) {
            $path = '/#' . $path;
        }

        return $path;
    }

    public function resetPassword(string $token, string $newPassword): void
    {
        $userId = $this->passwordResetRepo->findUserIdByValidToken($token);
        if (!$userId) {
            throw new HttpException(400, 'Invalid or expired token');
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->userRepo->updatePasswordHash($userId, $hash);

        $this->passwordResetRepo->markUsed($token);
        $this->passwordResetRepo->invalidateAllForUser($userId);
        $this->tokenRepo->revokeAllForUser($userId);
    }

    public function changePassword(ObjectId $userId, string $currentPassword, string $newPassword): void
    {
        $user = $this->userRepo->findById($userId);
        if (!$user) {
            throw new HttpException(401, 'Unauthorized');
        }

        if (!password_verify($currentPassword, $user->getPasswordHash())) {
            throw new HttpException(401, 'Invalid credentials');
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->userRepo->updatePasswordHash($userId, $hash);
    }
}
