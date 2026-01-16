<?php
declare(strict_types=1);

namespace App\Validation;

use App\Exceptions\HttpException;

final class Validator
{
    public static function requireString(array $data, string $key): string
    {
        $value = $data[$key] ?? null;
        if (!is_string($value)) {
            throw new HttpException(422, "Invalid field: {$key}");
        }
        $value = trim($value);
        if ($value === '') {
            throw new HttpException(422, "Missing field: {$key}");
        }
        return $value;
    }

    public static function optionalString(array $data, string $key, string $default = ''): string
    {
        $value = $data[$key] ?? null;
        if ($value === null) {
            return $default;
        }
        if (!is_string($value)) {
            throw new HttpException(422, "Invalid field: {$key}");
        }
        return trim($value);
    }

    public static function channelVisibility(string $visibility): string
    {
        $visibility = strtolower(trim($visibility));
        if (!in_array($visibility, ['public', 'private'], true)) {
            throw new HttpException(422, 'Channel visibility must be "public" or "private"');
        }
        return $visibility;
    }

    public static function objectId(string $value, string $field = 'id'): \MongoDB\BSON\ObjectId
    {
        $value = trim($value);
        if (!preg_match('/^[a-f0-9]{24}$/i', $value)) {
            throw new HttpException(422, "Invalid field: {$field}");
        }
        return new \MongoDB\BSON\ObjectId($value);
    }

    public static function email(string $email): string
    {
        $email = strtolower(trim($email));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new HttpException(422, 'Invalid email');
        }
        return $email;
    }

    public static function name(string $name): string
    {
        $name = trim($name);
        if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
            throw new HttpException(422, 'Invalid name');
        }
        return $name;
    }

    public static function password(string $password): string
    {
        $password = (string)$password;
        if (strlen($password) < 8) {
            throw new HttpException(422, 'Password must be at least 8 characters');
        }
        if (!preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            throw new HttpException(422, 'Password must include upper, lower, and number');
        }
        return $password;
    }

    public static function channelName(string $name): string
    {
        $name = trim($name);
        if (mb_strlen($name) < 2 || mb_strlen($name) > 50) {
            throw new HttpException(422, 'Channel name must be between 2 and 50 characters');
        }
        if (!preg_match('/^[a-zA-Z0-9_-]+(?: [a-zA-Z0-9_-]+)*$/', $name)) {
            throw new HttpException(422, 'Channel name can only contain letters, numbers, spaces, underscores, and hyphens');
        }
        return $name;
    }

    public static function channelDescription(string $description): string
    {
        $description = trim($description);
        if (mb_strlen($description) < 2 || mb_strlen($description) > 500) {
            throw new HttpException(422, 'Channel description must be between 2 and 500 characters');
        }
        return $description;
    }

    public static function workspaceName(string $name): string
    {
        $name = trim($name);
        if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
            throw new HttpException(422, 'Workspace name must be between 2 and 80 characters');
        }
        return $name;
    }

    public static function workspaceDescription(string $description): string
    {
        $description = trim($description);
        if (mb_strlen($description) < 2 || mb_strlen($description) > 1000) {
            throw new HttpException(422, 'Workspace description must be between 2 and 1000 characters');
        }
        return $description;
    }
}
