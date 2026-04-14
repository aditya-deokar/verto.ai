# ADR-004: Server-Sent Events for Real-Time Progress

**Status**: Accepted  
**Date**: 2024  
**Decision Makers**: Core team

---

## Context

AI presentation generation takes 20-60 seconds across 8 agents. Users need real-time feedback about which agent is running, current progress percentage, and streaming text output. We needed a mechanism to push server-side events to the client during generation.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **SSE (Server-Sent Events)** | Unidirectional server-to-client stream | Simple API, auto-reconnect, HTTP-native, no WebSocket overhead | Unidirectional only, limited concurrent connections |
| **WebSocket** | Full-duplex communication | Bidirectional, real-time | Overkill for one-way events, complex setup, connection management |
| **Long Polling** | Repeated HTTP requests | Simple, works everywhere | Higher latency, more server load, not truly real-time |
| **Database polling** | Client polls generation run record | Simple, stateless, survives disconnects | 1s+ latency, more DB queries, not real-time |
| **Vercel AI SDK streaming** | Built-in streaming for AI responses | Good for chat, integrated with AI SDK | Designed for single LLM calls, not multi-agent pipelines |

## Decision

**Use SSE** for real-time streaming, **combined with database polling** as a complementary fallback.

## Rationale

1. **Perfect fit for the use case**: Generation progress is unidirectional (server → client). SSE's one-way stream is exactly what we need — WebSocket's bidirectionality would be unused complexity.

2. **Built-in reconnection**: `EventSource` API automatically reconnects on connection loss, and our `StreamingEventEmitter` replays event history to newly connected clients.

3. **HTTP-native**: SSE uses standard HTTP responses, so it works through proxies, load balancers, and CDNs without special WebSocket upgrade handling.

4. **Database polling as backup**: The `PresentationGenerationRun` table records real progress. If SSE disconnects, the client can still poll the database for current status. This dual approach means progress is never lost.

5. **Singleton event emitter**: `streamingEmitter` is a singleton class that manages subscriptions per `runId`, ensuring events are only emitted to relevant clients.

## Consequences

### Positive
- Real-time progress updates with sub-100ms latency
- Event history replay on reconnect (up to 1,000 events)
- No additional infrastructure (no WebSocket server, no Redis pub/sub)
- Database-persisted progress survives page refresh even without SSE

### Negative
- SSE has a browser limit of ~6 concurrent connections per domain (HTTP/1.1)
- Serverless environments (Vercel) may have connection duration limits
- Two progress systems (SSE + DB polling) to maintain

### Architecture

```
Agent Execution → StreamingEventEmitter → SSE Endpoint → Browser EventSource
                                        ↕
Agent Execution → PresentationGenerationRun → DB Polling → useAgenticGenerationV2
```

The client uses `useAgenticGenerationV2` (DB polling every 1s) as the primary progress source, with `useStreamingGeneration` (SSE) providing real-time enhancement for token streaming and instant agent transitions.

## References

- `src/lib/streaming/EventEmitter.ts` — Singleton emitter
- `src/app/api/generation/stream/route.ts` — SSE endpoint
- `src/hooks/useStreamingGeneration.ts` — Client SSE hook
- `src/hooks/useAgenticGenerationV2.ts` — DB polling hook
