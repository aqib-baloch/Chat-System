<?php
declare(strict_types=1);

namespace App\Core;

final class SmtpMailer
{
    private string $host;
    private int $port;
    private string $username;
    private string $password;
    private string $encryption;
    private string $fromEmail;
    private string $fromName;
    private int $timeoutSeconds;

    public function __construct(
        string $host,
        int $port,
        string $username,
        string $password,
        string $encryption,
        string $fromEmail,
        string $fromName,
        int $timeoutSeconds = 10
    ) {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
        $this->encryption = strtolower(trim($encryption));
        $this->fromEmail = $fromEmail;
        $this->fromName = $fromName;
        $this->timeoutSeconds = $timeoutSeconds;
    }

    public static function fromEnv(): self
    {
        $host = (string)(getenv('SMTP_HOST') ?: '');
        $port = (int)(getenv('SMTP_PORT') ?: 587);
        $username = (string)(getenv('SMTP_USERNAME') ?: '');
        $password = (string)(getenv('SMTP_PASSWORD') ?: '');
        $encryption = (string)(getenv('SMTP_ENCRYPTION') ?: 'starttls');
        $fromEmail = (string)(getenv('SMTP_FROM_EMAIL') ?: 'no-reply@example.com');
        $fromName = (string)(getenv('SMTP_FROM_NAME') ?: 'Chat System');

        return new self($host, $port, $username, $password, $encryption, $fromEmail, $fromName);
    }

    public function sendText(string $toEmail, string $subject, string $textBody): void
    {
        $this->send($toEmail, $subject, $textBody, null);
    }

    public function send(string $toEmail, string $subject, string $textBody, ?string $htmlBody = null): void
    {
        $missing = [];
        if (trim($this->host) === '') {
            $missing[] = 'SMTP_HOST';
        }
        if (trim($this->username) === '') {
            $missing[] = 'SMTP_USERNAME';
        }
        if (trim($this->password) === '') {
            $missing[] = 'SMTP_PASSWORD';
        }
        if ($missing !== []) {
            throw new \RuntimeException('SMTP is not configured (missing ' . implode('/', $missing) . ')');
        }

        $socket = @fsockopen($this->host, $this->port, $errno, $errstr, $this->timeoutSeconds);
        if (!is_resource($socket)) {
            throw new \RuntimeException("SMTP connection failed: {$errstr} ({$errno})");
        }

        try {
            $this->expect($socket, [220]);
            $this->write($socket, 'EHLO localhost');
            $ehlo = $this->readMultiline($socket);
            $supportsStartTls = stripos($ehlo, 'STARTTLS') !== false;

            if (in_array($this->encryption, ['tls', 'starttls'], true) && $supportsStartTls) {
                $this->write($socket, 'STARTTLS');
                $this->expect($socket, [220]);

                $ok = @stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                if ($ok !== true) {
                    throw new \RuntimeException('SMTP STARTTLS negotiation failed');
                }

                $this->write($socket, 'EHLO localhost');
                $this->readMultiline($socket);
            }

            $this->write($socket, 'AUTH LOGIN');
            $this->expect($socket, [334]);
            $this->write($socket, base64_encode($this->username));
            $this->expect($socket, [334]);
            $this->write($socket, base64_encode($this->password));
            $this->expect($socket, [235]);

            $fromEmail = $this->sanitizeEmail($this->fromEmail);
            $toEmail = $this->sanitizeEmail($toEmail);

            $this->write($socket, 'MAIL FROM:<' . $fromEmail . '>');
            $this->expect($socket, [250]);
            $this->write($socket, 'RCPT TO:<' . $toEmail . '>');
            $this->expect($socket, [250, 251]);

            $this->write($socket, 'DATA');
            $this->expect($socket, [354]);

            $headers = [
                'From: ' . $this->formatFromHeader($fromEmail, $this->fromName),
                'To: <' . $toEmail . '>',
                'Subject: ' . $this->encodeHeader($subject),
                'MIME-Version: 1.0',
            ];

            if ($htmlBody !== null) {
                $boundary = 'b1_' . bin2hex(random_bytes(12));
                $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';

                $textPart = $this->normalizeNewlines($textBody);
                $htmlPart = $this->normalizeNewlines($htmlBody);

                $data = implode("\r\n", $headers) . "\r\n\r\n";
                $data .= '--' . $boundary . "\r\n";
                $data .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n";
                $data .= $textPart . "\r\n\r\n";
                $data .= '--' . $boundary . "\r\n";
                $data .= "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n";
                $data .= $htmlPart . "\r\n\r\n";
                $data .= '--' . $boundary . "--\r\n";
            } else {
                $headers[] = 'Content-Type: text/plain; charset=UTF-8';
                $headers[] = 'Content-Transfer-Encoding: 8bit';
                $data = implode("\r\n", $headers) . "\r\n\r\n" . $this->normalizeNewlines($textBody) . "\r\n";
            }

            $data = $this->dotStuff($data);

            $this->rawWrite($socket, $data . "\r\n.\r\n");
            $this->expect($socket, [250]);

            $this->write($socket, 'QUIT');
            $this->expect($socket, [221, 250]);
        } finally {
            fclose($socket);
        }
    }

    private function write($socket, string $command): void
    {
        $this->rawWrite($socket, $command . "\r\n");
    }

    private function rawWrite($socket, string $data): void
    {
        $written = @fwrite($socket, $data);
        if ($written === false) {
            throw new \RuntimeException('SMTP write failed');
        }
    }

    private function expect($socket, array $okCodes): void
    {
        $line = $this->readLine($socket);
        if (!preg_match('/^(\\d{3})\\s/', $line, $m)) {
            throw new \RuntimeException('SMTP invalid response: ' . trim($line));
        }
        $code = (int)$m[1];
        if (!in_array($code, $okCodes, true)) {
            throw new \RuntimeException('SMTP error (' . $code . '): ' . trim($line));
        }
    }

    private function readLine($socket): string
    {
        $line = @fgets($socket, 8192);
        if (!is_string($line)) {
            throw new \RuntimeException('SMTP read failed');
        }
        return $line;
    }

    private function readMultiline($socket): string
    {
        $all = '';
        while (true) {
            $line = $this->readLine($socket);
            $all .= $line;
            if (!preg_match('/^\\d{3}-/', $line)) {
                break;
            }
        }
        return $all;
    }

    private function sanitizeEmail(string $email): string
    {
        $email = trim($email);
        if ($email === '' || preg_match('/[\\r\\n<>]/', $email)) {
            throw new \RuntimeException('Invalid email address');
        }
        return $email;
    }

    private function encodeHeader(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }
        if (preg_match('/[\\x80-\\xFF]/', $value)) {
            return '=?UTF-8?B?' . base64_encode($value) . '?=';
        }
        return $value;
    }

    private function formatFromHeader(string $email, string $name): string
    {
        $name = trim($name);
        if ($name === '') {
            return '<' . $email . '>';
        }
        $safeName = preg_replace('/[\\r\\n"]+/', '', $name);
        if (!is_string($safeName)) {
            $safeName = $name;
        }
        return '"' . $this->encodeHeader($safeName) . "\" <{$email}>";
    }

    private function normalizeNewlines(string $text): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        return str_replace("\n", "\r\n", $text);
    }

    private function dotStuff(string $data): string
    {
        return preg_replace('/(^|\\r\\n)\\./', "$1..", $data) ?? $data;
    }
}
