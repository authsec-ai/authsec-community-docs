---
title: "Step 5: Verify in Your Application"
sidebar_position: 5
---

# Step 5: Verify in Your Application

Use the SDK to verify user access:

## Python Example

```python
from minimal import AuthSecClient

client = AuthSecClient(base_url="https://your-authsec-server.com")
client.set_token("user-jwt-token")
```

## Check Permission

If `authorize(document, write)` returns `true`, the user is allowed to write documents.

```python
# Verify user can write documents
if client.authorize("document", "write"):
    print("User has write access to documents")
else:
    print("Access denied")
```
