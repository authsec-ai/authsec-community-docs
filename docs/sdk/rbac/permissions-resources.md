---
title: Permissions & Resources
sidebar_position: 1
---

# Permissions & Resources

Learn how to verify if a user has the required permission to perform an action on a resource using local JWT checks.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python" default>

### Step 1: Install SDK Dependencies

```bash
pip install git+https://github.com/authsec-ai/authz-sdk.git
```

### Step 2: Initialize Client & Check Permission

```python
from authsec import AuthSecClient
import os

# Initialize with your API URL
client = AuthSecClient(os.getenv('AUTHSEC_API_URL'))

# Check permissions
if client.check_permission("document", "read"):
    print("✓ User can read documents")
```

### Step 3: Check Scoped Permission

```python
# Check permission with scope (tenant/project level)
can_access = client.check_permission_scoped("resource", "action", scope_type="project", scope_id="project-id")
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

Coming Soon

</TabItem>
</Tabs>

## Create a Permission (Resource + Method Definition)

Learn how to create new permissions programmatically using the AuthSec SDK.

<Tabs>
<TabItem value="python" label="Python" default>

### Step 1: Install SDK Dependencies

```bash
pip install git+https://github.com/authsec-ai/authz-sdk.git
```

### Step 2: Create Permission

```python
from authsec import AdminHelper

admin = AdminHelper(token="admin-token", endpoint_type="admin")

# Create a permission (format: resource:action)
permission = admin.create_permission(
    resource="invoice",
    action="create",
    description="Create new invoices"
)

print(f"Created permission: {permission['id']}")
# Result: invoice:create
```

**Returns:**

Permission object with details of the created permission.

**Endpoint:**

`POST /uflow/user/permissions`

### List Permissions

List permissions, optionally filtered by resource.

```python
# Syntax
list_permissions(resource=None)

# Examples
all_perms = admin.list_permissions()
doc_perms = admin.list_permissions(resource="document")
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

Coming Soon

</TabItem>
</Tabs>
