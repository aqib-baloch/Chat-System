<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\GridFSManager;
use App\Exceptions\HttpException;
use App\Http\Response;
use App\Validation\Validator;
use MongoDB\BSON\ObjectId;

final class AttachmentController
{
    private GridFSManager $gridFs;

    public function __construct(GridFSManager $gridFs)
    {
        $this->gridFs = $gridFs;
    }

    public function upload(ObjectId $userId): void
    {
        if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
            throw new HttpException(422, 'Missing file');
        }

        $file = $_FILES['file'];
        $tmpPath = $file['tmp_name'] ?? null;
        $filename = $file['name'] ?? null;
        $size = $file['size'] ?? null;
        $type = $file['type'] ?? null;
        $error = $file['error'] ?? null;

        if (!is_string($tmpPath) || $tmpPath === '' || !is_uploaded_file($tmpPath)) {
            throw new HttpException(422, 'Invalid upload');
        }
        if ($error !== UPLOAD_ERR_OK) {
            throw new HttpException(422, 'Upload failed');
        }
        if (!is_string($filename) || trim($filename) === '') {
            $filename = 'attachment';
        }

        $metadata = [
            'uploaded_by' => $userId,
            'content_type' => is_string($type) ? $type : null,
            'size' => is_int($size) ? $size : null,
        ];

        $id = $this->gridFs->uploadFile($tmpPath, $filename, $metadata);

        Response::json([
            'success' => true,
            'attachment' => [
                'id' => (string)$id,
                'filename' => $filename,
                'content_type' => is_string($type) ? $type : null,
                'size' => is_int($size) ? $size : null,
            ],
        ], 201);
    }

    public function download(ObjectId $userId, string $fileId): void
    {
        $fileObjectId = Validator::objectId($fileId, 'file_id');

        $info = $this->gridFs->getFileInfo($fileObjectId);
        if (!$info) {
            throw new HttpException(404, 'Attachment not found');
        }

        $stream = $this->gridFs->downloadFile((string)$fileObjectId);
        if (!is_resource($stream)) {
            throw new HttpException(404, 'Attachment not found');
        }

        $filename = isset($info['filename']) && is_string($info['filename']) && $info['filename'] !== '' ? $info['filename'] : 'attachment';
        $contentType = isset($info['contentType']) && is_string($info['contentType']) && $info['contentType'] !== '' ? $info['contentType'] : 'application/octet-stream';

        http_response_code(200);
        header('Content-Type: ' . $contentType);
        header('Content-Disposition: inline; filename="' . addslashes($filename) . '"');

        fpassthru($stream);
    }
}

