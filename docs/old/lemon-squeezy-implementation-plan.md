# Lemon Squeezy Complete Integration Plan

> Implementation plan for end-to-end Lemon Squeezy subscription management in PPTMaker.

## Current State Analysis

### What's Already Implemented

| Component | Location | Status |
|-----------|----------|--------|
| API Client | `src/lib/axios.ts` | ✅ Working |
| Checkout Action | `src/actions/payment.ts` | ✅ Working |
| Upgrade Button | `src/components/global/app-sidebar/nav-footer.tsx` | ✅ Working |
| User.subscription | `prisma/schema.prisma` | ✅ Exists (boolean) |
| Middleware Exclusion | `src/middleware.ts` | ✅ Webhook route excluded |

### What's Missing

| Component | Status | Priority |
|-----------|--------|----------|
| Webhook Handler | ❌ Missing | HIGH |
| Subscription Model | ❌ Missing | HIGH |
| Subscription Sync | ❌ Missing | HIGH |
| Customer Portal | ❌ Missing | MEDIUM |
| Feature Gating | ⚠️ Commented Out | MEDIUM |

---

## Implementation Plan

### Phase 1: Database Schema

#### [MODIFY] prisma/schema.prisma

Add Subscription model for complete subscription tracking:

```prisma
enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  PAST_DUE
  PAUSED
  UNPAID
  ON_TRIAL
}

model Subscription {
  id                  String             @id @default(cuid())
  userId              String             @unique @db.Uuid
  lemonSqueezyId      String             @unique  // Subscription ID from LS
  customerId          String                      // Customer ID from LS
  orderId             String?                     // Order ID from LS
  variantId           String                      // Product variant ID
  status              SubscriptionStatus @default(ACTIVE)
  
  // Billing details
  renewsAt            DateTime?
  endsAt              DateTime?
  trialEndsAt         DateTime?
  
  // Timestamps
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  
  // Relations
  user                User               @relation(fields: [userId], references: [id])
  
  @@index([lemonSqueezyId])
  @@index([customerId])
}

// Update User model
model User {
  // ... existing fields ...
  
  // Add relation
  Subscription Subscription?
}
```

---

### Phase 2: Webhook Handler

#### [NEW] src/app/api/webhook/lemon-squeezy/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

// Verify webhook signature
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature || !process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    return false;
  }
  
  const hmac = crypto.createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest("hex");
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Map LS status to our enum
function mapStatus(lsStatus: string): "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "PAUSED" | "UNPAID" | "ON_TRIAL" {
  const statusMap: Record<string, any> = {
    active: "ACTIVE",
    cancelled: "CANCELLED",
    expired: "EXPIRED",
    past_due: "PAST_DUE",
    paused: "PAUSED",
    unpaid: "UNPAID",
    on_trial: "ON_TRIAL",
  };
  return statusMap[lsStatus] || "ACTIVE";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature");
    
    // Verify signature
    if (!verifySignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    const event = JSON.parse(body);
    const eventName = event.meta.event_name;
    const data = event.data;
    const attributes = data.attributes;
    const customData = event.meta.custom_data;
    
    console.log(`Processing webhook: ${eventName}`);
    
    switch (eventName) {
      case "subscription_created": {
        const userId = customData?.buyerUserId;
        if (!userId) {
          console.error("No user ID in custom data");
          break;
        }
        
        // Create subscription record
        await prisma.subscription.create({
          data: {
            userId,
            lemonSqueezyId: String(data.id),
            customerId: String(attributes.customer_id),
            orderId: String(attributes.order_id),
            variantId: String(attributes.variant_id),
            status: mapStatus(attributes.status),
            renewsAt: attributes.renews_at ? new Date(attributes.renews_at) : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            trialEndsAt: attributes.trial_ends_at ? new Date(attributes.trial_ends_at) : null,
          },
        });
        
        // Update user subscription flag
        await prisma.user.update({
          where: { id: userId },
          data: { subscription: true },
        });
        
        break;
      }
      
      case "subscription_updated": {
        const subscriptionId = String(data.id);
        
        await prisma.subscription.update({
          where: { lemonSqueezyId: subscriptionId },
          data: {
            status: mapStatus(attributes.status),
            renewsAt: attributes.renews_at ? new Date(attributes.renews_at) : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
          },
        });
        
        // Update user subscription flag based on status
        const isActive = ["active", "on_trial"].includes(attributes.status);
        const subscription = await prisma.subscription.findUnique({
          where: { lemonSqueezyId: subscriptionId },
        });
        
        if (subscription) {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { subscription: isActive },
          });
        }
        
        break;
      }
      
      case "subscription_cancelled":
      case "subscription_expired": {
        const subscriptionId = String(data.id);
        
        const subscription = await prisma.subscription.update({
          where: { lemonSqueezyId: subscriptionId },
          data: {
            status: eventName === "subscription_cancelled" ? "CANCELLED" : "EXPIRED",
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : new Date(),
          },
        });
        
        // Revoke access
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { subscription: false },
        });
        
        break;
      }
      
      case "subscription_resumed":
      case "subscription_unpaused": {
        const subscriptionId = String(data.id);
        
        const subscription = await prisma.subscription.update({
          where: { lemonSqueezyId: subscriptionId },
          data: {
            status: "ACTIVE",
            renewsAt: attributes.renews_at ? new Date(attributes.renews_at) : null,
          },
        });
        
        // Restore access
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { subscription: true },
        });
        
        break;
      }
      
      default:
        console.log(`Unhandled event: ${eventName}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
```

---

### Phase 3: Subscription Actions

#### [NEW] src/actions/subscription.ts

```typescript
"use server";

import prisma from "@/lib/prisma";
import lemonSqueezyClient from "@/lib/axios";
import { onAuthenticateUser } from "./user";

// Get user's subscription details
export const getSubscription = async () => {
  try {
    const checkUser = await onAuthenticateUser();
    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "Not authenticated" };
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: checkUser.user.id },
    });
    
    return { status: 200, data: subscription };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { status: 500, error: "Internal server error" };
  }
};

// Get customer portal URL
export const getCustomerPortalUrl = async () => {
  try {
    const checkUser = await onAuthenticateUser();
    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "Not authenticated" };
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: checkUser.user.id },
    });
    
    if (!subscription) {
      return { status: 404, error: "No subscription found" };
    }
    
    // Fetch customer portal URL from Lemon Squeezy
    const response = await lemonSqueezyClient().get(
      `/customers/${subscription.customerId}`
    );
    
    const portalUrl = response.data.data.attributes.urls.customer_portal;
    
    return { status: 200, url: portalUrl };
  } catch (error) {
    console.error("Error getting portal URL:", error);
    return { status: 500, error: "Internal server error" };
  }
};

// Cancel subscription
export const cancelSubscription = async () => {
  try {
    const checkUser = await onAuthenticateUser();
    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "Not authenticated" };
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: checkUser.user.id },
    });
    
    if (!subscription) {
      return { status: 404, error: "No subscription found" };
    }
    
    // Cancel via Lemon Squeezy API
    await lemonSqueezyClient().delete(
      `/subscriptions/${subscription.lemonSqueezyId}`
    );
    
    return { status: 200, message: "Subscription cancelled" };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return { status: 500, error: "Internal server error" };
  }
};

// Sync subscription status (call on app load)
export const syncSubscriptionStatus = async () => {
  try {
    const checkUser = await onAuthenticateUser();
    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "Not authenticated" };
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: checkUser.user.id },
    });
    
    if (!subscription) {
      return { status: 200, data: null };
    }
    
    // Fetch latest from Lemon Squeezy
    const response = await lemonSqueezyClient().get(
      `/subscriptions/${subscription.lemonSqueezyId}`
    );
    
    const lsSubscription = response.data.data;
    const attributes = lsSubscription.attributes;
    
    // Update local record
    const statusMap: Record<string, any> = {
      active: "ACTIVE",
      cancelled: "CANCELLED",
      expired: "EXPIRED",
      past_due: "PAST_DUE",
      paused: "PAUSED",
      unpaid: "UNPAID",
      on_trial: "ON_TRIAL",
    };
    
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: statusMap[attributes.status] || "ACTIVE",
        renewsAt: attributes.renews_at ? new Date(attributes.renews_at) : null,
        endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
      },
    });
    
    // Update user flag
    const isActive = ["active", "on_trial"].includes(attributes.status);
    await prisma.user.update({
      where: { id: checkUser.user.id },
      data: { subscription: isActive },
    });
    
    return { status: 200, data: updatedSubscription };
  } catch (error) {
    console.error("Error syncing subscription:", error);
    return { status: 500, error: "Internal server error" };
  }
};
```

---

### Phase 4: UI Components

#### [NEW] src/components/global/subscription/SubscriptionStatus.tsx

```typescript
"use client";

import { useEffect, useState } from "react";
import { Subscription } from "@/generated/prisma";
import { getSubscription } from "@/actions/subscription";
import { Badge } from "@/components/ui/badge";
import { Crown, AlertTriangle } from "lucide-react";

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      const result = await getSubscription();
      if (result.status === 200 && result.data) {
        setSubscription(result.data);
      }
      setLoading(false);
    };
    
    fetchSubscription();
  }, []);
  
  if (loading) return null;
  
  if (!subscription) {
    return (
      <Badge variant="outline" className="gap-1">
        Free Plan
      </Badge>
    );
  }
  
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-500 border-green-500/30",
    ON_TRIAL: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    CANCELLED: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    EXPIRED: "bg-red-500/10 text-red-500 border-red-500/30",
    PAST_DUE: "bg-red-500/10 text-red-500 border-red-500/30",
  };
  
  return (
    <Badge className={`gap-1 ${statusColors[subscription.status] || ""}`}>
      {subscription.status === "ACTIVE" && <Crown className="h-3 w-3" />}
      {subscription.status === "PAST_DUE" && <AlertTriangle className="h-3 w-3" />}
      {subscription.status === "ACTIVE" ? "Pro" : subscription.status}
    </Badge>
  );
}
```

#### [NEW] src/components/global/subscription/ManageSubscription.tsx

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getCustomerPortalUrl } from "@/actions/subscription";
import { ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ManageSubscription() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleManage = async () => {
    setLoading(true);
    try {
      const result = await getCustomerPortalUrl();
      
      if (result.status === 200 && result.url) {
        window.open(result.url, "_blank");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to get portal URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleManage}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <ExternalLink className="h-4 w-4 mr-2" />
      )}
      Manage Subscription
    </Button>
  );
}
```

---

## File Summary

| Action | File | Description |
|--------|------|-------------|
| MODIFY | `prisma/schema.prisma` | Add Subscription model |
| NEW | `src/app/api/webhook/lemon-squeezy/route.ts` | Webhook handler |
| NEW | `src/actions/subscription.ts` | Subscription management actions |
| NEW | `src/components/global/subscription/SubscriptionStatus.tsx` | Status badge |
| NEW | `src/components/global/subscription/ManageSubscription.tsx` | Portal button |
| MODIFY | `src/components/global/app-sidebar/nav-footer.tsx` | Add manage button |

---

## Webhook Configuration

### Setup in Lemon Squeezy Dashboard

1. Go to **Settings → Webhooks**
2. Click **Create Webhook**
3. Enter URL: `https://your-domain.com/api/webhook/lemon-squeezy`
4. Select events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_resumed`
   - `subscription_paused`
5. Copy the **Signing Secret**
6. Add to `.env` as `LEMON_SQUEEZY_WEBHOOK_SECRET`

---

## Testing Checklist

- [ ] Create subscription → webhook received → DB updated
- [ ] Cancel subscription → webhook received → access revoked
- [ ] Customer portal link works
- [ ] Subscription status displays correctly
- [ ] Feature gating works for AI generation
- [ ] Expired subscription prevents access
- [ ] Subscription sync on app load

---

## Environment Variables Needed

```bash
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_VARIANT_ID=your_variant_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_LEMON_SQUEEZY_API=https://api.lemonsqueezy.com/v1/
```
