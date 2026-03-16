---
title: Add External Service
sidebar_position: 2
---

# Add External Service

External services represent third-party APIs such as payment gateways, messaging platforms, or analytics services.

## Integration Benefits

You can:
- Register external services
- Securely store API keys or OAuth tokens
- Integrate services using provided SDKs

## Steps to Add a Service

![Create External Service](/screenshots/external-service/create-service.png)

1. Navigate to **External Services**
2. Click the **"Add Service"** button
3. Provide service configuration details

## Service Configuration Fields

- **Service Name** (required)
  - Example: `Stripe Payment API`
- **API URL** (required)
  - Example: `https://api.stripe.com/v1`
- **Description** (optional)
  - Brief description of the service
- **Tags** (comma-separated)
  - Example: `payment, billing, stripe`
- **Authentication Type**
  - Example: `API Key`
- **API Key** (securely stored)
- **Webhook Secret** (optional)

## Create Service

After filling in the required details:

1. Click **Create Service**
2. The service is registered and securely stored
3. SDK integration details become available for the service
