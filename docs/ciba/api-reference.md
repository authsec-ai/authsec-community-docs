---
title: API Reference
sidebar_position: 5
---

# API Reference

Complete reference for all AuthSec CIBA SDK methods.

## CIBAClient

Main client class for authentication operations.

```python
from AuthSec_SDK import CIBAClient
```

---

## initiate_app_approval(email)

Sends a CIBA push notification to the user's AuthSec mobile app.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | str | Yes | User's email address |

### Returns

```python
{
    "auth_req_id": "ar_abc123...",  # Use this for polling
    "expires_in": 300,              # Request expires in 5 minutes
    "interval": 5                   # Recommended poll interval (seconds)
}
```

### Example

```python
result = client.initiate_app_approval("user@example.com")
auth_req_id = result["auth_req_id"]
print(f"Push notification sent! Request ID: {auth_req_id}")
```

### Notes

- Request expires after 5 minutes (300 seconds)
- User must have AuthSec mobile app installed
- Returns immediately (doesn't wait for user approval)

---

## poll_for_approval(email, auth_req_id, interval=5, timeout=300)

Polls for CIBA approval status. **This method blocks** until user approves, denies, or timeout is reached.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `email` | str | Yes | - | User's email address |
| `auth_req_id` | str | Yes | - | Request ID from `initiate_app_approval()` |
| `interval` | int | No | 5 | Seconds between polls |
| `timeout` | int | No | 300 | Maximum seconds to wait |

### Returns

**Success:**
```python
{
    "status": "approved",
    "token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**User Denied:**
```python
{
    "status": "access_denied"
}
```

**Timeout (client-side):**
```python
{
    "status": "timeout"
}
```

**Expired (server-side, >5 min):**
```python
{
    "status": "expired_token"
}
```

**Cancelled:**
```python
{
    "status": "cancelled"
}
```

### Example

```python
result = client.poll_for_approval(
    email="user@example.com",
    auth_req_id=auth_req_id,
    interval=2,      # Poll every 2 seconds
    timeout=60       # Wait up to 60 seconds
)

if result["status"] == "approved":
    token = result["token"]
    print(f"✓ User approved! Token: {token}")
elif result["status"] == "access_denied":
    print("✗ User denied the request")
elif result["status"] == "timeout":
    print("Request timed out after 60 seconds")
```

### Notes

- This method **blocks** the current thread
- For non-blocking behavior, use threading (see [Examples](./examples#example-3-non-blocking-ciba-with-threading))
- Automatically handles retry logic and exponential backoff
- Respects the `interval` returned from `initiate_app_approval()`

---

## verify_totp(email, code)

Verifies a 6-digit TOTP code for authentication.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | str | Yes | User's email address |
| `code` | str | Yes | 6-digit TOTP code |

### Returns

**Success:**
```python
{
    "success": True,
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "remaining": 3  # Remaining attempts before lockout
}
```

**Invalid Code:**
```python
{
    "success": False,
    "error": "invalid_code",
    "remaining": 2  # Attempts left
}
```

**Too Many Attempts:**
```python
{
    "success": False,
    "error": "too_many_retries",
    "remaining": 0
}
```

### Example

```python
result = client.verify_totp("user@example.com", "123456")

if result["success"]:
    print(f"✓ Valid code! Token: {result['token']}")
    print(f"Remaining attempts: {result['remaining']}")
else:
    print(f"✗ Invalid code: {result['error']}")
    print(f"Attempts left: {result['remaining']}")
```

### Notes

- Users have 3 attempts before temporary lockout
- Call `cancel_approval()` to reset retry counter
- TOTP codes rotate every 30 seconds
- Accepts codes from Google Authenticator, Authy, etc.

---

## cancel_approval(email)

Cancels ongoing polling operations and resets retry counters for the given email.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | str | Yes | User's email address |

### Returns

```python
{
    "status": "cancelled"
}
```

### Example

```python
# Cancel ongoing authentication
client.cancel_approval("user@example.com")
print("Authentication cancelled and retry counter reset")
```

### Notes

- Stops any active `poll_for_approval()` operations for this email
- Resets TOTP retry counter to 3 attempts
- Useful for "Cancel" buttons in UI
- Safe to call even if no operation is in progress

---

## Error Handling

All methods may raise exceptions for network or API errors:

```python
import requests

try:
    result = client.initiate_app_approval("user@example.com")
except requests.exceptions.Timeout:
    print("Network timeout")
except requests.exceptions.ConnectionError:
    print("Connection failed")
except Exception as e:
    print(f"Error: {e}")
```

See [Error Handling](./error-handling) for complete error handling patterns.

---

## Return Value Types

### status field values

| Value | Method | Description |
|-------|--------|-------------|
| `approved` | `poll_for_approval()` | User approved request |
| `access_denied` | `poll_for_approval()` | User rejected request |
| `timeout` | `poll_for_approval()` | Client-side timeout reached |
| `expired_token` | `poll_for_approval()` | Server-side expiration (>5 min) |
| `cancelled` | `poll_for_approval()`, `cancel_approval()` | Request was cancelled |

### error field values

| Value | Method | Description |
|-------|--------|-------------|
| `invalid_code` | `verify_totp()` | TOTP code is incorrect |
| `too_many_retries` | `verify_totp()` | 3 failed attempts reached |

---

## Next Steps

- [Examples](./examples) - See real-world usage patterns
- [Error Handling](./error-handling) - Learn robust error handling
- [Authentication Methods](./authentication-methods) - Understand CIBA vs TOTP
