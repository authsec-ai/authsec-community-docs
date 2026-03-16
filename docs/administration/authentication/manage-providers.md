---
title: Manage Providers
sidebar_position: 4
---

# Manage Authentication Providers

From the authentication providers table, actions are available via the row dropdown menu.

## Toggle Active or Inactive

Click the **Eye** or **EyeOff** icon to toggle the provider status.

This triggers the toggle active handler.

### API Behavior

**OIDC**: `POST /oocmgr/oidc/update-provider`
- Sends full provider payload with updated active flag

**SAML**: `POST /oocmgr/saml/update-provider`
- Sends provider ID and active flag

A toast notification confirms activation or deactivation.

## Delete Authentication Method

1. Click the **Trash** icon to open the delete confirmation dialog
2. Review the impact of deletion, including:
   - OAuth or SAML configuration
   - Registered applications and redirect URLs
   - Tokens, keys, and secrets
   - User authentication flows and logs
3. Confirm deletion

### API Calls

**OIDC**: `POST /oocmgr/oidc/delete-provider`

**SAML**: `POST /oocmgr/saml/delete-provider`

After deletion, the unified providers list is refreshed.

## Additional Features

Filters and search options are available by:
- Status
- Authentication type
- Client
- Name or ID matching

## Key Files

- `AuthenticationPage.tsx`
- `types.ts` (UnifiedAuthProvider definition)
