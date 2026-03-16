---
title: Error Handling
sidebar_position: 7
---

# Error Handling

Comprehensive guide to handling errors in the AuthSec CIBA SDK.

## Recommended Pattern

Always wrap SDK calls in try-except blocks to handle network and API errors gracefully.

```python
from AuthSec_SDK import CIBAClient
import requests

ciba = CIBAClient(client_id="your_client_id")

def safe_authenticate(email):
    """Authentication with comprehensive error handling"""
    try:
        # Initiate CIBA
        result = ciba.initiate_app_approval(email)
        
        if "error" in result:
            return {"success": False, "error": result["error"]}
        
        # Poll for approval
        approval = ciba.poll_for_approval(
            email, 
            result["auth_req_id"], 
            timeout=60
        )
        
        if approval["status"] == "approved":
            return {"success": True, "token": approval["token"]}
        else:
            return {"success": False, "error": approval["status"]}
    
    except requests.exceptions.Timeout:
        return {"success": False, "error": "network_timeout"}
    
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "connection_failed"}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

# Usage
result = safe_authenticate("user@example.com")

if result["success"]:
    print(f"Token: {result['token']}")
else:
    print(f"Error: {result['error']}")
```

---

## Common Errors

### TOTP Errors

#### `invalid_code`

**Cause:** The 6-digit TOTP code is incorrect.

**Solution:**
```python
result = ciba.verify_totp("user@example.com", code)

if not result["success"] and result["error"] == "invalid_code":
    print(f"Invalid code. {result['remaining']} attempts remaining.")
    print("Please check your authenticator app and try again.")
```

#### `too_many_retries`

**Cause:** User has failed 3 TOTP attempts.

**Solution:**
```python
result = ciba.verify_totp("user@example.com", code)

if not result["success"] and result["error"] == "too_many_retries":
    print("Too many failed attempts.")
    print("Resetting retry counter...")
    
    # Reset the counter
    ciba.cancel_approval("user@example.com")
    
    print("Please try again.")
```

---

### CIBA Errors

#### `access_denied`

**Cause:** User explicitly rejected the push notification.

**Solution:**
```python
approval = ciba.poll_for_approval(email, auth_req_id)

if approval["status"] == "access_denied":
    print("User denied the authentication request.")
    print("Would you like to try again or use TOTP instead?")
    
    choice = input("(retry/totp): ")
    
    if choice == "totp":
        code = input("Enter 6-digit code: ")
        result = ciba.verify_totp(email, code)
```

#### `expired_token`

**Cause:** CIBA request expired on the server (>5 minutes).

**Solution:**
```python
approval = ciba.poll_for_approval(email, auth_req_id)

if approval["status"] == "expired_token":
    print("Request expired. Starting new authentication...")
    
    # Initiate new request
    result = ciba.initiate_app_approval(email)
    approval = ciba.poll_for_approval(email, result["auth_req_id"])
```

#### `timeout`

**Cause:** Local poll timeout reached before user responded.

**Solution:**
```python
approval = ciba.poll_for_approval(
    email, 
    auth_req_id, 
    timeout=60  # 60 second timeout
)

if approval["status"] == "timeout":
    print("Request timed out after 60 seconds.")
    
    choice = input("Continue waiting? (y/n): ")
    
    if choice.lower() == "y":
        # Continue polling with same auth_req_id
        approval = ciba.poll_for_approval(
            email, 
            auth_req_id, 
            timeout=60
        )
    else:
        print("Authentication cancelled.")
        ciba.cancel_approval(email)
```

---

### Network Errors

#### Connection Timeout

**Cause:** Network request took too long.

**Solution:**
```python
import requests

try:
    result = ciba.initiate_app_approval(email)
except requests.exceptions.Timeout:
    print("Network timeout. Please check your internet connection.")
    print("Retrying in 5 seconds...")
    time.sleep(5)
    # Retry
    result = ciba.initiate_app_approval(email)
```

#### Connection Error

**Cause:** Cannot reach AuthSec API server.

**Solution:**
```python
import requests

try:
    result = ciba.initiate_app_approval(email)
except requests.exceptions.ConnectionError:
    print("Cannot connect to AuthSec API.")
    print("Please check:")
    print("  1. Your internet connection")
    print("  2. Firewall settings")
    print("  3. API endpoint URL")
```

---

## Error Handling Patterns

### Pattern 1: Retry with Exponential Backoff

```python
import time

def authenticate_with_retry(email, max_retries=3):
    """Retry authentication with exponential backoff"""
    
    for attempt in range(max_retries):
        try:
            result = ciba.initiate_app_approval(email)
            approval = ciba.poll_for_approval(email, result["auth_req_id"])
            
            if approval["status"] == "approved":
                return approval["token"]
            
            elif approval["status"] == "access_denied":
                # Don't retry if user explicitly denied
                return None
            
        except Exception as e:
            if attempt < max_retries - 1:
                # Exponential backoff: 2, 4, 8 seconds
                wait_time = 2 ** (attempt + 1)
                print(f"Error: {e}. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"Max retries reached. Error: {e}")
                return None
    
    return None
```

### Pattern 2: Fallback Chain

```python
def authenticate_with_fallback(email):
    """Try CIBA, fallback to TOTP if it fails"""
    
    # Try CIBA first
    try:
        result = ciba.initiate_app_approval(email)
        approval = ciba.poll_for_approval(
            email, 
            result["auth_req_id"], 
            timeout=30  # Short timeout
        )
        
        if approval["status"] == "approved":
            return approval["token"]
    
    except Exception as e:
        print(f"CIBA failed: {e}")
    
    # Fallback to TOTP
    print("Falling back to TOTP...")
    code = input("Enter 6-digit code: ")
    
    result = ciba.verify_totp(email, code)
    
    if result["success"]:
        return result["token"]
    else:
        print(f"TOTP also failed: {result['error']}")
        return None
```

### Pattern 3: User-Friendly Error Messages

```python
ERROR_MESSAGES = {
    "access_denied": "You rejected the authentication request. Please try again.",
    "timeout": "Request timed out. Please ensure your phone is nearby and try again.",
    "expired_token": "Request expired. Starting a new authentication...",
    "invalid_code": "Invalid code. Please check your authenticator app.",
    "too_many_retries": "Too many failed attempts. Please wait a moment and try again.",
    "network_timeout": "Network issue detected. Please check your connection.",
    "connection_failed": "Cannot reach authentication server. Please try again later.",
}

def get_user_friendly_error(error_code):
    """Convert error codes to user-friendly messages"""
    return ERROR_MESSAGES.get(error_code, f"An error occurred: {error_code}")

# Usage
approval = ciba.poll_for_approval(email, auth_req_id)

if approval["status"] != "approved":
    error_message = get_user_friendly_error(approval["status"])
    print(error_message)
```

### Pattern 4: Logging and Monitoring

```python
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def authenticate_with_logging(email):
    """Authentication with comprehensive logging"""
    
    logger.info(f"Starting authentication for {email}")
    
    try:
        # Initiate
        logger.debug(f"Initiating CIBA for {email}")
        result = ciba.initiate_app_approval(email)
        logger.info(f"Push sent to {email}, auth_req_id: {result['auth_req_id']}")
        
        # Poll
        logger.debug(f"Polling for approval: {email}")
        approval = ciba.poll_for_approval(email, result["auth_req_id"])
        
        if approval["status"] == "approved":
            logger.info(f"Authentication successful: {email}")
            return approval["token"]
        else:
            logger.warning(f"Authentication failed for {email}: {approval['status']}")
            return None
    
    except Exception as e:
        logger.error(f"Authentication error for {email}: {str(e)}", exc_info=True)
        return None
```

---

## Complete Error Reference

### CIBA Status Codes

| Status | Type | Description | Recommended Action |
|--------|------|-------------|-------------------|
| `approved` | Success | User approved | Continue with authentication |
| `access_denied` | User action | User rejected | Offer alternative method |
| `timeout` | Client timeout | Poll timeout reached | Retry or increase timeout |
| `expired_token` | Server timeout | Request expired (>5 min) | Start new request |
| `cancelled` | Cancelled | Request was cancelled | Start new request |

### TOTP Error Codes

| Error | Description | Recommended Action |
|-------|-------------|-------------------|
| `invalid_code` | Wrong TOTP code | Ask user to retry |
| `too_many_retries` | 3 failed attempts | Call `cancel_approval()` to reset |

### Network Exceptions

| Exception | Cause | Recommended Action |
|-----------|-------|-------------------|
| `requests.exceptions.Timeout` | Network timeout | Retry with backoff |
| `requests.exceptions.ConnectionError` | Cannot connect | Check network/firewall |
| `Exception` | General error | Log and show generic error |

---

## Best Practices

1. **Always use try-except blocks** around SDK calls
2. **Provide user-friendly error messages** instead of raw error codes
3. **Implement retry logic** for transient errors
4. **Log errors** for debugging and monitoring
5. **Offer fallback options** (CIBA → TOTP)
6. **Reset retry counters** using `cancel_approval()` when needed
7. **Set appropriate timeouts** based on your use case

---

## Next Steps

- [Examples](./examples) - See error handling in real applications
- [API Reference](./api-reference) - Complete API documentation
- [FAQ](./faq) - Common questions and troubleshooting
