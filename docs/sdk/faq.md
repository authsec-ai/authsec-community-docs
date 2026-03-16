---
title: FAQ
sidebar_position: 6
---

# Frequently Asked Questions

Common questions and answers about the AuthSec SDK.

## General Questions

### What packages do I need to install?

The AuthSec SDK is split into two packages depending on your use case:

| Package | Use case |
|---|---|
| `sdk-authsec` | MCP server auth, workload identity (SPIRE/SVID), secret management |
| `authz-sdk` | RBAC — permissions, roles, scopes |

```bash
# For MCP servers, workload identity, and secret management
pip install git+https://github.com/authsec-ai/sdk-authsec.git

# For RBAC (permissions, roles, scopes)
pip install git+https://github.com/authsec-ai/authz-sdk.git
```

---

### Is TypeScript/JavaScript support available?

TypeScript support is **coming soon** for all SDK modules. Currently, Python is the only fully supported language. Check back in the documentation for TypeScript tabs as they become available.

---

### How do I get a `client_id`?

**Option 1: Contact AuthSec Support**
- Email: support@authsec.dev
- Provide: Company name, use case, and contact email

**Option 2: Admin API**

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

## MCP Servers & Clients

### What does `@protected_by_AuthSec` do?

The `@protected_by_AuthSec` decorator wraps your MCP tool so that only authenticated users can call it. When an unauthenticated request comes in, the SDK redirects the client through the AuthSec OAuth flow automatically.

```python
@protected_by_AuthSec("hello")
async def hello(arguments: dict) -> list:
    # arguments['_user_info'] is injected automatically after auth
    return [{"type": "text", "text": f"Hello, {arguments['_user_info']['email']}!"}]
```

The `_user_info` key is injected into `arguments` by the SDK after successful authentication — your tool never has to handle the auth flow itself.

---

### What does `run_mcp_server_with_oauth` do?

`run_mcp_server_with_oauth` starts your MCP server and automatically handles:
- The OAuth 2.0 authorization flow for human users
- Routing authenticated vs unauthenticated requests
- Optionally attaching a SPIRE agent socket for machine-to-machine identity

```python
run_mcp_server_with_oauth(
    client_id="your-client-id-here",
    app_name="My Secure MCP Server"
)
```

---

### Can I have tools that don't require authentication?

Yes. Use `@mcp_tool` (without `@protected_by_AuthSec`) for public tools, and `@protected_by_AuthSec` only on tools that require an authenticated user.

```python
from authsec_sdk import mcp_tool, protected_by_AuthSec

@mcp_tool("public_info", description="Anyone can call this")
async def public_info(arguments: dict) -> list:
    return [{"type": "text", "text": "Public data"}]

@protected_by_AuthSec("private_data")
async def private_data(arguments: dict) -> list:
    return [{"type": "text", "text": "Authenticated data"}]
```

---

## Workload Identity (SPIRE / SVID)

### What is a SPIFFE ID and SVID?

- **SPIFFE ID** — A URI that uniquely identifies a workload (e.g. `spiffe://example.com/workload/api-service`). It is the workload's cryptographic identity.
- **SVID (SPIFFE Verifiable Identity Document)** — A short-lived X.509 certificate that proves a workload's SPIFFE ID. SVIDs are rotated automatically.

The AuthSec SDK's `QuickStartSVID` handles fetching and rotating SVIDs so your code only needs to call:

```python
svid = await QuickStartSVID.initialize()
print(svid.spiffe_id)      # spiffe://...
print(svid.cert_file_path) # path to the certificate
```

---

### When should I use workload identity instead of OAuth?

| Scenario | Recommended approach |
|---|---|
| A human user is authenticating via a client app or MCP server | OAuth / `@protected_by_AuthSec` |
| A service or container needs to call another service with no human in the loop | Workload identity (SPIRE/SVID) |
| You need mTLS between microservices | Workload identity (SPIRE/SVID) |

Use workload identity for machine-to-machine (M2M) communication. Use OAuth for user-facing flows.

---

### How does certificate auto-renewal work?

The ICP Agent running on your host maintains a live connection to the AuthSec SPIRE server. It automatically renews SVIDs before they expire (default renewal threshold is 6 hours before expiry). Your workload accesses the latest certificate through the SPIRE socket — no restart required.

---

### Which deployment environments are supported for the ICP Agent?

The ICP Agent supports three deployment targets:

| Environment | Recommended method |
|---|---|
| Kubernetes | Helm chart (DaemonSet) |
| Docker | `docker-compose` with shared socket volume |
| VM (Linux) | Quick-install script or manual systemd service |

See [Autonomous Workloads](./workloads/autonomous-workloads.md) for step-by-step guides for each environment.

---

### Why does the ICP Agent need `SYS_PTRACE` capability?

The `SYS_PTRACE` capability is required for **process attestation** — the agent inspects process metadata to cryptographically verify the identity of workloads running on the same host. This is how zero-trust attestation works without pre-shared secrets.

---

## RBAC

### What is the difference between a permission, a scope, and a role binding?

| Concept | Description | Example |
|---|---|---|
| **Permission** | A resource + action pair | `invoice:create`, `document:read` |
| **Scope** | A named group of permissions for a set of resources | `api.documents.write` |
| **Role binding** | Assigns a role (which has permissions) to a user | Binding `editor` role to `user@example.com` |

Permissions are the atomic units. Scopes group permissions for OAuth token grants. Role bindings connect users to roles that carry permissions.

---

### What's the difference between `check_permission` and `check_permission_scoped`?

- `check_permission(resource, action)` — Checks if the authenticated user has the permission globally (tenant level).
- `check_permission_scoped(resource, action, scope_type, scope_id)` — Checks if the user has the permission within a specific project or sub-tenant scope.

```python
# Global permission check
client.check_permission("document", "read")

# Project-scoped permission check
client.check_permission_scoped("document", "read", scope_type="project", scope_id="proj-123")
```

Use scoped checks when your application supports multiple projects or sub-tenants with isolated permissions.

---

### Are permission checks performed locally or via an API call?

`check_permission` and `check_permission_scoped` perform **local JWT checks** — they decode and verify the user's JWT without making a network call. This makes permission enforcement fast and suitable for use in request handlers.

---

## External Services & Secret Management

### How does the SDK securely retrieve external service tokens?

The `ServiceAccessSDK` retrieves tokens from a secure vault managed by AuthSec. Your application never stores the external token directly — it requests it at runtime within an authenticated session:

```python
services_sdk = ServiceAccessSDK(session)
github_token = await services_sdk.get_service_token("your_token")
```

This means external credentials are centrally managed and can be rotated without redeploying your application.

---

### What external services can I integrate with?

Any external service that uses bearer token authentication (GitHub, Slack, Jira, etc.) can be integrated by storing that service's token in the AuthSec vault and retrieving it via `ServiceAccessSDK.get_service_token()`. The SDK acts as a secure credential broker between your workload and the external API.

---

## Troubleshooting

### `QuickStartSVID.initialize()` raises a `RuntimeError`

**Cause:** The SPIRE socket path is not configured or the ICP Agent is not running.

**Solution:**
1. Verify the ICP Agent is healthy: `curl http://localhost:8080/healthz`
2. Check the socket exists: `ls -l /run/spire/sockets/agent.sock`
3. Pass the socket path explicitly:

```python
svid = await QuickStartSVID.initialize(socket_path="/run/spire/sockets/agent.sock")
```

---

### The ICP Agent pod keeps restarting on Kubernetes

**Possible causes:**
1. `tenantId` or `icpServiceUrl` are incorrect in `values.yaml`
2. The pod cannot reach the AuthSec SPIRE service (network policy issue)
3. Missing `SYS_PTRACE` capability in the security context

**Diagnosis:**
```bash
kubectl logs -n default -l app=icp-agent --tail=100
kubectl describe pod -n default -l app=icp-agent
```

---

### `check_permission` always returns `False`

**Possible causes:**
1. The `AUTHSEC_API_URL` environment variable is not set
2. The user's JWT does not include the expected permission claim
3. The permission was not created or assigned to the user's role

**Solution:** Confirm the permission exists and is bound to the correct role, then verify the user has that role assigned.

---

## Support

Still have questions?

- **Email**: support@authsec.dev
- **GitHub**: [github.com/authsec-ai](https://github.com/authsec-ai)

---

## Next Steps

- [MCP Servers & AI Agents](./clients/mcp-servers.md) — Integrate auth into your MCP server
- [Autonomous Workloads](./workloads/autonomous-workloads.md) — Configure workload identity
- [Permissions & Resources](./rbac/permissions-resources.md) — Enforce RBAC in your app
- [Secret Management](./external-services/secret-management.md) — Access external service tokens securely
