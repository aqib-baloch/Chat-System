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

### Forgot Password

`POST /forgotPassword`

Body:
```json
{
  "email": "user@example.com"
}
```

Success `200`:
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

Notes:
- The response is always `200` to avoid user enumeration.
- Configure SMTP via `.env` (see `.env.example`) so the email can be delivered (Mailtrap).
- The reset link uses `FRONTEND_URL` + `FRONTEND_RESET_PASSWORD_PATH` (default is hash-based `/#/reset-password`).

### Reset Password

`POST /resetPassword`

Body:
```json
{
  "token": "....",
  "password": "NewStrongPass123"
}
```

Success `200`:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

Errors:
- `400` Invalid or expired token
- `422` Validation error

### Change Password

`POST /changePassword`

Headers:
- `Authorization: Bearer <token>`

Body:
```json
{
  "current_password": "StrongPass123",
  "new_password": "NewStrongPass123"
}
```

Success `200`:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

Errors:
- `401` Unauthorized / invalid credentials
- `422` Validation error

## Channels

Channels are scoped under a workspace.

All workspace + channel routes require:
- `Authorization: Bearer <token>`

## Workspaces

### Create Workspace

`POST /workspaces`

Body:
```json
{
  "name": "Acme",
  "description": "Main workspace"
}
```

### List Workspaces

`GET /workspaces`

### Get Workspace By Id

`GET /workspaces/{workspaceId}`

### Update Workspace

`PUT /workspaces/{workspaceId}`

Body:
```json
{
  "name": "Acme",
  "description": "Updated description"
}
```
Notes:
- You can send only the fields you want to change; missing fields keep their current values.

### Delete Workspace

`DELETE /workspaces/{workspaceId}`

## Channels (Workspace scoped)

### Create Channel

`POST /workspaces/{workspaceId}/channels`

Body:
```json
{
  "name": "Notify Tasks",
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

`GET /workspaces/{workspaceId}/channels`

Success `200`:
```json
{
  "success": true,
  "channels": []
}
```

### List Public Channels

`GET /workspaces/{workspaceId}/channels/public`

### Get Channel By Id

`GET /workspaces/{workspaceId}/channels/{channelId}`

### Update Channel

`PUT /workspaces/{workspaceId}/channels/{channelId}`

Body:
```json
{
  "name": "general",
  "description": "Updated description"
}
```
Notes:
- You can send only the fields you want to change; missing fields keep their current values.

### Delete Channel

`DELETE /workspaces/{workspaceId}/channels/{channelId}`

## Messages (Workspace + Channel scoped)

All message routes require:
- `Authorization: Bearer <token>`

### List Messages

`GET /workspaces/{workspaceId}/channels/{channelId}/messages`

Optional query:
- `limit` (default 50, max 200)

### Send Message

`POST /workspaces/{workspaceId}/channels/{channelId}/messages`

Body:
```json
{
  "content": "Hello!"
}
```

### Edit Message

`PUT /workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}`

Body:
```json
{
  "content": "Updated text"
}
```

### Delete Message

`DELETE /workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}`
