---
title: Authentication Methods
sidebar_position: 4
---

# Authentication Methods

AuthSec SDK supports two authentication methods: CIBA (push notifications) and TOTP (6-digit codes).

## Method 1: CIBA (Push Notification)

**Best for:** Voice assistants, IoT devices, hands-free authentication

### How It Works

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Your App   │         │   AuthSec   │         │ User's Phone│
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ 1. initiate_app_approval()                    │
       ├──────────────────────►│                       │
       │                       │                       │
       │                       │ 2. Push notification  │
       │                       ├──────────────────────►│
       │                       │                       │
       │ 3. poll_for_approval()│                       │
       │    (blocking)         │                       │
       ├──────────────────────►│                       │
       │                       │   3a. User approves   │
       │                       │◄──────────────────────┤
       │                       │                       │
       │ 4. Return token       │                       │
       │◄──────────────────────┤                       │
```

### Usage Example

```python
from AuthSec_SDK import CIBAClient

client = CIBAClient(client_id="your_client_id")

# Step 1: Initiate approval request
result = client.initiate_app_approval("user@example.com")
auth_req_id = result["auth_req_id"]

print(f"Push notification sent! Request ID: {auth_req_id}")

# Step 2: Wait for user approval
approval = client.poll_for_approval(
    email="user@example.com",
    auth_req_id=auth_req_id,
    interval=5,      # Poll every 5 seconds
    timeout=300      # Wait up to 5 minutes
)

# Step 3: Check result
if approval["status"] == "approved":
    token = approval["token"]
    print(f"✓ User approved! Token: {token}")
elif approval["status"] == "access_denied":
    print("✗ User denied the request")
elif approval["status"] == "timeout":
    print("Request timed out")
```

### CIBA Response Statuses

| Status | Description |
|--------|-------------|
| `approved` | User approved the authentication request |
| `access_denied` | User rejected the request |
| `timeout` | Local poll timeout reached |
| `expired_token` | Server-side request expired (>5 minutes) |
| `cancelled` | Request was cancelled via SDK |

## Method 2: TOTP (6-digit code)

**Best for:** CLI tools, backup authentication, quick verification

### How It Works

```
┌─────────────┐         ┌─────────────┐
│  Your App   │         │   AuthSec   │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ 1. User enters code   │
       │    (from auth app)    │
       │                       │
       │ 2. verify_totp()      │
       ├──────────────────────►│
       │                       │
       │ 3. Return token       │
       │◄──────────────────────┤
```

### Usage Example

```python
from AuthSec_SDK import CIBAClient

client = CIBAClient(client_id="your_client_id")

# User provides 6-digit code from authenticator app
code = input("Enter 6-digit code: ")

# Verify the code
result = client.verify_totp("user@example.com", code)

if result["success"]:
    token = result["token"]
    print(f"✓ Valid code! Token: {token}")
    print(f"Remaining attempts: {result['remaining']}")
else:
    print(f"✗ Invalid code")
    print(f"Error: {result['error']}")
    print(f"Remaining attempts: {result['remaining']}")
```

### TOTP Response Fields

**Success Response:**
```python
{
    "success": True,
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "remaining": 3
}
```

**Error Response:**
```python
{
    "success": False,
    "error": "invalid_code",  # or "too_many_retries"
    "remaining": 2
}
```

## Choosing the Right Method

| Scenario | Recommended Method | Reason |
|----------|-------------------|--------|
| Voice assistant | CIBA | Hands-free, no typing needed |
| IoT device | CIBA | Limited input capabilities |
| CLI tool | TOTP | Quick, doesn't require app check |
| Backup auth | TOTP | Works when push fails |
| High security | CIBA | Requires physical device approval |
| Offline auth | TOTP | Works without internet on client |

## Combining Both Methods

Offer users a choice for best UX:

```python
from AuthSec_SDK import CIBAClient

client = CIBAClient(client_id="your_client_id")

def authenticate_user(email):
    print("1. Push notification (AuthSec app)")
    print("2. 6-digit code")
    choice = input("Choose method (1/2): ")
    
    if choice == "1":
        result = client.initiate_app_approval(email)
        approval = client.poll_for_approval(email, result["auth_req_id"])
        
        if approval["status"] == "approved":
            return approval["token"]
        else:
            print(f"Failed: {approval['status']}")
            return None
    
    elif choice == "2":
        code = input("Enter code: ")
        result = client.verify_totp(email, code)
        
        if result["success"]:
            return result["token"]
        else:
            print(f"Failed: {result['error']}")
            return None
```

## Next Steps

- [API Reference](./api-reference) - Detailed method documentation
- [Examples](./examples) - Real-world usage examples
- [Error Handling](./error-handling) - Handle authentication errors
