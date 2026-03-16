---
title: Syslog
sidebar_position: 4
---

# Syslog

Stream logs to your Syslog server via UDP or TCP.

The Syslog output plugin allows you to deliver records to a Syslog server through TCP or UDP. It follows the RFC5424 protocol standard for message formatting.

## Configuration Steps

1. Tenant ID is automatically filled from your session
2. Enter domain (e.g., `logs.example.com`) or IP address (e.g., `192.168.1.100`)
3. Port field appears only for IP addresses

![Syslog Configuration](/screenshots/log-config/3.png)
