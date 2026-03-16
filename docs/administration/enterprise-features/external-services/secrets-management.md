---
title: Secrets Management
sidebar_position: 4
---

# Secrets Management – External Service Vault

Secrets Management allows you to securely store one-time or reusable secrets in a vault. These secrets can be accessed securely at runtime without hardcoding them in your application code or exposing them in configuration files.

## Use Cases

Securely store:
- **API keys**
- **Webhook secrets**
- **Tokens or credentials** required by services

## Add Secret

To add a secret:

1. Provide the **secret name** and **value**
2. Store the secret securely in the vault

## Configure Secrets

You can manage stored secrets by:

- **Viewing secret metadata**
- **Editing secret values**
- **Deleting secrets** when no longer required

## Security

Secrets are protected and only accessible to authorized services at runtime. They are never exposed in logs, configuration files, or application code.
