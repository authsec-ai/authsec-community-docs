---
title: Scopes
sidebar_position: 3
---

# Scopes

Learn how to create scopes programmatically using the AuthSec SDK.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python" default>

### Step 1: Install SDK Dependencies

```bash
pip install git+https://github.com/authsec-ai/authz-sdk.git
```

### Step 2: Initialize Admin Helper & Create Scope

```python
from authsec import AdminHelper
import os

admin = AdminHelper(
    token=os.getenv('AUTHSEC_ADMIN_TOKEN'),
    endpoint_type="admin"
)

# --- CREATE SCOPE ---
scope = admin.create_scope(
    scope_name="api.documents.write",
    description="Write access to documents API",
    resources=["document"]
)
print(f"✓ Created scope: {scope['name']}")

# Create multi-resource scope
admin_scope = admin.create_scope(
    scope_name="api.admin.full",
    description="Full admin API access",
    resources=["user", "role", "permission", "document", "invoice"]
)
print(f"✓ Created admin scope: {admin_scope['name']}")

# --- LIST SCOPES ---
scopes = admin.list_scopes()
print("
All scopes:")
for s in scopes:
    print(f"  - {s['name']}: {', '.join(s.get('resources', []))}")
```

**Returns:**

Scope object with details of the created scope.

**Endpoint:**

`POST /uflow/enduser/scopes`

</TabItem>
<TabItem value="typescript" label="TypeScript">

Coming Soon

</TabItem>
</Tabs>
