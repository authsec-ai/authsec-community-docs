---
title: Security Best Practices
sidebar_position: 5
---

# Security Best Practices

This guide outlines recommended security practices for M2M authentication deployments with AuthSec, covering credential management, access control, network security, monitoring, and incident response.

---

## Credential Management

### Externalize Secrets

Credentials must never be embedded directly in source code or committed to version control.

**Incorrect:**
```python
CLIENT_SECRET = "secret_abc123_hardcoded"
```

**Correct:**
```python
import os
CLIENT_SECRET = os.getenv('AUTHSEC_CLIENT_SECRET')
```

### Use a Secret Management System

For production environments, store credentials in a dedicated secret management platform:

| Platform | Service |
|----------|---------|
| Multi-cloud | HashiCorp Vault |
| AWS | AWS Secrets Manager |
| Azure | Azure Key Vault |
| GCP | Google Secret Manager |
| Kubernetes | Kubernetes Secrets (with encryption at rest enabled) |

**Example — HashiCorp Vault:**
```python
import hvac

client = hvac.Client(url='https://vault.example.com')
secret = client.secrets.kv.v2.read_secret_version(path='authsec/client')

CLIENT_ID = secret['data']['data']['client_id']
CLIENT_SECRET = secret['data']['data']['client_secret']
```

---

## Token Lifecycle

### Configure Short-Lived Tokens

Shorter credential lifetimes reduce the window of exposure if a credential is compromised.

| Credential Type | Recommended TTL |
|----------------|-----------------|
| Access Tokens | 1–12 hours |
| JWT-SVIDs | 1–24 hours |
| X.509 Certificates | 1–7 days |

### Implement Token Caching

Applications should cache access tokens and reuse them until they approach expiration, rather than requesting a new token for each API call:

```python
import time
from threading import Lock

class TokenCache:
    def __init__(self):
        self.token = None
        self.expires_at = 0
        self.lock = Lock()

    def get_token(self):
        with self.lock:
            if time.time() >= (self.expires_at - 300):
                self._refresh_token()
            return self.token

    def _refresh_token(self):
        response = request_new_token()
        self.token = response['access_token']
        self.expires_at = time.time() + response['expires_in']
```

### Revoke Unused Credentials

Revoke or delete credentials immediately when:
- A workload is decommissioned or replaced
- A security incident is detected or suspected
- A service no longer requires access to a protected resource

---

## Access Control

### Apply Least Privilege

Grant only the minimum scopes and permissions each workload requires.

**Overprivileged (avoid):**
```json
{
  "scopes": ["*", "admin:all"]
}
```

**Properly scoped:**
```json
{
  "scopes": ["read:data", "write:logs"]
}
```

### Define Role-Based Access Control (RBAC)

Map workloads to roles with clearly defined permission boundaries:

```yaml
roles:
  ml-trainer:
    scopes:
      - read:training-data
      - write:model-registry

  api-gateway:
    scopes:
      - read:user-profiles
      - write:audit-logs
```

### Enforce Resource-Level Authorization

Authentication alone is insufficient — verify that each request is authorized for the specific resource being accessed:

```python
def can_access_resource(token, resource_id):
    claims = verify_token(token)

    if 'read:data' not in claims['scope']:
        return False

    if claims['tenant_id'] != get_resource_tenant(resource_id):
        return False

    return True
```

---

## Network Security

### Require Mutual TLS (mTLS)

Configure workload-to-workload communication to use mTLS, ensuring both parties present and verify certificates:

```go
tlsConfig := tlsconfig.MTLSServerConfig(
    source,
    source,
    tlsconfig.AuthorizeID(spiffeid.RequireFromString(
        "spiffe://authsec.example.com/production/allowed-client",
    )),
)
```

### Enforce TLS for All Communication

All credential exchange and API communication must occur over TLS-encrypted connections. Plaintext HTTP must not be used for any endpoint that handles tokens, secrets, or sensitive data.

### Restrict Network Access

Use Kubernetes network policies to limit which workloads can communicate with the SPIRE infrastructure:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-spire-agent
spec:
  podSelector:
    matchLabels:
      app: ml-agent
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: spire
    ports:
    - protocol: TCP
      port: 8081
```

---

## Monitoring and Auditing

### Log Authentication Events

Record all token requests, authentication outcomes, and authorization decisions:

```python
import logging

logger = logging.getLogger('authsec')

def get_access_token():
    logger.info("Requesting access token", extra={
        'client_id': CLIENT_ID,
        'scopes': 'read:data write:logs',
        'timestamp': time.time()
    })

    token = request_token()

    logger.info("Access token issued", extra={
        'token_id': extract_token_id(token),
        'expires_at': extract_expiry(token)
    })

    return token
```

### Configure Alerts

Set up monitoring alerts for the following conditions:

| Condition | Threshold |
|-----------|-----------|
| Failed authentication attempts | More than 5 per minute from a single client |
| Token requests from unexpected IPs | Any request outside the expected CIDR range |
| Unauthorized resource access | Any denied authorization decision |
| Certificate rotation failure | Any SVID renewal error |
| Use of expired credentials | Any request with an expired token or certificate |

**Example — Prometheus alert rule:**
```yaml
groups:
- name: authsec_alerts
  rules:
  - alert: HighAuthFailureRate
    expr: rate(authsec_auth_failures[5m]) > 0.1
    annotations:
      summary: "High authentication failure rate detected"
```

### Conduct Regular Access Reviews

Periodically audit access patterns and granted permissions:

```sql
SELECT
  timestamp,
  client_id,
  resource,
  action,
  result
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
AND result = 'denied'
ORDER BY timestamp DESC;
```

---

## Certificate Management (SPIRE)

### Automate Rotation

Configure SPIRE agents to renew certificates well before expiration:

```hcl
agent {
  svid_store_cache_expiry = "50%"
}
```

This setting triggers renewal when 50% of the certificate's TTL has elapsed.

### Validate Certificate Chains

Always verify the complete trust chain when accepting certificates:

```go
import (
    "crypto/x509"
    "github.com/spiffe/go-spiffe/v2/bundle/x509bundle"
)

func verifyCertificate(cert *x509.Certificate, bundle *x509bundle.Bundle) error {
    _, err := cert.Verify(x509.VerifyOptions{
        Roots:     bundle.X509Authorities(),
        CurrentTime: time.Now(),
        KeyUsages: []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth},
    })
    return err
}
```

### Revoke Compromised Identities

If a workload is compromised, immediately remove its SPIRE registration entry to prevent further credential issuance:

```bash
kubectl exec -n spire spire-server-0 -- \
  /opt/spire/bin/spire-server entry delete \
  -entryID <ENTRY_ID>
```

---

## Incident Response

### Credential Compromise Procedure

**1. Containment**
- Revoke the compromised credentials in AuthSec
- Delete the corresponding SPIRE registration entry
- Apply network policies to isolate the affected workload

**2. Investigation**
- Review audit logs to determine the scope of unauthorized access
- Identify all resources accessed using the compromised credentials
- Establish the timeline of the breach

**3. Remediation**
- Rotate all credentials that may have been exposed
- Apply security patches to the affected workload
- Update access policies to prevent recurrence

**4. Post-Incident Review**
- Document findings and root cause
- Update monitoring rules to detect similar incidents earlier
- Revise security procedures based on lessons learned

---

## Compliance and Standards

### Cryptographic Standards

| Standard | Requirement |
|----------|-------------|
| **NIST SP 800-57** | RSA 2048+ or ECDSA P-256+ for key generation |
| **NIST SP 800-63** | Multi-factor authentication where applicable |
| **Audit retention** | Maintain authentication logs for a minimum of 1 year |

### Regulatory Frameworks

Ensure your M2M authentication deployment meets the requirements of applicable regulatory frameworks:

- **GDPR** — Data residency and access controls for EU data
- **CCPA** — Consumer data protection for California residents
- **HIPAA** — Protected health information safeguards
- **SOC 2** — Security, availability, and confidentiality controls

### Periodic Security Audits

**Quarterly:** Review active client credentials, granted scopes, certificate expiration dates, and network access policies.

**Annually:** Engage a third-party security firm to conduct penetration testing of M2M authentication flows and validate incident response procedures.

---

## Common Vulnerabilities

The following are frequent security mistakes in M2M deployments. Avoid these patterns:

| Category | Anti-Pattern |
|----------|-------------|
| **Credential leakage** | Logging full token values, committing secrets to version control, storing credentials in plaintext files |
| **Insufficient validation** | Accepting tokens without verifying signatures, processing expired tokens, skipping certificate chain validation |
| **Overprivileged access** | Granting admin-level scopes by default, reusing the same credentials across environments, not enforcing scope boundaries |

---

## Production Readiness Checklist

Before deploying M2M authentication to production, verify the following:

- [ ] Credentials are stored in a secret management system (not in code or configuration files)
- [ ] Token lifetimes are set to 24 hours or less
- [ ] Token caching is implemented with proactive renewal
- [ ] Scopes follow the principle of least privilege
- [ ] mTLS is enabled for all service-to-service communication
- [ ] All traffic is encrypted via TLS
- [ ] Network policies restrict workload communication paths
- [ ] Authentication and authorization events are logged
- [ ] Alerts are configured for authentication failures and rotation errors
- [ ] Certificate rotation is fully automated via SPIRE
- [ ] A credential revocation and incident response procedure is documented
- [ ] A security audit has been completed

---

## Additional Resources

- [SPIFFE/SPIRE Documentation](https://spiffe.io/docs/latest/spiffe-about/)
- [OAuth 2.0 Security Best Current Practice (RFC 8725)](https://tools.ietf.org/html/rfc8725)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [cert-manager](https://cert-manager.io/)
- [Open Policy Agent](https://www.openpolicyagent.org/)
