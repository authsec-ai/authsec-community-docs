---
title: FAQ
sidebar_position: 6
---

# Frequently Asked Questions

Common questions about M2M authentication, SPIFFE/SPIRE, and autonomous workload management with AuthSec.

---

## General

### What is the difference between M2M authentication and user authentication?

User authentication verifies a human identity — typically through passwords, biometrics, or multi-factor authentication — and requires interactive input. M2M authentication verifies a workload or service identity using cryptographic credentials (certificates or signed tokens) without any human interaction. M2M credentials are short-lived and automatically rotated, whereas user sessions tend to be longer-lived.

### Which M2M protocol should I use?

The choice depends on your deployment environment and requirements:

| Protocol | When to Use |
|----------|-------------|
| **SPIFFE/SPIRE** | Cloud-native environments, Kubernetes deployments, microservices architectures, or any scenario requiring automatic identity management and certificate rotation |
| **OAuth 2.0 Client Credentials** | Third-party API integrations, legacy systems, or environments where certificate-based authentication is not feasible |
| **Mutual TLS (mTLS)** | High-security or regulated environments (financial services, healthcare) that require certificate-based mutual verification without the SPIFFE identity layer |

For most new deployments, SPIFFE/SPIRE is the recommended approach due to its automation, platform-agnostic design, and zero-trust attestation model.

### Can I use multiple protocols in the same environment?

Yes. AuthSec supports hybrid deployments where internal service mesh traffic uses SPIFFE/SPIRE for identity-based authentication, while external integrations use OAuth 2.0 Client Credentials. Both protocols can coexist within the same workspace.

---

## SPIFFE and SPIRE

### What is a SPIFFE ID?

A SPIFFE ID is a URI that uniquely identifies a workload within a trust domain. It follows the format:

```
spiffe://<trust-domain>/<path>
```

For example: `spiffe://authsec.example.com/production/ml-agent`

The trust domain establishes the root of trust, and the path identifies the specific workload or service within that domain.

### What is an SVID?

An SVID (SPIFFE Verifiable Identity Document) is the credential issued to a workload after successful attestation. SVIDs come in two forms:

- **X.509-SVID** — An X.509 certificate containing the SPIFFE ID in the Subject Alternative Name (SAN) field. Used for mTLS connections.
- **JWT-SVID** — A signed JSON Web Token containing the SPIFFE ID as the `sub` claim. Used for bearer token authentication.

Both forms are short-lived and automatically renewed by the SPIRE agent before expiration.

### How does workload attestation work?

When a workload starts, the local SPIRE agent verifies its identity against registered criteria. On Kubernetes, this typically includes:

1. The Kubernetes namespace the pod is running in
2. The service account assigned to the pod
3. Pod labels and container image hashes

Only workloads that match all registered selectors receive an SVID. If any selector fails to match, the attestation is rejected and no credentials are issued.

### What happens if the SPIRE server goes down?

Existing workloads continue to operate with their current SVIDs until they expire. SPIRE agents cache credentials locally, so there is no immediate disruption. However, new workloads cannot be attested and existing credentials cannot be renewed until the server is restored.

For production deployments, run multiple SPIRE server replicas behind a shared database to ensure high availability.

### How often are certificates rotated?

Certificate rotation frequency depends on the configured TTL and renewal threshold. With the default configuration:

- **X.509 SVIDs** are typically issued with a TTL of 1–24 hours
- **Renewal** is triggered when 50% of the TTL has elapsed (configurable via `svid_store_cache_expiry`)

Rotation is handled entirely by the SPIRE agent and requires no application changes or restarts.

---

## OAuth 2.0 Client Credentials

### How do Client Credentials differ from Authorization Code flow?

The Authorization Code flow is designed for user-facing applications — it redirects a human user to an identity provider for interactive login. The Client Credentials flow is designed for service-to-service communication — the client authenticates directly using its client ID and secret, with no user involvement.

| Aspect | Authorization Code | Client Credentials |
|--------|-------------------|-------------------|
| **Intended for** | User-facing applications | Service-to-service |
| **Human interaction** | Required (login prompt) | None |
| **Credentials** | User password + client secret | Client ID + client secret only |
| **Tokens represent** | A user's delegated permissions | The service's own permissions |

### Can I use refresh tokens with Client Credentials?

No. The OAuth 2.0 specification does not support refresh tokens for the Client Credentials grant. When an access token expires, the service must request a new token using its client credentials. Implement token caching with proactive renewal to avoid unnecessary token requests.

### How should I store client secrets in production?

Client secrets should never appear in source code, configuration files checked into version control, or container images. Use one of the following approaches:

- **Secret management systems** — HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, or Google Secret Manager
- **Kubernetes Secrets** — With encryption at rest enabled
- **Environment variables** — Injected at runtime (acceptable for development; use a secrets manager for production)

---

## Security

### How is M2M authentication more secure than API keys?

API keys are long-lived shared secrets that can be copied, leaked, and are difficult to rotate. M2M authentication addresses each of these weaknesses:

- **Short-lived credentials** expire in minutes or hours, limiting the damage from a compromise
- **Cryptographic binding** ensures credentials cannot be forged or transferred between workloads
- **Automatic rotation** eliminates the operational burden and risk of manual key management
- **Attestation** verifies the workload's runtime environment, not just possession of a secret

### What should I do if a client secret is compromised?

1. Immediately regenerate the client secret in the AuthSec dashboard
2. Update the secret in your secret management system
3. Review audit logs for any unauthorized token requests or API access using the compromised secret
4. Assess whether any downstream resources were accessed and take appropriate remediation steps

### Does SPIRE protect against a compromised node?

SPIRE's attestation model limits the impact of a compromised node. An attacker who gains access to a node can only obtain SVIDs for workloads registered to run on that node — they cannot request identities for workloads on other nodes or in other namespaces. Revoking the affected SPIRE agent's registration prevents further SVID issuance on that node.

### How do I handle credential rotation without downtime?

Both SPIRE and OAuth 2.0 token caching support seamless rotation:

- **SPIRE** renews SVIDs before expiration and delivers updated certificates to workloads through the Workload API. Applications using the `go-spiffe` or `py-spiffe` libraries receive new credentials automatically.
- **OAuth 2.0** tokens should be cached with a renewal buffer (e.g., refresh 5 minutes before expiration) to ensure a valid token is always available.

---

## Deployment

### What infrastructure does SPIRE support?

SPIRE includes attestation plugins for the following platforms:

| Platform | Attestor Type |
|----------|--------------|
| Kubernetes | `k8s_psat` (Projected Service Account Token) |
| AWS | `aws_iid` (Instance Identity Document) |
| Azure | `azure_msi` (Managed Service Identity) |
| GCP | `gcp_iit` (Instance Identity Token) |
| Docker | `docker` (Container selectors) |
| Bare metal / VMs | `join_token` (Pre-shared join token) |

### Can I run SPIRE across multiple Kubernetes clusters?

Yes. Each cluster runs its own SPIRE server and agents. To establish trust between clusters, configure federation by exchanging trust bundles between SPIRE servers. This allows workloads in one cluster to verify SVIDs issued by another cluster's SPIRE server.

### What database backends does the SPIRE server support?

The SPIRE server supports the following database backends for its DataStore plugin:

- **SQLite** — Suitable for development, testing, and single-node deployments
- **PostgreSQL** — Recommended for production and high-availability deployments
- **MySQL** — Supported as an alternative to PostgreSQL

For high availability, use PostgreSQL or MySQL with multiple SPIRE server replicas.

---

## Troubleshooting

### My workload cannot fetch an SVID. What should I check?

1. **Agent status** — Verify the SPIRE agent is running on the same node as the workload
2. **Registration entry** — Confirm the workload is registered with the correct selectors (namespace, service account, pod labels)
3. **Socket access** — Ensure the workload has access to the SPIRE agent's Unix domain socket (typically `/run/spire/sockets/agent.sock`)
4. **Agent logs** — Check the SPIRE agent logs for attestation errors or selector mismatches

### Token requests return `invalid_client`. What is wrong?

This error indicates the client ID or client secret is incorrect. Verify that:
- The client ID matches the value shown in the AuthSec dashboard
- The client secret has not been regenerated since it was last stored
- There are no trailing whitespace characters or encoding issues in the stored credentials

### mTLS connections fail with certificate verification errors.

Common causes include:
- The client and server are using SVIDs from different trust domains
- One party's SVID has expired (check the SPIRE agent logs for rotation errors)
- The trust bundle is not correctly distributed to both services
- Network policies are blocking the SPIRE agent socket or the service port

### How do I debug SPIRE attestation failures?

Enable verbose logging on the SPIRE agent to see detailed attestation information:

```bash
kubectl logs -n spire <spire-agent-pod> --follow
```

Look for log entries containing `attestation` or `selector` to identify which criteria are failing to match.
