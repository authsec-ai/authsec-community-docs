---
title: Role Bindings
sidebar_position: 2
---

# Role Bindings

Learn how to create role bindings programmatically using the AuthSec SDK.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python" default>

### Step 1: Install Dependencies

```bash
pip install git+https://github.com/authsec-ai/authz-sdk.git
```

### Step 2: Initialize Admin Helper

```python
from authsec import AdminHelper
import os

admin = AdminHelper(
    token=os.getenv('AUTHSEC_ADMIN_TOKEN'),
    endpoint_type="admin"
)

# Tenant-wide binding
binding = admin.create_role_binding(
    user_id="user-uuid-123",
    role_id="editor-role-uuid"
)
print(f"✓ Tenant-wide binding: {binding['id']}")

# Scoped binding (project-specific)
scoped_binding = admin.create_role_binding(
    user_id="user-uuid-123",
    role_id="project-admin-uuid",
    scope_type="project",
    scope_id="project-456"
)
print(f"✓ Scoped binding: {scoped_binding['id']}")

# Conditional binding (MFA required)
conditional_binding = admin.create_role_binding(
    user_id="user-uuid-123",
    role_id="admin-role-uuid",
    conditions={"mfa_required": True}
)
print(f"✓ Conditional binding: {conditional_binding['id']}")
```

**Endpoint:**

`POST /uflow/user/bindings`

### Remove a Role Binding

```python
# Syntax
remove_role_binding(binding_id: str)

# Example
admin.remove_role_binding("binding-uuid-123")
# Returns: True if successful
```

**Endpoint:**

`DELETE /uflow/user/bindings/{id}`

### List Role Bindings

List role bindings with optional filters.

```python
# Syntax
list_role_bindings(user_id=None, role_id=None)

# Examples
all_bindings = admin.list_role_bindings()
user_bindings = admin.list_role_bindings(user_id="user-uuid")
role_bindings = admin.list_role_bindings(role_id="role-uuid")
```

**Returns:**

List of binding objects

**Endpoint:**

`GET /uflow/user/bindings`

</TabItem>
<TabItem value="typescript" label="TypeScript">

Coming Soon

</TabItem>
</Tabs>
