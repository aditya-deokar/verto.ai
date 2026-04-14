# Implementation Plan: Live LLM Response Streaming

## Phase 1: Streaming Infrastructure (Day 1)

### 1.1 Create Event Emitter Utility
**File**: `src/lib/streaming/EventEmitter.ts`

```typescript
// Simple in-memory event emitter for streaming
// Handles subscription and cleanup for SSE connections
```

### 1.2 Create SSE API Endpoint
**File**: `src/app/api/generation/stream/route.ts`

- Endpoint: `GET /api/generation/stream?runId=xxx`
- Uses `ReadableStream` for SSE
- Handles connection lifecycle
- Implements heartbeat for connection health

---

## Phase 2: Agent Integration (Day 2)

### 2.1 Update State Interface
**File**: `src/agentic-workflow-v2/lib/state.ts`

Add optional streamEventHandler to state for event emission.

### 2.2 Update Graph Builder
**File**: `src/agentic-workflow-v2/actions/advanced-genai-graph.ts`

- Pass event emitter to each agent node
- Wrap agent handlers to emit events

### 2.3 Update Agents to Emit Events

#### 2.3.1 outlineGenerator.ts
- Emit `agent_start` on beginning
- Stream each outline as it's generated (if model supports streaming)
- Emit `agent_complete` with full outlines

#### 2.3.2 contentWriter.ts
- Emit slide-by-slide content as it's generated
- Include token counts for each slide

#### 2.3.3 layoutSelector.ts
- Emit layout decisions per slide

#### 2.3.4 imageQueryGenerator.ts
- Emit image queries as they're created

#### 2.3.5 imageFetcher.ts
- Emit image fetch status

---

## Phase 3: Frontend Integration (Day 3)

### 3.1 Create Streaming Hook
**File**: `src/hooks/useStreamingGeneration.ts`

```typescript
interface StreamingState {
  isStreaming: boolean
  events: StreamEvent[]
  currentTokens: Record<string, string>
  error: string | null
}

// Functions:
- connect(runId: string): void
- disconnect(): void
- clear(): void
```

### 3.2 Create Streaming Display Component
**File**: `src/components/global/agentic-workflow/AgenticStreamViewer.tsx`

- Displays real-time tokens
- Expandable agent sections
- Auto-scroll for new content

### 3.3 Update AgenticWorkflowDialog
**File**: `src/components/global/agentic-workflow/AgenticWorkflowDialog.tsx`

- Add streaming viewer component
- Integrate streaming hook
- Show token-by-token display

---

## Phase 4: Testing & Polish (Day 4)

### 4.1 Error Handling
- Handle SSE connection drops
- Implement reconnection logic
- Graceful degradation to polling

### 4.2 Performance
- Debounce frequent events
- Limit stored events in memory
- Clean up completed streams

### 4.3 UI Improvements
- Add copy-to-clipboard for generated content
- Add download raw output option
- Smooth animations for new tokens

---

## File Changes Summary

### New Files (4)
1. `src/lib/streaming/EventEmitter.ts` - Event emitter utility
2. `src/app/api/generation/stream/route.ts` - SSE endpoint
3. `src/hooks/useStreamingGeneration.ts` - Streaming hook
4. `src/components/global/agentic-workflow/AgenticStreamViewer.tsx` - UI component

### Modified Files (7)
1. `src/agentic-workflow-v2/lib/state.ts` - Add stream handler type
2. `src/agentic-workflow-v2/actions/advanced-genai-graph.ts` - Pass event emitter
3. `src/agentic-workflow-v2/agents/outlineGenerator.ts` - Emit events
4. `src/agentic-workflow-v2/agents/contentWriter.ts` - Emit events
5. `src/agentic-workflow-v2/agents/layoutSelector.ts` - Emit events
6. `src/agentic-workflow-v2/agents/imageQueryGenerator.ts` - Emit events
7. `src/components/global/agentic-workflow/AgenticWorkflowDialog.tsx` - Integrate streaming

---

## Testing Checklist

- [ ] SSE connection establishes successfully
- [ ] Events stream in real-time
- [ ] UI updates without lag
- [ ] Connection handles errors gracefully
- [ ] Backward compatibility with polling (fallback)
- [ ] Works with multiple concurrent generations
- [ ] Memory cleanup on completion/disconnect