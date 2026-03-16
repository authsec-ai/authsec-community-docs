---
title: Installation
sidebar_position: 2
---

# Installation

## Using AuthSec SDK Package

Install the SDK directly from GitHub:

```bash
pip install git+https://github.com/authsec-ai/sdk-authsec.git
```

## Import in Your Code

```python
from AuthSec_SDK import CIBAClient
```

## Dependencies

All dependencies are automatically installed when you install the SDK. The SDK requires:

- Python 3.7+
- `requests` library for HTTP calls
- `time` module (built-in)

## Verify Installation

Test that the SDK is installed correctly:

```python
from AuthSec_SDK import CIBAClient

# This should not raise any errors
client = CIBAClient()
print("SDK installed successfully!")
```

## Upgrade to Latest Version

```bash
pip install --upgrade git+https://github.com/authsec-ai/sdk-authsec.git
```

## Next Steps

- [Configuration](./configuration) - Initialize the client
- [Quick Start](./#30-second-quick-start) - Get started in 30 seconds
