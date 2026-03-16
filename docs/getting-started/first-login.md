---
title: First Login Experience
sidebar_position: 4
---

# First Login Experience

After completing your security setup, you're ready to log in to AuthSec!

## Login Process

You will be redirected to the sign-in page where you can authenticate using the methods you've configured.

![First Login](/screenshots/getting-started/1.png)

### Login Options:

Depending on what you set up, you can login using:

1. **Password** + Email
2. **WebAuthn (Biometric)**
   - Fingerprint
   - Face recognition
   - Hardware security key
3. **Authenticator Code (TOTP)** - if enabled
4. **OAuth Provider** - Google, GitHub, or Microsoft

---

## Authentication Flow

### With Password + MFA:

1. Enter your **email address**
2. Enter your **password**
3. Complete **MFA verification**:
   - Biometric authentication (WebAuthn), or
   - 6-digit authenticator code (TOTP)
4. Access granted!

### With WebAuthn Only:

1. Enter your **email address**
2. Verify using your **biometric** (fingerprint/face) or **security key**
3. Access granted!

### With OAuth Provider:

1. Click on **Google**, **GitHub**, or **Microsoft**
2. Complete authentication with the provider
3. Complete **MFA verification** if enabled
4. Access granted!

---

## What Happens Next?

After successful authentication:

- You're logged into your AuthSec workspace  
- Dashboard loads with your organization's overview  
- You can start configuring authentication for your applications  

This completes the **onboarding flow**! You're now ready to explore the AuthSec platform.

:::tip Success!
You've successfully secured your AuthSec account. Welcome to the platform!
:::

---

## Troubleshooting

### Can't access your account?

- **Forgot password?** Use the "Forgot Password" link on the login page
- **Lost MFA device?** Contact your workspace administrator for recovery
- **Need help?** Reach out to [support@authsec.ai](mailto:support@authsec.ai)

### MFA not working?

- Ensure your device time is synchronized (for TOTP)
- Try using a backup authentication method
- Check if your security key is properly connected (for WebAuthn)
