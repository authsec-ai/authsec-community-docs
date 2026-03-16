---
title: Sign In & Account Setup
sidebar_position: 1
---

# Sign In & Account Setup

## Email Sign In

You can sign in or create an account using your email address.

### Steps:

1. Navigate to the [AuthSec sign-in page](https://app.authsec.ai)
2. Enter your email address
3. Click **Continue**
4. If the account does not exist, AuthSec will begin the signup process

![AuthSec Sign-In Page](/screenshots/getting-started/1.png)

Supported email domains include both personal and work emails.

---

## Verify Email

After entering your email, AuthSec sends a **6-digit verification code** to ensure account security.

### Steps:

1. Check your inbox for the verification code
2. Enter the 6-digit code in the verification screen
3. Click **Verify Account**

![Email Verification](/screenshots/getting-started/2.png)

:::tip
If the code expires, you can resend it after the cooldown timer.
:::

---

## OAuth Providers

AuthSec supports social and enterprise OAuth authentication for seamless sign-in.

### Available providers:

- **Google** - Consumer and SaaS applications
- **GitHub** - Developer platforms
- **Microsoft** - Enterprise users with Azure Entra ID

![OAuth Providers](/screenshots/getting-started/1.png)

OAuth allows users to authenticate without creating a password, providing a faster and more secure experience.

### Google Sign-In

- Uses **Google OAuth 2.0**
- Suitable for consumer and SaaS applications
- Automatically verifies user email

### GitHub Sign-In

- Ideal for **developer platforms**
- Uses GitHub OAuth
- Provides verified GitHub identity

### Microsoft Sign-In

- Supports Microsoft personal accounts
- Supports **Azure Entra ID** (formerly Azure AD)
- Recommended for enterprise users

:::info
OAuth providers handle authentication securely without sharing credentials with AuthSec.
:::
