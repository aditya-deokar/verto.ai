# ADR-008: Inngest for Background Jobs

**Status**: Accepted  
**Date**: 2024  
**Decision Makers**: Core team

---

## Context

Mobile design generation involves multiple AI calls that can take 1-3 minutes total. Running these in a Server Action would exceed serverless function timeouts and block the user's request. We needed a background job system that works well in a serverless environment.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Inngest** | Event-driven serverless functions | Step functions, retries, local dev dashboard, Next.js integration | Vendor lock-in, additional service dependency |
| **BullMQ + Redis** | Queue-based job system | Open source, battle-tested, flexible | Requires Redis infrastructure, not serverless-native |
| **Vercel Cron + DB queue** | Cron-triggered queue processing | No additional services | Limited scheduling, no event-driven triggers, polling-based |
| **AWS SQS + Lambda** | Cloud queue + compute | Scalable, reliable | Complex setup, AWS ecosystem dependency |
| **QStash (Upstash)** | HTTP-based message queue | Serverless-native, simple API | Less feature-rich than Inngest, no step functions |

## Decision

**Use Inngest** for all background job processing, starting with mobile design generation.

## Rationale

1. **Step functions**: Inngest's step model lets us break long-running jobs into discrete, retryable steps. Each mobile screen generation is a step, so a failure in screen 5 doesn't restart screens 1-4.

2. **Serverless-native**: Works by receiving webhooks at a Next.js API route (`/api/mobile-design/inngest`). No persistent server, no Redis, no queue infrastructure.

3. **Excellent local development**: `inngest-cli dev` provides a full dashboard at `localhost:8288` for triggering events, inspecting runs, and debugging functions.

4. **Automatic retries**: Failed steps are automatically retried with configurable backoff, which is critical for AI API calls that may intermittently fail.

5. **Real-time integration**: `@inngest/realtime` provides streaming from background functions to the client, enabling progress updates for mobile design generation.

## Consequences

### Positive
- Mobile design generation runs in background without blocking UI
- Step-level retries for individual screen generation
- Full observability in both local and production dashboards
- Clean event-driven architecture (`mobile.generate` → function → DB)

### Negative
- Additional external service dependency
- Free tier has execution limits
- Inngest CLI required for local development
- Two separate API routes needed (main app + mobile design)

### Future Considerations
- **Move presentation generation to Inngest**: Currently, presentation generation runs in a Server Action (which can timeout). Moving it to Inngest would eliminate the timeout constraint and enable proper background processing.
- **Add more event-driven functions**: Email notifications, scheduled reports, cleanup jobs could all use Inngest.

## References

- `src/mobile-design/inngest/client.ts` — Inngest client
- `src/mobile-design/inngest/functions/generateScreens.ts` — Screen generation
- `src/mobile-design/inngest/functions/regenerateFrame.ts` — Frame regeneration
- `src/app/api/mobile-design/inngest/route.ts` — Webhook endpoint
