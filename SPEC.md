# Live LLM Response Streaming Feature Specification

## 1. Project Overview

**Project**: PPTMaker - AI-Powered Presentation Generator  
**Feature**: Live LLM Response Streaming  
**Goal**: Stream real-time LLM outputs to the UI during presentation generation so users can see AI responses as they're being generated, not just step completion status.

## 2. Architecture Analysis

### Current System
- **Flow**: User clicks generate → Server Action invokes LangGraph workflow → Agents run sequentially → Progress polled every 1 second
- **Progress Tracking**: Database-based (`presentationGenerationRun` table) with step-level status (pending/running/completed/error)
- **Current UI Feedback**: Only shows step names and progress percentage

### Problem
- Users cannot see the actual AI responses
- No visibility into what's being generated (outlines, content, etc.)
- Polling-based updates are inefficient

## 3. Data Flow Design

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  Server Action   │────▶│  LangGraph      │
│  (Client)   │◀────│  + SSE Endpoint  │◀────│  Workflow       │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │                         │
                           ▼                         ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │  Streaming Queue │◀────│  LLM Agents     │
                    │  (In-memory/Redis)│     │  (emit events)  │
                    └──────────────────┘     └─────────────────┘
```

## 4. Technical Requirements

### 4.1 Streaming Protocol
- Use Server-Sent Events (SSE) for streaming (simpler than WebSockets, works over HTTP)
- Endpoint: `/api/generation/stream?runId=xxx`

### 4.2 Event Types
```typescript
type StreamEvent = 
  | { type: 'progress'; stepId: string; progress: number }
  | { type: 'token'; agentId: string; content: string }
  | { type: 'agent_start'; agentId: string; agentName: string }
  | { type: 'agent_complete'; agentId: string; output: any }
  | { type: 'error'; message: string }
  | { type: 'complete'; projectId: string }
```

### 4.3 LLM Agents to Stream
1. **outlineGenerator**: Stream generated outlines
2. **contentWriter**: Stream slide content being written
3. **layoutSelector**: Stream layout selections
4. **imageQueryGenerator**: Stream image queries
5. **imageFetcher**: Stream image search results

## 5. Component Design

### 5.1 New Backend Components
- `src/app/api/generation/stream/route.ts` - SSE endpoint
- `src/lib/streaming/EventEmitter.ts` - In-memory event emitter
- Update agents to emit events during execution

### 5.2 Updated Frontend Components
- `useStreamingGeneration.ts` - New hook for SSE streaming
- Update `AgenticWorkflowDialog.tsx` to display streamed content
- Add token display area in progress tracker

## 6. UI/UX Design

### 6.1 Streaming Display
- Expandable sections for each agent showing real-time output
- Token-by-token display for LLM responses
- Collapsible for cleaner UI
- Real-time token counter

### 6.2 Visual Layout
```
┌─────────────────────────────────────────────┐
│  Creating Presentation: "AI in Education" │
├─────────────────────────────────────────────┤
│  ████████░░░░░░░ 45%                        │
├─────────────────────────────────────────────┤
│  ▼ Project Setup              [Completed]   │
│  ▼ Structure (outlineGenerator) [Running]  │
│     "Analyzing topic complexity..."         │
│     "Generated 10 slide topics:"            │
│     "  1. Introduction to AI in Education"  │
│     "  2. Current Challenges..."            │
│  ▼ Content Writing                          │
│  ▼ Design Layout                            │
│  ▼ Visual Search                            │
│  ▼ Image Integration                       │
│  ▼ Assembly                                │
│  ▼ Finalization                             │
└─────────────────────────────────────────────┘
```

## 7. Implementation Phases

### Phase 1: Infrastructure
- Create SSE streaming endpoint
- Create event emitter utility

### Phase 2: Agent Integration
- Update each agent to emit events
- Add event emission to LLM calls

### Phase 3: Frontend Integration
- Create streaming hook
- Update UI components

### Phase 4: Testing & Polish
- Error handling
- UI improvements
- Performance optimization

## 8. Acceptance Criteria

1. Users can see real-time LLM responses during generation
2. Streaming works seamlessly without blocking generation
3. UI remains responsive during streaming
4. Falls back gracefully if streaming fails
5. Maintains backward compatibility with existing progress tracking