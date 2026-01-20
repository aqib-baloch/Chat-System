<?php
declare(strict_types=1);

namespace App\Core;

use MongoDB\BSON\ObjectId;
use MongoDB\GridFS\Bucket;

final class GridFSManager
{
    private Bucket $bucket;

    public function __construct()
    {
        $db = Database::getInstance()->getDB();
        $this->bucket = $db->selectGridFSBucket();
    }

    public function uploadFile(string $filePath, string $filename, array $metadata = []): ObjectId
    {
        $stream = fopen($filePath, 'rb');
        if ($stream === false) {
            throw new \RuntimeException('Failed to open file for upload');
        }

        $id = $this->bucket->uploadFromStream($filename, $stream, ['metadata' => $metadata]);
        return $id;
    }

    public function downloadFile(string $fileId)
    {
        return $this->bucket->openDownloadStream(new ObjectId($fileId));
    }

    public function deleteFile(string $fileId): void
    {
        $this->bucket->delete(new ObjectId($fileId));
    }
}

