# API Documentation (Chat System)

Base URL: your server root (example: `http://localhost`)

All responses are JSON.

## Authentication

This project uses a custom opaque token (not JWT, not PHP sessions).

Tokens are issued on **login** (not on registration).

Send the token on authenticated routes:

`Authorization: Bearer <token>`

### Register

`POST /register`

Body:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "name": "User Name"
}
```

Success `201`:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user_id": "65f..."
}
```

Errors:
- `409` Email already registered
- `422` Validation error

### Login

`POST /login`

Body:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

Success `200`:
```json
{
  "success": true,
  "user_id": "65f...",
  "token": "....",
  "expires_at": "2026-01-01T00:00:00+00:00"
}
```

Errors:
- `401` Invalid credentials
- `422` Validation error

### Logout

`POST /logout`

Headers:
- `Authorization: Bearer <token>`

Success `200`:
```json
{ "success": true }
```

Errors:
- `401` Unauthorized (missing/invalid token)

### Current User

`GET /getUser`

Headers:
- `Authorization: Bearer <token>`

Success `200`:
```json
{
  "success": true,
  "user": {
    "id": "65f...",
    "email": "user@example.com",
    "name": "User Name",
    "created_at": "2026-01-01T00:00:00+00:00"
  }
}
```

Errors:
- `401` Unauthorized (missing/invalid/expired token)

## Channels

All channel routes require:
- `Authorization: Bearer <token>`

### Create Channel

`POST /channels`

Body:
```json
{
  "name": "general",
  "description": "General chat",
  "visibility": "public"
}
```

Success `201`:
```json
{
  "success": true,
  "message": "Channel created successfully",
  "channel": {
    "id": "65f...",
    "name": "general",
    "description": "General chat",
    "visibility": "public"
  }
}
```

Errors:
- `401` Unauthorized
- `409` Channel name already exists
- `422` Validation error

### List Accessible Channels

`GET /channels`

Success `200`:
```json
{
  "success": true,
  "channels": []
}
```

### List Public Channels

`GET /channels/public`

### Get Channel By Id

`GET /channels/{channelId}`

### Update Channel

`PUT /channels/{channelId}`

Body:
```json
{
  "name": "general",
  "description": "Updated description"
}
```

### Delete Channel

`DELETE /channels/{channelId}`
