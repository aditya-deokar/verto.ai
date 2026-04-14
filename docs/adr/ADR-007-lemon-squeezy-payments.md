# ADR-007: Lemon Squeezy for Payments

**Status**: Accepted  
**Date**: 2024  
**Decision Makers**: Core team

---

## Context

Verto AI offers a subscription plan for premium features. We needed a payment provider that handles recurring billing, subscription management, and — critically — tax compliance across global jurisdictions.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Lemon Squeezy** | Merchant of Record (MoR) | Handles tax, compliance, invoicing globally; simple API | Higher fees than Stripe, fewer features, newer platform |
| **Stripe** | Payment processor | Industry standard, powerful API, excellent docs | Must handle tax (Stripe Tax is separate), complex compliance |
| **Paddle** | Merchant of Record | Similar MoR model to LS, more established | More expensive, enterprise-focused |
| **PayPal** | Payment processor | Ubiquitous, buyer trust | Poor DX, complex integration, no MoR |

## Decision

**Use Lemon Squeezy** as the Merchant of Record for all subscription billing.

## Rationale

1. **Merchant of Record**: Lemon Squeezy handles all tax collection, remittance, and compliance globally. As an indie/small-team SaaS, handling VAT/GST/sales tax across 100+ jurisdictions would be prohibitively complex with Stripe.

2. **Simple subscription API**: The JSON:API-based REST API is straightforward for creating checkouts, managing subscriptions, and processing webhooks.

3. **Webhook-based sync**: Subscription lifecycle events (`created`, `updated`, `cancelled`, `expired`) are pushed to our webhook endpoint, keeping local state in sync without polling.

4. **Customer portal**: Lemon Squeezy provides a hosted customer portal where users can update payment methods, view invoices, and cancel — no UI to build.

5. **Built-in checkout page**: Hosted checkout with custom branding, no PCI compliance concerns.

## Consequences

### Positive
- Zero tax compliance code — LS handles everything
- Checkout hosted by LS — no PCI scope
- Customer portal hosted by LS — no subscription management UI needed
- Simple webhook integration (4 event types)

### Negative
- Higher transaction fees than Stripe (~5% + $0.50 vs. Stripe's ~2.9% + $0.30)
- Smaller ecosystem than Stripe (fewer integrations, community resources)
- Dependency on a newer platform (established 2021)
- API is JSON:API format (slightly verbose compared to Stripe's REST)

### Integration Architecture

```
User → buySubscription() → LS Checkout Page → Payment → LS Webhook → Our API → DB
User → getCustomerPortalUrl() → LS Portal → Self-service management → LS Webhook → DB
```

### Sync Strategy
- **Webhook-first**: LS pushes events → we sync DB
- **On-demand sync**: `syncSubscriptionStatus()` called on app load as backup
- **Feature gating**: `hasActiveSubscription()` checks local DB (fast, no API call)

## References

- `src/actions/payment.ts` — Checkout creation
- `src/actions/subscription.ts` — Subscription management
- `src/app/api/webhook/lemon-squeezy/` — Webhook handler
- `src/lib/axios.ts` — LS API client
