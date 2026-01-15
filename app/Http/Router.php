<?php
declare(strict_types=1);

namespace App\Http;

use App\Exceptions\HttpException;

final class Router
{
    /** @var array<int, array{method:string, pattern:string, handler:callable}> */
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    public function options(string $path, callable $handler): void
    {
        $this->add('OPTIONS', $path, $handler);
    }

    public function add(string $method, string $path, callable $handler): void
    {
        $method = strtoupper($method);
        $pattern = self::compilePattern($path);

        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $path): void
    {
        $method = strtoupper($method);
        $path = trim($path, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $matches = [];
            if (!preg_match($route['pattern'], $path, $matches)) {
                continue;
            }

            array_shift($matches);
            ($route['handler'])(...$matches);
                return;
        }

        throw new HttpException(404, 'Not found');
    }

    private static function compilePattern(string $path): string
    {
        $path = trim($path, '/');

        // Support simple placeholders like "channels/{id}".
        $regex = preg_replace('/\{[a-zA-Z_][a-zA-Z0-9_]*\}/', '([^/]+)', $path);
        if (!is_string($regex)) {
            $regex = $path;
        }

        return '~^' . $regex . '$~';
    }
}
