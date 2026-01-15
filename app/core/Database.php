<?php
declare(strict_types=1);

namespace App\Core;

use MongoDB\Client;
use MongoDB\Database as MongoDatabase;

final class Database
{
    private static ?Database $instance = null;
    private MongoDatabase $db;

    private function __construct()
    {
        $uri = (string)(getenv('MONGO_URI') ?: 'mongodb://mongo:27017');
        $dbName = (string)(getenv('MONGO_DB') ?: 'chat_system');

        $client = new Client($uri);
        $this->db = $client->selectDatabase($dbName);
    }

    public static function getInstance(): Database
    {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getDB(): MongoDatabase
    {
        return $this->db;
    }
}

