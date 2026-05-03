# 05 — System Design & Scalability

> Shows you can think beyond the current implementation — a key senior engineer signal.

---

## Current Bottlenecks — Honest Assessment

### 1. Sequential LLM Calls
**Problem**: 5 LLM calls execute sequentially (~30-60s total).  
**Fix**: Parallelize where dependencies allow. Parallel image fetching is the biggest quick win.

### 2. In-Memory SSE Event Store
**Problem**: `StreamingEventEmitter` lives in process memory. Doesn't work across multiple servers.  
**Fix**: Redis Pub/Sub for cross-server SSE.

### 3. No Request Queuing
**Problem**: Generation starts immediately — burst traffic can overwhelm the LLM API.  
**Fix**: Queue-based generation with Inngest (infrastructure already exists).

### 4. JSON Column for Slides
**Problem**: `Project.slides` is a JSON column — no SQL-level indexing into content.  
**Fix**: Migrate to JSONB with GIN indexes if content search is needed.

---

## Scaling to 10K Concurrent Users

### Compute Layer
- **Move generation to dedicated workers** (Inngest background jobs — infrastructure already exists)
- **Horizontal Next.js servers** behind a load balancer for dashboard/editor
- **Auto-scale workers** based on queue depth

### State Layer
- **Redis-backed SSE**: Replace in-memory `StreamingEventEmitter` with Redis Pub/Sub so SSE works across servers
- **Generation state cache**: Redis hash for hot `PresentationGenerationRun` data to reduce DB polls

### Database Layer
- **Read replicas** for dashboard queries (project lists, template browsing)
- **Connection pooling** via PgBouncer or Prisma Data Proxy
- **Archive old runs**: Move completed generation runs to cold storage after 30 days

### External API Layer
- **Token bucket rate limiter** per user to prevent LLM quota exhaustion
- **Image caching**: Cache Unsplash results by query in Redis (1-hour TTL)
- **CDN for images**: Proxy fetched images through a CDN

---

## Reducing Generation Latency

**Current: ~30-60s → Target: ~15-25s**

| Optimization | Savings | Complexity |
|-------------|---------|-----------|
| Parallel image fetching (Promise.allSettled) | 40-60% of image time | Low |
| Smaller model for simple agents (layout, image queries) | ~30% of those agents | Low |
| Pre-generated outline cache for common topics | Skip Agent 2 | Medium |
| Streaming compilation (per-slide as content arrives) | ~20% compile time | High |

### Quick Win — Parallel Image Fetching
```typescript
// Current: Sequential
for (const slide of slides) { slide.imageUrl = await fetchImage(slide.query); }

// Improved: Parallel
const results = await Promise.allSettled(
  slides.map(s => fetchImage(s.query))
);
```

---

## Cost Analysis

| Agent | Avg Tokens | Cost (Gemini Flash) |
|-------|-----------|-------------------|
| Outline Generator | ~2,000 | ~$0.001 |
| Layout Selector | ~1,000 | ~$0.0005 |
| Content Writer | ~8,000 | ~$0.004 |
| Image Query Gen | ~2,000 | ~$0.001 |
| JSON Compiler | ~8,000 | ~$0.004 |
| **Total/generation** | **~21,000** | **~$0.01** |

**Optimizations**: Tiered models (cheaper for simple agents), outline caching, per-user rate limiting.

---

## Monitoring You'd Add

| Metric | Why |
|--------|-----|
| Generation success rate | Pipeline health |
| Per-agent failure rate | Identify weakest link |
| Per-agent latency (p50/p95/p99) | Spot regressions |
| LLM token usage per agent | Cost tracking |
| Zod validation failure rate | LLM quality early warning |
| Image fetch hit rate | Unsplash API health |

---

## Sample Interview Q&A

### "How would you handle 1000 concurrent generations?"
*"Move generation to dedicated workers via Inngest (infrastructure already exists). Each generation becomes a background job. Dashboard servers are decoupled from compute. Auto-scale workers on queue depth. Token bucket per user to prevent abuse."*

### "What happens if the LLM API goes down?"
*"Three layers: retryWithBackoff (3 retries, exponential backoff), isRecoverableError() classification (only retry 429/503/network), and PresentationGenerationRun records the exact failure step. I'd also add a circuit breaker — 5 consecutive failures → stop for 30s."*

### "How would you add collaborative editing?"
*"CRDT-based state management using Yjs, replacing Zustand. WebSocket server for real-time sync. Yjs awareness protocol for presence (cursors, avatars). Significant 6-8 week effort but the #1 product differentiator."*

---

*Next: [06-code-quality-patterns.md](06-code-quality-patterns.md)*
