---
title: Secret Management
sidebar_position: 1
---

# External Services & Secret Management

## What's the Process to Integrate External Service?

Learn how to create and manage secrets programmatically using the AuthSec SDK.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python" default>

### Step 1: Install AuthSec SDK

```bash
pip install git+https://github.com/authsec-ai/sdk-authsec.git
```

### Import Dependencies

```python
from authsec_sdk import protected_by_AuthSec, ServiceAccessSDK
```

### Create Protected Function

```python
@protected_by_AuthSec("list_my_repos", scopes=["read"])
async def list_my_repos(arguments: dict, session) -> list:
    """List user's GitHub repositories."""

    # Create services SDK
    services_sdk = ServiceAccessSDK(session)

    # Fetch GitHub token from Vault (secure!)
    github_token = await services_sdk.get_service_token("your_token")

    # Call GitHub API
    async with aiohttp.ClientSession() as http:
        async with http.get(
            'https://api.github.com/user/repos',
            headers={'Authorization': f'Bearer {github_token}'}
        ) as response:
            repos = await response.json()

    # Format response
    repo_list = "\n".join([
        f"- {repo['full_name']} ({repo['stargazers_count']} ⭐)"
        for repo in repos[:10]
    ])

    return [{
        "type": "text",
        "text": f"Your GitHub Repositories:\n{repo_list}"
    }]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

Coming Soon

</TabItem>
</Tabs>
