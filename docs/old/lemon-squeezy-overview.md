# Lemon Squeezy Integration Documentation

> Complete documentation for Lemon Squeezy payment integration in the PPTMaker application.

## Table of Contents

1. [Overview](#overview)
2. [What is Lemon Squeezy?](#what-is-lemon-squeezy)
3. [Features & Benefits](#features--benefits)
4. [Architecture](#architecture)
5. [Current Integration Status](#current-integration-status)
6. [Complete Integration Roadmap](#complete-integration-roadmap)
7. [API Reference](#api-reference)
8. [Environment Configuration](#environment-configuration)
9. [Implementation Details](#implementation-details)

---

## Overview

Lemon Squeezy is our chosen payment platform for handling subscriptions and payments in PPTMaker. It serves as a **Merchant of Record (MoR)**, meaning it handles:

- Payment processing
- Global tax compliance (VAT, GST, sales tax)
- Fraud prevention
- Invoicing and receipts
- Subscription management

This allows us to focus on building the product while Lemon Squeezy handles all payment complexities.

---

## What is Lemon Squeezy?

Lemon Squeezy is an all-in-one payment platform designed specifically for **digital products and SaaS businesses**. Unlike traditional payment processors (Stripe, PayPal), Lemon Squeezy acts as your Merchant of Record.

### Merchant of Record Explained

| Traditional Payment Processor | Lemon Squeezy (MoR) |
|------------------------------|---------------------|
| You are the seller | Lemon Squeezy is the seller |
| You handle tax compliance | They handle all taxes |
| You manage chargebacks | They manage disputes |
| Complex setup for global sales | Sell globally instantly |
| Need to register in each country | No registration needed |

### Key Differentiators

- **No need for tax ID registration** - Sell to 190+ countries without registering for VAT/GST
- **Automatic tax calculation** - Correct tax rates applied at checkout
- **Tax remittance** - Lemon Squeezy files and pays taxes on your behalf
- **Fraud protection** - Built-in fraud detection and chargeback handling

---

## Features & Benefits

### For PPTMaker

| Feature | Benefit |
|---------|---------|
| **Subscription Billing** | Recurring revenue for Creative AI tier |
| **License Keys** | Can sell presentation templates with licenses |
| **Customer Portal** | Users manage their own subscriptions |
| **Webhooks** | Real-time subscription status updates |
| **Multi-currency** | Accept payments in user's local currency |
| **Checkout Customization** | Branded checkout experience |

### Supported Features

```
┌─────────────────────────────────────────────────────────────┐
│                    LEMON SQUEEZY FEATURES                    │
├─────────────────────────────────────────────────────────────┤
│  Payments           │  Subscriptions      │  Extras          │
│  ─────────────────  │  ─────────────────  │  ─────────────── │
│  ✓ Credit Cards     │  ✓ Monthly/Yearly   │  ✓ Affiliates    │
│  ✓ PayPal           │  ✓ Free Trials      │  ✓ Discounts     │
│  ✓ Apple Pay        │  ✓ Pause/Resume     │  ✓ License Keys  │
│  ✓ Google Pay       │  ✓ Upgrades/Downg.  │  ✓ Email Mktg    │
│  ✓ iDEAL, SEPA      │  ✓ Usage-based      │  ✓ Analytics     │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              PPTMaker App                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐   │
│  │   Frontend UI   │───>│  Server Actions │───>│    Lemon Squeezy    │   │
│  │  (nav-footer)   │    │  (payment.ts)   │    │        API          │   │
│  │                 │    │                 │    │                     │   │
│  │  Upgrade Button │    │ buySubscription │    │  POST /checkouts    │   │
│  └─────────────────┘    └─────────────────┘    └──────────┬──────────┘   │
│                                                           │              │
│                                                           ▼              │
│                                               ┌───────────────────────┐  │
│                                               │   Lemon Squeezy       │  │
│                                               │   Hosted Checkout     │  │
│                                               │                       │  │
│                                               │   - Payment Form      │  │
│                                               │   - Tax Calculation   │  │
│                                               │   - 3D Secure         │  │
│                                               └───────────┬───────────┘  │
│                                                           │              │
│                    ┌──────────────────────────────────────┘              │
│                    │ Payment Success                                     │
│                    ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                         WEBHOOK HANDLER                              │ │
│  │                    /api/webhook/lemon-squeezy                        │ │
│  │                                                                      │ │
│  │   Events:                                                            │ │
│  │   • subscription_created    → Set user.subscription = true          │ │
│  │   • subscription_updated    → Update subscription status            │ │
│  │   • subscription_cancelled  → Set user.subscription = false         │ │
│  │   • subscription_expired    → Set user.subscription = false         │ │
│  │   • order_created           → Log purchase                          │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                          DATABASE (Prisma)                           │ │
│  │                                                                      │ │
│  │   User Model:                                                        │ │
│  │   • subscription: Boolean      (active subscription?)                │ │
│  │   • lemonSqueezyApiKey: String (for per-user payments - optional)   │ │
│  │   • storeId: String            (if multi-tenant)                    │ │
│  │   • webhookSecret: String      (per-user webhook)                   │ │
│  │                                                                      │ │
│  │   Subscription Model (NEW):                                          │ │
│  │   • id: String                                                       │ │
│  │   • userId: String                                                   │ │
│  │   • lemonSqueezyId: String     (subscription ID from LS)            │ │
│  │   • customerId: String         (customer ID from LS)                │ │
│  │   • status: Enum               (active, cancelled, expired, etc)    │ │
│  │   • planId: String             (variant ID)                         │ │
│  │   • currentPeriodEnd: DateTime                                      │ │
│  │   • createdAt: DateTime                                             │ │
│  │   • updatedAt: DateTime                                             │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Payment Flow Sequence

```
┌──────┐          ┌──────────┐          ┌─────────────┐          ┌──────────┐
│ User │          │ Frontend │          │   Backend   │          │  Lemon   │
│      │          │          │          │             │          │ Squeezy  │
└──┬───┘          └────┬─────┘          └──────┬──────┘          └────┬─────┘
   │                   │                       │                      │
   │ Click Upgrade     │                       │                      │
   │──────────────────>│                       │                      │
   │                   │                       │                      │
   │                   │ buySubscription()     │                      │
   │                   │──────────────────────>│                      │
   │                   │                       │                      │
   │                   │                       │ POST /v1/checkouts   │
   │                   │                       │─────────────────────>│
   │                   │                       │                      │
   │                   │                       │   Checkout URL       │
   │                   │                       │<─────────────────────│
   │                   │                       │                      │
   │                   │   Redirect to URL     │                      │
   │                   │<──────────────────────│                      │
   │                   │                       │                      │
   │ Complete Payment  │                       │                      │
   │───────────────────────────────────────────────────────────────-->│
   │                   │                       │                      │
   │                   │                       │  Webhook: sub_created│
   │                   │                       │<─────────────────────│
   │                   │                       │                      │
   │                   │                       │ Update DB            │
   │                   │                       │────┐                 │
   │                   │                       │    │                 │
   │                   │                       │<───┘                 │
   │                   │                       │                      │
   │ Redirect to /dashboard                    │                      │
   │<──────────────────────────────────────────────────────────────────│
   │                   │                       │                      │
```

---

## Current Integration Status

### ✅ Implemented

| Component | File | Description |
|-----------|------|-------------|
| API Client | `src/lib/axios.ts` | Axios client with authentication |
| Checkout Action | `src/actions/payment.ts` | Creates checkout session |
| Upgrade UI | `src/components/global/app-sidebar/nav-footer.tsx` | Upgrade button |
| User Model | `prisma/schema.prisma` | Basic subscription flag |
| Middleware | `src/middleware.ts` | Webhook route excluded from auth |

### ❌ Missing (Required for Complete Integration)

| Component | Priority | Description |
|-----------|----------|-------------|
| Webhook Handler | **HIGH** | Receive and process LS events |
| Subscription Model | **HIGH** | Store detailed subscription data |
| Subscription Sync | **HIGH** | Keep local DB in sync with LS |
| Customer Portal Link | MEDIUM | Let users manage subscriptions |
| Subscription Status Checks | MEDIUM | Gate features based on status |
| Cancel Subscription | LOW | API to cancel from app |
| Usage Tracking | LOW | For usage-based billing |

---

## Complete Integration Roadmap

### Phase 1: Core Subscription (HIGH Priority)

```
1. Create Subscription Model in Prisma
2. Implement Webhook Handler (/api/webhook/lemon-squeezy)
3. Handle subscription_created event
4. Handle subscription_updated event
5. Handle subscription_cancelled event
6. Handle subscription_expired event
7. Sync subscription status on app load
```

### Phase 2: User Experience (MEDIUM Priority)

```
1. Add Customer Portal button in settings
2. Show subscription status in dashboard
3. Display billing history
4. Add plan comparison/pricing page
5. Implement upgrade/downgrade flows
```

### Phase 3: Advanced Features (LOW Priority)

```
1. License key generation for templates
2. Affiliate program integration
3. Usage-based billing for AI generation
4. Team/organization subscriptions
5. Multi-currency display
```

---

## API Reference

### Lemon Squeezy API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/checkouts` | POST | Create checkout session |
| `/v1/subscriptions` | GET | List all subscriptions |
| `/v1/subscriptions/{id}` | GET | Get subscription details |
| `/v1/subscriptions/{id}` | PATCH | Update subscription |
| `/v1/subscriptions/{id}` | DELETE | Cancel subscription |
| `/v1/customers` | GET | List customers |
| `/v1/customers/{id}/portal` | GET | Get customer portal URL |
| `/v1/orders` | GET | List orders |

### Webhook Events

| Event | Trigger | Action |
|-------|---------|--------|
| `subscription_created` | New subscription | Create subscription record |
| `subscription_updated` | Plan change, renewal | Update subscription record |
| `subscription_cancelled` | User cancels | Mark as cancelled |
| `subscription_resumed` | User resumes | Mark as active |
| `subscription_expired` | End of period | Revoke access |
| `subscription_paused` | User pauses | Mark as paused |
| `order_created` | New purchase | Log transaction |
| `order_refunded` | Refund issued | Handle refund logic |

---

## Environment Configuration

### Required Environment Variables

```bash
# Lemon Squeezy Configuration
LEMON_SQUEEZY_API_KEY=          # API key from LS dashboard
LEMON_SQUEEZY_STORE_ID=         # Your store ID
LEMON_SQUEEZY_VARIANT_ID=       # Product variant for subscription
LEMON_SQUEEZY_WEBHOOK_SECRET=   # Webhook signing secret
NEXT_PUBLIC_LEMON_SQUEEZY_API=  # API base URL (https://api.lemonsqueezy.com/v1/)
```

### How to Get These Values

| Variable | Where to Find |
|----------|---------------|
| API Key | Dashboard → Settings → API |
| Store ID | Dashboard → Settings → Stores → Store ID |
| Variant ID | Dashboard → Products → Click Product → Variants → Variant ID |
| Webhook Secret | Dashboard → Settings → Webhooks → Create → Signing Secret |

---

## Implementation Details

### Current Checkout Implementation

```typescript
// src/actions/payment.ts
export const buySubscription = async (buyUserId: string) => {
  const res = await lemonSqueezyClient().post("/checkouts", {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          custom: {
            buyerUserId: buyUserId, // Pass user ID for webhook
          },
        },
        redirect_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard`,
      },
      relationships: {
        store: { data: { type: "stores", id: STORE_ID } },
        variant: { data: { type: "variants", id: VARIANT_ID } },
      },
    },
  });
  
  return { url: res.data.data.attributes.url };
};
```

### Webhook Handler (To Implement)

```typescript
// src/app/api/webhook/lemon-squeezy/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // 1. Verify webhook signature
  const signature = req.headers.get("x-signature");
  const body = await req.text();
  
  const hmac = crypto.createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!);
  const digest = hmac.update(body).digest("hex");
  
  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  // 2. Parse event
  const event = JSON.parse(body);
  const eventName = event.meta.event_name;
  const data = event.data;
  
  // 3. Handle events
  switch (eventName) {
    case "subscription_created":
      await handleSubscriptionCreated(data);
      break;
    case "subscription_updated":
      await handleSubscriptionUpdated(data);
      break;
    case "subscription_cancelled":
    case "subscription_expired":
      await handleSubscriptionEnded(data);
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

---

## Next Steps

See [lemon-squeezy-implementation-plan.md](./lemon-squeezy-implementation-plan.md) for the detailed implementation plan to complete the integration.

---

## Resources

- [Lemon Squeezy Documentation](https://docs.lemonsqueezy.com)
- [API Reference](https://docs.lemonsqueezy.com/api)
- [Webhook Events](https://docs.lemonsqueezy.com/help/webhooks)
- [JavaScript SDK](https://github.com/lmsqueezy/lemonsqueezy.js)

