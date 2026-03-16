---
title: Integrate SPIRE
sidebar_position: 4
---

# Integrate SPIRE

This guide covers deploying and configuring SPIRE (SPIFFE Runtime Environment) with AuthSec for automatic workload identity management and certificate rotation.

---

## Overview

SPIRE is the production-grade reference implementation of the SPIFFE (Secure Production Identity Framework For Everyone) standard. It provides:

- **Automatic identity issuance** — Workloads receive cryptographic identities upon startup without manual provisioning
- **Zero-trust attestation** — Workload authenticity is verified against platform-level attributes before credentials are issued
- **Continuous credential rotation** — X.509 certificates and JWT-SVIDs are renewed automatically before expiration
- **Platform-agnostic deployment** — Operates across Kubernetes, virtual machines, bare-metal servers, and multi-cloud environments

---

## Architecture

```
┌─────────────────┐
│  SPIRE Server   │  ← Central identity authority
└────────┬────────┘
         │
         │ Issues SVIDs (certificates)
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ Agent │ │ Agent │  ← Runs on each node
└───┬───┘ └──┬────┘
    │         │
    │         │ Distributes identities
    │         │
┌───▼───┐ ┌──▼────┐
│Worker │ │Worker │  ← Your workloads
│load 1 │ │load 2 │
└───────┘ └───────┘
```

| Component | Role |
|-----------|------|
| **SPIRE Server** | Central authority responsible for validating agent attestation and issuing SVIDs |
| **SPIRE Agent** | Node-level process that attests workloads and delivers credentials via the Workload API |
| **Workloads** | Services and autonomous agents that receive and use SPIFFE identities for authenticated communication |

---

## Prerequisites

- Kubernetes cluster (v1.19+) or VM-based infrastructure
- `kubectl` access with cluster-admin permissions
- An active AuthSec workspace with admin access

---

## Installation

### Option 1: Kubernetes (Recommended)

#### Deploy the SPIRE Server

Create the SPIRE namespace and deploy the server:

```bash
kubectl create namespace spire
```

```bash
kubectl apply -f https://raw.githubusercontent.com/spiffe/spire/main/support/k8s/server/spire-server.yaml
```

Verify the server pod is running:

```bash
kubectl get pods -n spire
```

Expected output:

```
NAME                            READY   STATUS    RESTARTS   AGE
spire-server-0                  1/1     Running   0          1m
```

#### Deploy the SPIRE Agent

Deploy the agent as a DaemonSet so that every node in the cluster runs an agent instance:

```bash
kubectl apply -f https://raw.githubusercontent.com/spiffe/spire/main/support/k8s/agent/spire-agent.yaml
```

Verify agent deployment:

```bash
kubectl get daemonset spire-agent -n spire
```

Expected output:

```
NAME          DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE
spire-agent   3         3         3       3            3
```

---

### Option 2: Docker Compose

For development and testing environments, SPIRE can be deployed via Docker Compose:

```yaml
# docker-compose.yml
version: "3.8"

services:
  spire-server:
    image: ghcr.io/spiffe/spire-server:latest
    hostname: spire-server
    volumes:
      - ./server:/opt/spire/conf/server
      - spire-server-data:/opt/spire/data/server
    command: ["-config", "/opt/spire/conf/server/server.conf"]
    ports:
      - "8081:8081"
    networks:
      - spire

  spire-agent:
    image: ghcr.io/spiffe/spire-agent:latest
    depends_on:
      - spire-server
    hostname: spire-agent
    volumes:
      - ./agent:/opt/spire/conf/agent
      - /var/run/docker.sock:/var/run/docker.sock
    command: ["-config", "/opt/spire/conf/agent/agent.conf"]
    networks:
      - spire

volumes:
  spire-server-data:

networks:
  spire:
```

```bash
docker-compose up -d
```

---

## Configuration

### Step 1: Define the Trust Domain

The trust domain establishes the root namespace for all SPIFFE identities in your deployment. All workload identities are scoped under this domain:

```
spiffe://authsec.example.com/production/api-gateway
spiffe://authsec.example.com/production/ml-agent
```

Configure the trust domain in the SPIRE server configuration file:

```hcl
# server.conf
server {
  bind_address = "0.0.0.0"
  bind_port = "8081"
  trust_domain = "authsec.example.com"
  data_dir = "/opt/spire/data/server"
}

plugins {
  DataStore "sql" {
    plugin_data {
      database_type = "sqlite3"
      connection_string = "/opt/spire/data/server/datastore.sqlite3"
    }
  }

  KeyManager "disk" {
    plugin_data {
      keys_path = "/opt/spire/data/server/keys.json"
    }
  }

  NodeAttestor "k8s_psat" {
    plugin_data {
      clusters = {
        "production" = {
          service_account_allow_list = ["spire:spire-agent"]
        }
      }
    }
  }
}
```

---

### Step 2: Register Workloads

Each workload that requires a SPIFFE identity must be registered with the SPIRE server. The registration entry defines the SPIFFE ID to assign and the selectors used to identify the workload at runtime.

```bash
kubectl exec -n spire spire-server-0 -- \
  /opt/spire/bin/spire-server entry create \
  -spiffeID spiffe://authsec.example.com/production/ml-agent \
  -parentID spiffe://authsec.example.com/spire/agent/k8s_psat/production/default \
  -selector k8s:ns:default \
  -selector k8s:sa:ml-agent-service-account \
  -selector k8s:pod-label:app:ml-agent
```

| Parameter | Purpose |
|-----------|---------|
| `-spiffeID` | The SPIFFE identity to assign to this workload |
| `-parentID` | The identity of the SPIRE agent that will attest this workload |
| `-selector` | One or more criteria used to match the workload at runtime (Kubernetes namespace, service account, pod labels) |

---

### Step 3: Connect to AuthSec

To enable AuthSec to verify SPIRE-issued JWT-SVIDs, configure OIDC discovery on the SPIRE server:

```hcl
oidc_discovery {
  domain = "auth.authsec.ai"
}
```

This exposes a JWKS endpoint that AuthSec uses to validate JWT signatures from SPIRE-issued tokens.

---

## Using SPIRE in Your Application

### Fetch an SVID

Workloads obtain their SPIFFE identity by connecting to the local SPIRE agent through the Workload API.

**Python:**

```python
from spiffe import WorkloadApiClient

client = WorkloadApiClient()
svid = client.fetch_x509_svid()

print(f"SPIFFE ID: {svid.spiffe_id}")
print(f"Certificate: {svid.cert}")
print(f"Private Key: {svid.private_key}")
```

**Go:**

```go
package main

import (
    "context"
    "fmt"
    "github.com/spiffe/go-spiffe/v2/workloadapi"
)

func main() {
    ctx := context.Background()

    source, err := workloadapi.NewX509Source(ctx)
    if err != nil {
        panic(err)
    }
    defer source.Close()

    svid, err := source.GetX509SVID()
    if err != nil {
        panic(err)
    }

    fmt.Printf("SPIFFE ID: %s\n", svid.ID)
}
```

---

### Establish mTLS Communication

Use SPIRE-issued certificates to create mutually authenticated connections between services.

**Go Server:**

```go
package main

import (
    "context"
    "log"
    "net/http"

    "github.com/spiffe/go-spiffe/v2/spiffetls/tlsconfig"
    "github.com/spiffe/go-spiffe/v2/workloadapi"
)

func main() {
    ctx := context.Background()

    source, err := workloadapi.NewX509Source(ctx)
    if err != nil {
        log.Fatal(err)
    }
    defer source.Close()

    tlsConfig := tlsconfig.MTLSServerConfig(source, source, tlsconfig.AuthorizeAny())

    server := &http.Server{
        Addr:      ":8443",
        TLSConfig: tlsConfig,
    }

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Authenticated via mTLS"))
    })

    log.Println("Listening on :8443")
    log.Fatal(server.ListenAndServeTLS("", ""))
}
```

**Go Client:**

```go
package main

import (
    "context"
    "fmt"
    "io"
    "net/http"

    "github.com/spiffe/go-spiffe/v2/spiffetls/tlsconfig"
    "github.com/spiffe/go-spiffe/v2/workloadapi"
)

func main() {
    ctx := context.Background()

    source, err := workloadapi.NewX509Source(ctx)
    if err != nil {
        panic(err)
    }
    defer source.Close()

    tlsConfig := tlsconfig.MTLSClientConfig(source, source, tlsconfig.AuthorizeAny())
    client := &http.Client{
        Transport: &http.Transport{
            TLSClientConfig: tlsConfig,
        },
    }

    resp, err := client.Get("https://api-service:8443/")
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```

---

## Verification

### Confirm SPIRE Server Status

List all registered workload entries:

```bash
kubectl exec -n spire spire-server-0 -- \
  /opt/spire/bin/spire-server entry show
```

### Confirm Agent Health

```bash
kubectl exec -n spire spire-agent-XXXXX -- \
  /opt/spire/bin/spire-agent healthcheck
```

### Test SVID Retrieval

```bash
kubectl exec -n spire spire-agent-XXXXX -- \
  /opt/spire/bin/spire-agent api fetch x509
```

A successful response returns the X.509 certificate chain and SPIFFE ID assigned to the agent.

---

## Production Considerations

| Consideration | Recommendation |
|---------------|----------------|
| **Key storage** | Use a Hardware Security Module (HSM) or cloud KMS to protect SPIRE server signing keys |
| **High availability** | Deploy multiple SPIRE server replicas backed by a shared database (PostgreSQL or MySQL) |
| **Certificate monitoring** | Configure alerts for SVID rotation failures and certificate expiration events |
| **Network isolation** | Apply Kubernetes network policies to restrict agent-to-server and workload-to-agent communication |
| **Entry auditing** | Periodically review registered workload entries to remove stale or unauthorized identities |

---

## Troubleshooting

### Workload Cannot Fetch SVID

1. Confirm the SPIRE agent pod is running on the same node as the workload:
   ```bash
   kubectl get pods -n spire -l app=spire-agent
   ```

2. Verify the workload is registered with matching selectors:
   ```bash
   kubectl exec -n spire spire-server-0 -- \
     /opt/spire/bin/spire-server entry show
   ```

3. Check that the workload pod labels and service account match the registered selectors:
   ```bash
   kubectl get pod YOUR_POD -o yaml | grep labels -A 5
   ```

### Certificate Expiration

SPIRE agents renew SVIDs automatically. If certificates are expiring, inspect the agent logs for rotation errors:

```bash
kubectl logs -n spire spire-agent-XXXXX
```

### mTLS Connection Failure

Verify that both the client and server workloads hold valid SVIDs and share the same trust domain:

```bash
kubectl exec YOUR_POD -- curl -v https://api-service:8443/
```

---

## Next Steps

- **[Security Best Practices](./best-practices)** — Review recommended patterns for securing M2M deployments in production
- **[AuthSec SDK Documentation](/sdk/)** — Integrate programmatically using the AuthSec SDK
