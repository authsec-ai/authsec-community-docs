---
title: Configure Autonomous Workload
sidebar_position: 3
---

# Configure Autonomous Workload

This guide walks through registering an autonomous agent as a client application in AuthSec and configuring the OAuth 2.0 Client Credentials flow for M2M authentication.

---

## Prerequisites

- An active AuthSec workspace
- Admin-level access to the workspace
- A service or application that requires M2M authentication

---

## Step 1: Create a Client Application

Register your autonomous agent as a client in the AuthSec dashboard.

### Via AuthSec Dashboard

1. Navigate to **Administration** > **Clients**
2. Click **Create Client**
3. Complete the registration form:

| Field | Description | Example |
|-------|-------------|---------|
| **Client Name** | A descriptive identifier for this workload | `ml-training-agent` |
| **Client Type** | Select **Machine-to-Machine** | M2M |
| **Description** | Brief purpose statement for the workload | `ML model training service` |

4. Click **Create Client** to finalize registration

### Configuration Options

After creation, configure the following properties for the client:

| Option | Description | Recommendation |
|--------|-------------|----------------|
| **Grant Type** | Authentication flow type | Set to `client_credentials` for M2M |
| **Token Lifetime** | Duration before access tokens expire | 1–24 hours; shorter values reduce risk but increase token request frequency |
| **Allowed Scopes** | Resources and actions the workload can access | Grant only what the workload requires (principle of least privilege) |

---

## Step 2: Retrieve Client Credentials

Upon successful registration, AuthSec generates a credential pair:

- **Client ID** — A unique public identifier for the workload (safe to reference in logs and configuration)
- **Client Secret** — A confidential key used to authenticate the workload (must be stored securely)

```
Client ID:     client_abc123xyz789
Client Secret: secret_def456uvw012
```

:::warning
The client secret is displayed only once at creation time. Store it immediately in a secure location. If lost, you must regenerate the secret from the AuthSec dashboard.
:::

---

## Step 3: Configure Your Application

### Environment Variables (Recommended)

Store credentials as environment variables rather than embedding them in source code or configuration files:

```bash
export AUTHSEC_CLIENT_ID="client_abc123xyz789"
export AUTHSEC_CLIENT_SECRET="secret_def456uvw012"
export AUTHSEC_TOKEN_URL="https://auth.authsec.ai/oauth/token"
```

### Configuration File

Reference environment variables within your application configuration:

```yaml
# config.yaml
authsec:
  client_id: ${AUTHSEC_CLIENT_ID}
  client_secret: ${AUTHSEC_CLIENT_SECRET}
  token_url: https://auth.authsec.ai/oauth/token
  scopes:
    - read:data
    - write:logs
```

:::tip
For production deployments, use a dedicated secret management system such as HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault instead of environment variables.
:::

---

## Step 4: Implement the Authentication Flow

The OAuth 2.0 Client Credentials flow consists of three stages: token request, token receipt, and authenticated API access.

### Request an Access Token

```http
POST https://auth.authsec.ai/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=client_abc123xyz789
&client_secret=secret_def456uvw012
&scope=read:data write:logs
```

### Token Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:data write:logs"
}
```

### Authenticate API Requests

Include the access token in the `Authorization` header of subsequent requests:

```http
GET https://api.yourservice.com/data
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 5: Code Examples

### Python

```python
import requests
import os

CLIENT_ID = os.getenv('AUTHSEC_CLIENT_ID')
CLIENT_SECRET = os.getenv('AUTHSEC_CLIENT_SECRET')
TOKEN_URL = 'https://auth.authsec.ai/oauth/token'

def get_access_token():
    response = requests.post(TOKEN_URL, data={
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': 'read:data write:logs'
    })
    response.raise_for_status()
    return response.json()['access_token']

def call_protected_api():
    token = get_access_token()
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(
        'https://api.yourservice.com/data',
        headers=headers
    )
    return response.json()

if __name__ == '__main__':
    data = call_protected_api()
    print(data)
```

### Node.js

```javascript
const axios = require('axios');

const CLIENT_ID = process.env.AUTHSEC_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTHSEC_CLIENT_SECRET;
const TOKEN_URL = 'https://auth.authsec.ai/oauth/token';

async function getAccessToken() {
  const response = await axios.post(TOKEN_URL, new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'read:data write:logs'
  }));
  return response.data.access_token;
}

async function callProtectedApi() {
  const token = await getAccessToken();
  const response = await axios.get('https://api.yourservice.com/data', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
}

callProtectedApi()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "net/url"
    "os"
)

type TokenResponse struct {
    AccessToken string `json:"access_token"`
    TokenType   string `json:"token_type"`
    ExpiresIn   int    `json:"expires_in"`
}

func getAccessToken() (string, error) {
    clientID := os.Getenv("AUTHSEC_CLIENT_ID")
    clientSecret := os.Getenv("AUTHSEC_CLIENT_SECRET")

    data := url.Values{}
    data.Set("grant_type", "client_credentials")
    data.Set("client_id", clientID)
    data.Set("client_secret", clientSecret)
    data.Set("scope", "read:data write:logs")

    resp, err := http.PostForm("https://auth.authsec.ai/oauth/token", data)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    var tokenResp TokenResponse
    if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
        return "", err
    }
    return tokenResp.AccessToken, nil
}

func callProtectedApi() ([]byte, error) {
    token, err := getAccessToken()
    if err != nil {
        return nil, err
    }

    req, err := http.NewRequest("GET", "https://api.yourservice.com/data", nil)
    if err != nil {
        return nil, err
    }
    req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}

func main() {
    data, err := callProtectedApi()
    if err != nil {
        panic(err)
    }
    fmt.Println(string(data))
}
```

---

## Step 6: Token Caching and Rotation

Access tokens should be cached and reused until they approach expiration. Requesting a new token for every API call adds unnecessary latency and load on the authorization server.

The following example implements a thread-safe token cache with proactive renewal:

```python
import time
from threading import Lock

class TokenManager:
    def __init__(self, refresh_buffer_seconds=300):
        self.token = None
        self.expires_at = 0
        self.lock = Lock()
        self.refresh_buffer = refresh_buffer_seconds

    def get_token(self):
        with self.lock:
            if time.time() >= (self.expires_at - self.refresh_buffer):
                self._refresh()
            return self.token

    def _refresh(self):
        response = request_new_token()
        self.token = response['access_token']
        self.expires_at = time.time() + response['expires_in']
```

If a token request fails, implement retry logic with exponential backoff to avoid overwhelming the authorization server during transient outages.

---

## Step 7: Verify the Configuration

### Test Token Acquisition

```bash
curl -X POST https://auth.authsec.ai/oauth/token \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=read:data"
```

### Inspect the Token

Copy the `access_token` value from the response and decode it at [jwt.io](https://jwt.io) to verify the claims (issuer, audience, scopes, expiration).

### Test Authenticated Access

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.yourservice.com/data
```

A successful response confirms that client registration, credential configuration, and token-based authentication are working correctly.

---

## Security Considerations

| Practice | Detail |
|----------|--------|
| **Never hard-code secrets** | Store credentials in environment variables or a secrets manager — never in source code or version control |
| **Rotate credentials regularly** | Regenerate client secrets at least every 90 days |
| **Use minimal scopes** | Request only the permissions the workload requires |
| **Monitor token usage** | Review AuthSec audit logs for unexpected patterns or failed authentication attempts |
| **Use secure storage** | For production, use HashiCorp Vault, AWS Secrets Manager, or equivalent |

---

## Troubleshooting

| Error | Cause | Resolution |
|-------|-------|------------|
| `invalid_client` | Incorrect client ID or secret | Verify credentials match the values in the AuthSec dashboard |
| `insufficient_scope` | Token lacks required permissions | Add the necessary scopes to the token request and ensure they are configured on the client |
| Token expires prematurely | Short token lifetime configured on the client | Adjust the token lifetime setting in the AuthSec client configuration |

---

## Next Steps

- **[Integrate SPIRE](./integrate-spire)** — Deploy SPIRE for automatic certificate-based identity and credential rotation in production
- **[Security Best Practices](./best-practices)** — Review recommended security patterns for M2M deployments
