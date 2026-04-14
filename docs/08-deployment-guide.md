# Deployment Guide

> Production deployment strategy, infrastructure requirements, platform configuration, and operational procedures for Verto AI.

---

## Table of Contents

- [Deployment Architecture](#deployment-architecture)
- [Platform Options](#platform-options)
- [Vercel Deployment](#vercel-deployment)
- [Database Deployment](#database-deployment)
- [External Service Configuration](#external-service-configuration)
- [Build Process](#build-process)
- [Environment Variable Management](#environment-variable-management)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Monitoring & Observability](#monitoring--observability)
- [Scaling Considerations](#scaling-considerations)

---

## Deployment Architecture

```mermaid
graph TB
    subgraph CDN["CDN / Edge"]
        StaticAssets[Static Assets<br/>JS, CSS, Images]
        Middleware[Clerk Middleware<br/>Auth at Edge]
    end
    
    subgraph Compute["Serverless Compute"]
        SSR[Next.js SSR<br/>Server Actions<br/>API Routes]
        LongRunning[AI Generation<br/>Long-running functions]
    end
    
    subgraph BackgroundJobs["Background Processing"]
        InngestWorker[Inngest Functions<br/>Mobile Design Gen]
    end
    
    subgraph DataLayer["Data Layer"]
        PostgreSQL[(PostgreSQL<br/>Managed Database)]
    end
    
    subgraph External["External Services"]
        Clerk[Clerk Auth]
        Gemini[Google Gemini API]
        Unsplash[Unsplash API]
        LemonSqueezy[Lemon Squeezy]
        InngestCloud[Inngest Cloud]
    end
    
    CDN --> Compute
    Compute --> DataLayer
    Compute --> External
    BackgroundJobs --> DataLayer
    BackgroundJobs --> External
    
    style CDN fill:#f59e0b,color:#000
    style Compute fill:#3b82f6,color:#fff
    style BackgroundJobs fill:#6366f1,color:#fff
    style DataLayer fill:#2D3748,color:#fff
```

---

## Platform Options

| Platform | Best For | Considerations |
|----------|----------|---------------|
| **Vercel** ⭐ | Next.js native deployment | Best DX, automatic optimizations, generous free tier. Recommended. |
| **Railway** | Full-stack with managed DB | Built-in PostgreSQL, simple deploy-from-git |
| **Render** | Budget-conscious deployment | Free tier available, good PostgreSQL support |
| **AWS (Amplify)** | Enterprise / custom infra | Maximum control, more setup overhead |
| **Docker (Self-hosted)** | Air-gapped / on-prem | Full control, requires infrastructure management |

**Recommended**: **Vercel** for the application + **Neon/Supabase** for PostgreSQL.

---

## Vercel Deployment

### Initial Setup

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repository
   - Vercel auto-detects Next.js

2. **Configure Build Settings**:
   | Setting | Value |
   |---------|-------|
   | Framework Preset | Next.js |
   | Build Command | `bun run build` (or `next build`) |
   | Output Directory | `.next` (auto-detected) |
   | Install Command | `bun install` |
   | Node.js Version | 18.x or 20.x |

3. **Set Environment Variables**:
   Add all variables from [Environment Variables Reference](07-development-guide.md#environment-variables-reference) in the Vercel dashboard under Settings → Environment Variables.

4. **Deploy**:
   Push to `main` branch → automatic deployment.

### Vercel-Specific Configuration

**`next.config.ts`** considerations:
- `reactCompiler: true` — Works on Vercel
- Image domains are configured for Unsplash
- Server Actions are automatically supported
- SSE streaming works via Vercel's streaming response support

### Function Timeout Configuration

AI generation can take 30-60 seconds. Configure function timeouts:

```typescript
// In next.config.ts or per-route
export const maxDuration = 60; // seconds
```

> **Important**: Vercel Hobby plan has a 10-second limit. AI generation requires the **Pro plan** (60s) or **Enterprise** (300s). Alternatively, move generation to an Inngest background function.

### Caching Headers

Static assets are automatically cached by Vercel's CDN. For dynamic routes:
- Server Actions: No caching (mutations)
- SSE endpoint: No caching (streaming)
- Share pages: Consider `revalidate` for popular shared presentations

---

## Database Deployment

### Recommended: Managed PostgreSQL

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **Neon** | 0.5 GB storage, 10 branches | Development + small production |
| **Supabase** | 500 MB, 2 projects | Full Postgres + extras |
| **Railway** | $5 credit/month | Simple managed DB |
| **PlanetScale** | — | MySQL only (not compatible) |

### Database Setup

1. **Create a managed PostgreSQL instance** on your chosen provider
2. **Get the connection string**: `postgresql://user:password@host:port/dbname`
3. **Configure Prisma connection**:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
   ```
4. **Apply migrations** (run locally or via CI):
   ```bash
   npx prisma migrate deploy
   ```

### Connection Pooling

For serverless environments (Vercel), configure connection pooling:

```env
# Direct connection (for migrations)
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# Pooled connection (for application queries) — if your provider supports it
# DATABASE_URL="postgresql://user:password@pooler-host:port/dbname?sslmode=require&pgbouncer=true"
```

Neon provides built-in connection pooling. Supabase uses PgBouncer.

### Migration Strategy

```bash
# In CI/CD pipeline or before deployment:
npx prisma migrate deploy

# Never use `migrate dev` in production — it can reset data
```

---

## External Service Configuration

### Clerk (Authentication)

1. Create a **Clerk application** at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Configure sign-in methods (email, Google, GitHub, etc.)
3. Set redirect URLs:
   - Sign-in: `https://your-domain.com/sign-in`
   - Sign-up: `https://your-domain.com/sign-up`
   - After sign-in: `https://your-domain.com/dashboard`
4. Copy keys to environment:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
   CLERK_SECRET_KEY="sk_live_..."
   ```

### Google Gemini AI

1. Get API key from [ai.google.dev](https://ai.google.dev)
2. Configure billing (free tier has rate limits)
3. Set in environment:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY="AIza..."
   ```
4. Monitor quota usage in Google Cloud Console

### Unsplash

1. Create an application at [unsplash.com/developers](https://unsplash.com/developers)
2. Get your Access Key (free: 50 requests/hour)
3. For production, apply for **Production status** (5,000 requests/hour)
4. Set in environment:
   ```env
   UNSPLASH_ACCESS_KEY="your-access-key"
   ```

### Lemon Squeezy

1. Create a store at [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create a product with a variant
3. Configure webhook URL: `https://your-domain.com/api/webhook/lemon-squeezy`
4. Set events to listen for: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`
5. Set in environment:
   ```env
   LEMON_SQUEEZY_API_KEY="your-api-key"
   LEMON_SQUEEZY_STORE_ID="your-store-id"
   LEMON_SQUEEZY_VARIANT_ID="your-variant-id"
   LEMON_SQUEEZY_WEBHOOK_SECRET="your-webhook-secret"
   ```

### Inngest

1. Create an account at [inngest.com](https://inngest.com)
2. Create an app and get your keys
3. Set the serve URL to your API route:
   - Production: `https://your-domain.com/api/mobile-design/inngest`
4. Set in environment:
   ```env
   INNGEST_EVENT_KEY="your-event-key"
   INNGEST_SIGNING_KEY="your-signing-key"
   ```

---

## Build Process

### Build Command

```bash
bun run build
# Equivalent to: next build
```

### What Happens During Build

```mermaid
graph LR
    A[prisma generate] --> B[TypeScript Compile]
    B --> C[Static Analysis]
    C --> D[Page Rendering]
    D --> E[Static Export]
    E --> F[Optimize Assets]
    
    style A fill:#2D3748,color:#fff
    style D fill:#3b82f6,color:#fff
    style F fill:#10b981,color:#fff
```

1. **Prisma Client Generation** (`predev` script handles this for dev)
2. **TypeScript type checking**
3. **Static page rendering** — Landing page, error pages
4. **Dynamic route preparation** — Server Component pages
5. **Asset optimization** — JavaScript bundling, CSS minification, image optimization

### Build Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| `PrismaClientInitializationError` | No DATABASE_URL at build time | Set DATABASE_URL in build environment, or use `prisma generate` without DB |
| Type errors in generated Prisma | Stale generated client | Run `npx prisma generate` before build |
| Build timeout | AI-related code importing at build time | Ensure no top-level awaits in server action files |

---

## Environment Variable Management

### Variable Categories

| Category | Prefix | Visible to Client? | Example |
|----------|--------|-------------------|---------|
| **Public** | `NEXT_PUBLIC_` | ✅ Yes | `NEXT_PUBLIC_HOST_URL` |
| **Server Secret** | (none) | ❌ No | `CLERK_SECRET_KEY` |
| **Database** | (none) | ❌ No | `DATABASE_URL` |
| **API Keys** | (none) | ❌ No | `GOOGLE_GENERATIVE_AI_API_KEY` |

### Production vs Preview Variables

On Vercel, set different values for:
- **Production**: Live API keys, production database, real domain
- **Preview**: Test/staging API keys, separate database, preview domain
- **Development**: Local values (these come from `.env` file)

---

## Post-Deployment Checklist

### Critical Checks

- [ ] **Authentication**: Sign in/sign up flow works
- [ ] **Database**: Can create and load projects
- [ ] **AI Generation**: Can generate a complete presentation
- [ ] **Image Fetching**: Unsplash images load (or fallbacks work)
- [ ] **Subscriptions**: Checkout flow redirects correctly
- [ ] **Webhook**: Lemon Squeezy webhook is reachable and processes events
- [ ] **Inngest**: Functions are registered and reachable (if using)
- [ ] **Share Links**: Published presentations are accessible publicly
- [ ] **PDF Export**: Client-side export works
- [ ] **SSL/HTTPS**: All connections are secure

### Performance Checks

- [ ] **TTFB**: First meaningful paint under 2 seconds
- [ ] **LCP**: Largest contentful paint under 3 seconds
- [ ] **Bundle Size**: JavaScript bundle is reasonable (check with `npx next build --analyze`)
- [ ] **Image Optimization**: Next.js image optimization is serving WebP/AVIF

---

## Monitoring & Observability

### Recommended Stack

| Tool | Purpose | Integration |
|------|---------|-------------|
| **Vercel Analytics** | Web vitals, page views | Built-in with Vercel |
| **Vercel Speed Insights** | Performance monitoring | `@vercel/speed-insights` |
| **Sentry** | Error tracking, exception monitoring | `@sentry/nextjs` |
| **Inngest Dashboard** | Background job monitoring | Built-in with Inngest |
| **Prisma Studio** | Database inspection | `npx prisma studio` |

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| **Generation Success Rate** | > 95% | < 90% |
| **Generation Time (p50)** | < 30s | > 60s |
| **API Error Rate** | < 1% | > 5% |
| **Database Connection Pool** | < 80% utilization | > 90% |
| **Gemini API Quota** | Within limits | > 80% of quota |

---

## Scaling Considerations

### Current Architecture Limits

| Component | Limit | Bottleneck |
|-----------|-------|-----------|
| **Concurrent Generations** | ~10 | Gemini API rate limits |
| **Database Connections** | Provider-dependent | Connection pooling needed |
| **SSE Connections** | ~100 per server instance | Serverless connection limits |
| **Image Search** | 50/hour (free Unsplash) | Apply for Production status |

### Scaling Strategies

1. **Move generation to background jobs**: Use Inngest for all AI generation (not just mobile design). This removes the serverless function timeout constraint entirely.

2. **Database connection pooling**: Use PgBouncer or Neon's built-in pooler for serverless environments.

3. **Implement queue-based generation**: For high concurrency, use a queue (Inngest, BullMQ) to limit concurrent Gemini API calls.

4. **CDN caching for shared presentations**: Cache published presentations at the CDN layer with `revalidate` to reduce server load.

5. **Multiple Gemini API keys**: Rotate between keys for higher throughput.

---

*Next: [09-security.md](09-security.md) — authentication, authorization, and data protection.*
