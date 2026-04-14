# PPTMaker Documentation

Welcome to the PPTMaker documentation. This folder contains technical documentation for integrations and features.

## Contents

### Payment & Subscriptions

| Document | Description |
|----------|-------------|
| [Lemon Squeezy Overview](./lemon-squeezy-overview.md) | What is Lemon Squeezy, features, architecture diagrams, and current integration status |
| [Lemon Squeezy Implementation Plan](./lemon-squeezy-implementation-plan.md) | Complete code implementation plan for webhooks, subscription management, and UI components |
| [Lemon Squeezy API Reference](./lemon-squeezy-api-reference.md) | Quick reference for API endpoints, webhook events, and status codes |

---

## Quick Links

### Environment Setup

Required environment variables for Lemon Squeezy:

```bash
LEMON_SQUEEZY_API_KEY=          # API key from LS dashboard
LEMON_SQUEEZY_STORE_ID=         # Your store ID
LEMON_SQUEEZY_VARIANT_ID=       # Product variant for subscription
LEMON_SQUEEZY_WEBHOOK_SECRET=   # Webhook signing secret
NEXT_PUBLIC_LEMON_SQUEEZY_API=https://api.lemonsqueezy.com/v1/
```

### Current Implementation Status

| Feature | Status |
|---------|--------|
| Checkout Flow | ✅ Implemented |
| Upgrade Button | ✅ Implemented |
| Webhook Handler | ❌ Not Implemented |
| Subscription Sync | ❌ Not Implemented |
| Customer Portal | ❌ Not Implemented |

---

## Contributing to Docs

When adding new documentation:

1. Create a new `.md` file in this folder
2. Update this README with a link
3. Follow the existing format with clear headers and tables
