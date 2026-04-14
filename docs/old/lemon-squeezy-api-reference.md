# Lemon Squeezy API Reference

> Quick reference for Lemon Squeezy API endpoints used in PPTMaker.

## Authentication

All API requests require a Bearer token in the Authorization header:

```bash
Authorization: Bearer {LEMON_SQUEEZY_API_KEY}
```

## Base URL

```
https://api.lemonsqueezy.com/v1/
```

## Rate Limits

- **300 requests per minute** per API key
- Returns `429 Too Many Requests` when exceeded

---

## Endpoints

### Checkouts

#### Create Checkout

```http
POST /checkouts
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

**Request Body:**
```json
{
  "data": {
    "type": "checkouts",
    "attributes": {
      "checkout_data": {
        "custom": {
          "buyerUserId": "user-uuid-here"
        }
      },
      "product_options": {
        "redirect_url": "https://yourapp.com/dashboard"
      }
    },
    "relationships": {
      "store": {
        "data": {
          "type": "stores",
          "id": "{STORE_ID}"
        }
      },
      "variant": {
        "data": {
          "type": "variants",
          "id": "{VARIANT_ID}"
        }
      }
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "type": "checkouts",
    "id": "checkout-id",
    "attributes": {
      "url": "https://yourstore.lemonsqueezy.com/checkout/custom/..."
    }
  }
}
```

---

### Subscriptions

#### List Subscriptions

```http
GET /subscriptions
```

#### Get Subscription

```http
GET /subscriptions/{id}
```

**Response:**
```json
{
  "data": {
    "type": "subscriptions",
    "id": "123456",
    "attributes": {
      "store_id": 12345,
      "customer_id": 67890,
      "order_id": 11111,
      "product_id": 22222,
      "variant_id": 33333,
      "status": "active",
      "card_brand": "visa",
      "card_last_four": "4242",
      "renews_at": "2024-02-15T00:00:00.000000Z",
      "ends_at": null,
      "trial_ends_at": null,
      "created_at": "2024-01-15T00:00:00.000000Z",
      "updated_at": "2024-01-15T00:00:00.000000Z"
    }
  }
}
```

#### Cancel Subscription

```http
DELETE /subscriptions/{id}
```

#### Update Subscription

```http
PATCH /subscriptions/{id}
```

**Request Body (Pause Example):**
```json
{
  "data": {
    "type": "subscriptions",
    "id": "123456",
    "attributes": {
      "pause": {
        "mode": "void"
      }
    }
  }
}
```

---

### Customers

#### Get Customer

```http
GET /customers/{id}
```

**Response includes:**
```json
{
  "data": {
    "attributes": {
      "urls": {
        "customer_portal": "https://yourstore.lemonsqueezy.com/billing?..."
      }
    }
  }
}
```

---

## Webhook Events

### Event Structure

```json
{
  "meta": {
    "event_name": "subscription_created",
    "custom_data": {
      "buyerUserId": "user-uuid"
    }
  },
  "data": {
    "type": "subscriptions",
    "id": "123456",
    "attributes": {
      "status": "active",
      "customer_id": 67890,
      "variant_id": 33333,
      "renews_at": "2024-02-15T00:00:00.000000Z",
      "ends_at": null
    }
  }
}
```

### Signature Verification

```typescript
import crypto from "crypto";

function verifySignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

### Event Types

| Event | Description |
|-------|-------------|
| `subscription_created` | New subscription started |
| `subscription_updated` | Subscription modified (plan change, renewal) |
| `subscription_cancelled` | User cancelled |
| `subscription_resumed` | Resumed after pause |
| `subscription_expired` | Reached end date |
| `subscription_paused` | Temporarily paused |
| `order_created` | New order placed |
| `order_refunded` | Order was refunded |

---

## Subscription Statuses

| Status | Description | User Has Access? |
|--------|-------------|------------------|
| `active` | Subscription is active | ✅ Yes |
| `on_trial` | In trial period | ✅ Yes |
| `paused` | Temporarily paused | ❌ No |
| `past_due` | Payment failed | ⚠️ Grace period |
| `unpaid` | Multiple failed payments | ❌ No |
| `cancelled` | User cancelled | ⚠️ Until period ends |
| `expired` | Subscription ended | ❌ No |

---

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid JSON or missing fields |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Not Found - Resource doesn't exist |
| `422` | Unprocessable Entity - Validation error |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

---

## SDK Options

### Official

- **JavaScript/TypeScript**: `@lemonsqueezy/lemonsqueezy.js`
- **Laravel**: `lmsqueezy/laravel`

### Community

- Python: `lemonsqueezy-py`
- Go: `lemonsqueezy-go`
- Ruby: `lemon_squeezy`

---

## Useful Links

- [API Documentation](https://docs.lemonsqueezy.com/api)
- [Webhook Setup](https://docs.lemonsqueezy.com/help/webhooks)
- [Test Mode](https://docs.lemonsqueezy.com/api#test-mode)
- [JavaScript SDK](https://github.com/lmsqueezy/lemonsqueezy.js)
