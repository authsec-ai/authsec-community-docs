---
title: Configuration
sidebar_position: 3
---

# Configuration

## Initialize the Client

### Admin Flow (Platform-level access)

For platform-level authentication without client scoping:

```python
from AuthSec_SDK import CIBAClient

client = CIBAClient()
```

This uses:
- `/ciba/initiate` endpoint
- `/ciba/token` endpoint
- Platform-level authentication
- Best for internal admin tools

### Tenant Flow (Client-scoped access)

For multi-tenant, client-scoped authentication:

```python
from AuthSec_SDK import CIBAClient

client = CIBAClient(client_id="your_tenant_client_id")
```

This uses:
- `/tenant/ciba/initiate` endpoint
- `/tenant/ciba/token` endpoint
- Client-scoped authentication
- Best for customer-facing applications

### Custom Base URL

Override the default API endpoint:

```python
from AuthSec_SDK import CIBAClient

client = CIBAClient(
    client_id="your_client_id",
    base_url="https://your-custom-api.example.com"
)
```

## Configuration Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `client_id` | str | No | None | Tenant client ID for multi-tenant mode |
| `base_url` | str | No | `https://dev.api.authsec.dev` | API base URL |

## Example Configurations

### Development Environment

```python
client = CIBAClient(
    client_id="dev_client_123",
    base_url="https://dev.api.authsec.dev"
)
```

### Production Environment

```python
client = CIBAClient(
    client_id="prod_client_456",
    base_url="https://api.authsec.dev"
)
```

### Testing Without Client ID

```python
# No client_id for admin flow
client = CIBAClient(base_url="https://test.api.authsec.dev")
```

## Getting a Client ID

To obtain a `client_id` for tenant flow:

1. Contact AuthSec support at support@authsec.dev
2. Or create a tenant via the admin API:

```bash
curl -X POST https://dev.api.authsec.dev/api/v1/admin/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "email": "admin@company.com"
  }'
```

## Next Steps

- [Authentication Methods](./authentication-methods) - Learn CIBA and TOTP flows
- [API Reference](./api-reference) - Complete method documentation
