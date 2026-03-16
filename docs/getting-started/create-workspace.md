---
title: Create Workspace
sidebar_position: 2
---

# Create Workspace

After successful email verification, you must create a **workspace** to organize your authentication environment.

## What is a Workspace?

A workspace represents:

- Your **organization**
- Your **product or SaaS environment**
- A **security boundary** for users, clients, and permissions

Each workspace operates as an independent authentication tenant with its own configuration, users, and security policies.

---

## Create Your Workspace

![Create Workspace](/screenshots/getting-started/3.png)

### Required Fields

| Field | Description |
|-------|-------------|
| **Email** | Owner email address |
| **Workspace Domain** | Unique identifier (e.g., `acme-cloud`) |
| **Password** | Admin password for the workspace |

### Steps:

1. Enter your **email address** (this will be the workspace owner)
2. Choose a unique **workspace domain**
   - Use lowercase letters, numbers, and hyphens
   - Example: `acme-cloud`, `my-company`, `startup-xyz`
3. Set a strong **admin password**
4. Click **Create Workspace**

---

## After Creation

Once created, this workspace becomes your **primary authentication tenant**. You can:

- Add team members
- Configure authentication providers
- Set up RBAC policies
- Manage client applications
- Monitor authentication logs

:::tip
Choose a workspace domain that reflects your organization or product name for easy identification.
:::

:::warning Important
The workspace domain **cannot be changed** after creation, so choose carefully!
:::
