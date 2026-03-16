---
title: SAML 2.0 Setup
sidebar_position: 3
---

# SAML 2.0 Setup

Click the **"Add Method"** button and select **"SAML 2.0"**.

## Step 1: Configuration

![SAML Configuration](/screenshots/auth-methods/saml-create.png)

Configure the following fields:

- **Select Client** (loaded from the clients API)
- **Provider Name** (example: `okta-saml`)
- **Display Name** (example: `Okta SAML`)

**Service Provider metadata** is auto-generated, including:
- Entity ID
- ACS URL
- Copy buttons are provided

## Step 2: Identity Provider Configuration

![SAML Identity Provider](/screenshots/auth-methods/saml-IP.png)

Required and optional fields include:

- **Entity ID** (from IdP metadata)
- **SSO URL** (IdP login endpoint)
- **Certificate** (X.509 PEM format)
- **Metadata URL** (optional)
- **Name ID format** (example: persistent identifier format)

**Attribute mapping**:
- `email` mapped to `email`
- `first_name` mapped to `firstName`
- `last_name` mapped to `lastName`

## Step 3: Review

![SAML Review](/screenshots/auth-methods/saml-review.png)

1. Review the full configuration
2. Click **Finish** to complete setup

## API Call

The following API call is used to create the SAML provider:

**Endpoint**: `POST /oocmgr/saml/add-provider`

**Payload includes**:
- Tenant ID
- Client ID
- Provider details
- IdP configuration
- Attribute mapping
- Active status
- Sort order
