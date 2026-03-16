---
title: FAQ
sidebar_position: 8
---

# Frequently Asked Questions

Common questions and answers about the AuthSec CIBA SDK.

## General Questions

### What's the difference between Admin and Tenant flow?

**Admin flow** (`client_id=None`):
- Platform-level authentication
- Uses `/ciba/initiate` and `/ciba/token` endpoints
- For internal admin tools and platform management
- No client scoping

```python
client = CIBAClient()  # Admin flow
```

**Tenant flow** (`client_id="xxx"`):
- Multi-tenant, client-scoped authentication
- Uses `/tenant/ciba/initiate` and `/tenant/ciba/token` endpoints
- For customer-facing applications
- Each tenant has isolated authentication

```python
client = CIBAClient(client_id="your_client_id")  # Tenant flow
```

**When to use which:**
- Use Admin flow for: Internal admin panels, platform management tools
- Use Tenant flow for: Customer applications, multi-tenant SaaS, API access

---

### How long is a CIBA request valid?

By default, CIBA requests expire after **5 minutes (300 seconds)**.

- Users must approve within this window
- After expiration, you'll receive `expired_token` status
- You can set a shorter client-side timeout using the `timeout` parameter

```python
# Server-side expiration: 5 minutes
# Client-side timeout: 60 seconds
approval = ciba.poll_for_approval(
    email, 
    auth_req_id, 
    timeout=60  # Will timeout after 60 seconds locally
)
```

---

### Can I run multiple authentications simultaneously?

**Yes!** The SDK tracks state per email address, so you can authenticate multiple users concurrently.

```python
import threading
from AuthSec_SDK import CIBAClient

client = CIBAClient(client_id="your_client_id")

def auth_user(email):
    result = client.initiate_app_approval(email)
    approval = client.poll_for_approval(email, result["auth_req_id"])
    print(f"{email}: {approval['status']}")

# Authenticate 3 users simultaneously
threads = [
    threading.Thread(target=auth_user, args=("user1@example.com",)),
    threading.Thread(target=auth_user, args=("user2@example.com",)),
    threading.Thread(target=auth_user, args=("user3@example.com",))
]

for t in threads:
    t.start()

for t in threads:
    t.join()
```

See [Examples - Multi-User Authentication](./examples#example-6-multi-user-authentication) for more details.

---

### What happens if the user doesn't have the AuthSec app?

If the user doesn't have the AuthSec mobile app installed:

1. The push notification won't be delivered
2. `poll_for_approval()` will eventually timeout
3. You should offer **TOTP as a fallback** authentication method

**Recommended pattern:**
```python
# Try CIBA first
result = ciba.initiate_app_approval(email)
approval = ciba.poll_for_approval(email, result["auth_req_id"], timeout=30)

if approval["status"] == "timeout":
    print("Looks like you don't have the AuthSec app.")
    print("Let's use a verification code instead.")
    
    # Fallback to TOTP
    code = input("Enter 6-digit code: ")
    result = ciba.verify_totp(email, code)
```

---

### How do I get a client_id?

**Option 1: Contact AuthSec Support**
- Email: support@authsec.dev
- Provide: Company name, use case, contact email

**Option 2: Admin API**
Create a tenant programmatically:

```bash
curl -X POST https://dev.api.authsec.dev/api/v1/admin/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "email": "admin@company.com"
  }'
```

Response:
```json
{
  "client_id": "tenant_abc123...",
  "name": "My Company",
  "email": "admin@company.com"
}
```

---

## Technical Questions

### Is `poll_for_approval()` blocking?

**Yes**, `poll_for_approval()` **blocks** the current thread until:
- User approves the request
- User denies the request
- Timeout is reached
- Request expires on server

**For non-blocking behavior**, use threading:

```python
import threading

def async_poll(email, auth_req_id):
    approval = ciba.poll_for_approval(email, auth_req_id)
    print(f"Result: {approval['status']}")

thread = threading.Thread(target=async_poll, args=(email, auth_req_id))
thread.start()

# Your app continues running...
```

See [Examples - Non-Blocking CIBA](./examples#example-3-non-blocking-ciba-with-threading) for complete implementation.

---

### How many TOTP attempts do users get?

Users get **3 attempts** before the retry counter locks them out.

After 3 failed attempts:
- `verify_totp()` returns `"error": "too_many_retries"`
- User cannot try again until counter is reset

**To reset the counter:**
```python
ciba.cancel_approval(email)
```

**Recommended pattern:**
```python
result = ciba.verify_totp(email, code)

if not result["success"]:
    if result["error"] == "too_many_retries":
        print("Too many failed attempts.")
        print("Please wait a moment...")
        
        # Reset and ask user to try again
        ciba.cancel_approval(email)
        time.sleep(5)  # Brief cooldown
```

---

### Can I customize the poll interval?

**Yes**, you can set a custom poll interval:

```python
approval = ciba.poll_for_approval(
    email,
    auth_req_id,
    interval=2,  # Poll every 2 seconds
    timeout=120  # Wait up to 2 minutes
)
```

**Recommendations:**
- **Default (5s)**: Good for most use cases
- **Fast (2-3s)**: Better UX for CLI tools, but more API calls
- **Slow (10s)**: Reduce API load for background processes

**Note:** The server may return a recommended `interval` in the `initiate_app_approval()` response - respect it when possible.

---

### What TOTP algorithms are supported?

The SDK supports standard **TOTP (Time-based One-Time Password)** as defined in [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238):

- **Algorithm**: HMAC-SHA1
- **Digits**: 6
- **Period**: 30 seconds

Compatible with all standard authenticator apps:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any RFC 6238-compliant app

---

### How do I handle network issues?

Use try-except blocks to catch network exceptions:

```python
import requests
import time

def safe_initiate(email, retries=3):
    """Initiate with automatic retry on network errors"""
    
    for attempt in range(retries):
        try:
            return ciba.initiate_app_approval(email)
        
        except requests.exceptions.Timeout:
            print(f"Network timeout (attempt {attempt + 1}/{retries})")
            if attempt < retries - 1:
                time.sleep(2)
        
        except requests.exceptions.ConnectionError:
            print(f"Connection failed (attempt {attempt + 1}/{retries})")
            if attempt < retries - 1:
                time.sleep(2)
    
    raise Exception("Failed after all retries")
```

See [Error Handling](./error-handling) for comprehensive patterns.

---

## Security Questions

### Are the tokens secure?

**Yes.** The SDK returns **JWT (JSON Web Tokens)** that are:
- Signed by AuthSec server
- Time-limited (expire after a set period)
- Cryptographically verified
- Contain user claims and permissions

**Best practices:**
- Store tokens securely (encrypted storage, environment variables)
- Never log tokens in plaintext
- Implement token refresh if needed
- Clear tokens on logout

---

### What happens if someone steals my client_id?

The `client_id` is **not a secret**. It's used for:
- Routing requests to the correct tenant
- Scoping authentication operations
- Identifying the application

**Security measures:**
- CIBA requires user approval on their mobile device
- TOTP requires knowledge of the 6-digit code
- Authentication is still bound to specific users
- Tokens are issued only after successful verification

However, to prevent abuse:
- Implement rate limiting
- Monitor for suspicious activity
- Use IP whitelisting if possible
- Contact support if `client_id` is compromised

---

## Troubleshooting

### `poll_for_approval()` returns `timeout` immediately

**Cause:** The `timeout` parameter is set too low.

**Solution:**
```python
# Increase timeout
approval = ciba.poll_for_approval(
    email,
    auth_req_id,
    timeout=120  # Wait up to 2 minutes
)
```

---

### Push notification not received on mobile

**Possible causes:**
1. User doesn't have AuthSec app installed
2. User hasn't enabled push notifications
3. User's phone is offline
4. Notification was blocked by OS

**Solutions:**
- Offer TOTP as fallback
- Ask user to check notification settings
- Verify user has the app installed
- Check if request expired (>5 minutes)

---

### `invalid_code` error for valid TOTP codes

**Possible causes:**
1. Clock skew between client and server
2. Code from previous 30-second window
3. Wrong account in authenticator app

**Solutions:**
- Ensure device time is synced (automatic time)
- Wait for next code (codes rotate every 30s)
- Verify correct account selected in auth app
- Try regenerating TOTP secret

---

### Multiple users being authenticated as the same user

**Cause:** Not properly isolating email addresses in concurrent operations.

**Solution:** The SDK handles this automatically - each email has isolated state. Ensure you're passing the correct `email` parameter:

```python
# ✓ Correct - different emails
approval1 = ciba.poll_for_approval("user1@example.com", auth_req_id_1)
approval2 = ciba.poll_for_approval("user2@example.com", auth_req_id_2)

# ✗ Wrong - same email for different users
approval1 = ciba.poll_for_approval("user1@example.com", auth_req_id_1)
approval2 = ciba.poll_for_approval("user1@example.com", auth_req_id_2)  # Problem!
```

---

## Best Practices

### Should I use CIBA or TOTP?

**Use CIBA when:**
- Building voice assistants or IoT devices
- Users prefer hands-free authentication
- You want better security (requires physical device)
- User experience is a priority

**Use TOTP when:**
- Building CLI tools (faster for power users)
- CIBA push notification fails
- As a backup/fallback method
- User doesn't have mobile app

**Best approach:** Offer both and let users choose.

---

### How should I store the authentication token?

**Server-side applications:**
```python
# Store in session or database
session["auth_token"] = token
```

**Client-side applications:**
```python
# Use secure storage
import keyring
keyring.set_password("authsec", "user@example.com", token)
```

**Environment variables:**
```bash
export AUTHSEC_TOKEN="eyJhbGciOiJSUzI1NiIs..."
```

**Never:**
- Hardcode in source code
- Log in plaintext
- Store in unencrypted files
- Share across users

---

### What's the recommended timeout for production?

**Development:** 30-60 seconds (faster feedback)
**Production:** 120-300 seconds (better UX)

```python
# Production recommendation
approval = ciba.poll_for_approval(
    email,
    auth_req_id,
    interval=5,
    timeout=180  # 3 minutes
)
```

Consider user context:
- **CLI tools**: 60s (users want quick auth)
- **Voice assistants**: 120s (may need time to find phone)
- **IoT devices**: 300s (matches server-side expiration)

---

## Support

Still have questions?

- **Email**: support@authsec.dev
- **Documentation**: [authsec.dev/docs](https://authsec.dev/docs)
- **GitHub Issues**: [github.com/authsec-ai/sdk-authsec](https://github.com/authsec-ai/sdk-authsec)

---

## Next Steps

- [Examples](./examples) - See real-world implementations
- [Error Handling](./error-handling) - Handle errors gracefully
- [API Reference](./api-reference) - Complete method documentation
