---
title: Overview
sidebar_position: 1
---

# AuthSec CIBA SDK

Passwordless authentication SDK for voice clients and applications using CIBA (Client-Initiated Backchannel Authentication) and TOTP.

## What is CIBA?

CIBA (Client-Initiated Backchannel Authentication) is an OpenID Connect authentication flow that enables passwordless authentication through push notifications to a user's mobile device.

## Key Features

- **Push Notification Authentication** - Users approve login requests via mobile app
- **TOTP Backup** - 6-digit code fallback for quick verification
- **Multi-Tenant Support** - Admin and tenant-scoped authentication flows
- **Non-Blocking** - Async polling support for better UX
- **Simple API** - Just 3 main methods to authenticate users

## 30-Second Quick Start

```python
from AuthSec_SDK import CIBAClient

# Initialize client
client = CIBAClient(client_id="your_tenant_client_id")

# Option 1: CIBA - Push notification to user's mobile app
result = client.initiate_app_approval("user@example.com")
approval = client.poll_for_approval("user@example.com", result["auth_req_id"])

if approval["status"] == "approved":
    print(f"✓ Authenticated! Token: {approval['token']}")

# Option 2: TOTP - 6-digit verification code
result = client.verify_totp("user@example.com", "123456")

if result["success"]:
    print(f"✓ Authenticated! Token: {result['token']}")
```

## Use Cases

- **Voice Assistants** - Hands-free authentication for Alexa, Google Assistant
- **IoT Devices** - Passwordless login for smart devices
- **CLI Tools** - Secure command-line authentication
- **Desktop Applications** - User-friendly auth without typing passwords
- **Backup Authentication** - TOTP as fallback when push isn't available

## Next Steps

- [Installation](./installation) - Install the SDK and dependencies
- [Configuration](./configuration) - Initialize the client properly
- [Authentication Methods](./authentication-methods) - Learn CIBA and TOTP flows
- [API Reference](./api-reference) - Complete API documentation
- [Examples](./examples) - Real-world usage examples
