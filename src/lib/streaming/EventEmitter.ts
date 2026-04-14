// src/lib/streaming/EventEmitter.ts - Event emitter for SSE streaming

export interface StreamEvent {
  type: 'progress' | 'token' | 'agent_start' | 'agent_complete' | 'error' | 'complete'
  agentId?: string
  agentName?: string
  content?: string
  stepId?: string
  progress?: number
  output?: unknown
  message?: string
  projectId?: string
  timestamp: number
}

type EventCallback = (event: StreamEvent) => void

class StreamingEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map()
  private eventHistory: Map<string, StreamEvent[]> = new Map()
  private maxHistorySize = 1000

  subscribe(runId: string, callback: EventCallback): () => void {
    if (!this.listeners.has(runId)) {
      this.listeners.set(runId, new Set())
    }

    this.listeners.get(runId)!.add(callback)

    const existingEvents = this.eventHistory.get(runId) || []
    existingEvents.forEach(event => callback(event))

    return () => {
      const runListeners = this.listeners.get(runId)
      if (runListeners) {
        runListeners.delete(callback)
        if (runListeners.size === 0) {
          this.listeners.delete(runId)
          this.eventHistory.delete(runId)
        }
      }
    }
  }

  emit(runId: string, event: StreamEvent): void {
    const listeners = this.listeners.get(runId)
    if (!listeners) {
      console.log(`[EventEmitter] No listeners for runId: ${runId}, event type: ${event.type}`)
      return
    }

    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    }

    if (!this.eventHistory.has(runId)) {
      this.eventHistory.set(runId, [])
    }

    const history = this.eventHistory.get(runId)!
    history.push(eventWithTimestamp)

    if (history.length > this.maxHistorySize) {
      history.shift()
    }

    console.log(`[EventEmitter] Emitting to ${listeners.size} listeners: ${event.type} for ${event.agentId || event.stepId}`)
    listeners.forEach(callback => callback(eventWithTimestamp))
  }

  emitAgentStart(runId: string, agentId: string, agentName: string): void {
    this.emit(runId, {
      type: 'agent_start',
      agentId,
      agentName,
      timestamp: Date.now(),
    })
  }

  emitToken(runId: string, agentId: string, content: string): void {
    this.emit(runId, {
      type: 'token',
      agentId,
      content,
      timestamp: Date.now(),
    })
  }

  emitProgress(runId: string, stepId: string, progress: number): void {
    this.emit(runId, {
      type: 'progress',
      stepId,
      progress,
      timestamp: Date.now(),
    })
  }

  emitAgentComplete(runId: string, agentId: string, output: unknown): void {
    this.emit(runId, {
      type: 'agent_complete',
      agentId,
      output,
      timestamp: Date.now(),
    })
  }

  emitError(runId: string, message: string): void {
    this.emit(runId, {
      type: 'error',
      message,
      timestamp: Date.now(),
    })
  }

  emitComplete(runId: string, projectId: string): void {
    this.emit(runId, {
      type: 'complete',
      projectId,
      timestamp: Date.now(),
    })
  }

  getHistory(runId: string): StreamEvent[] {
    return this.eventHistory.get(runId) || []
  }

  clearHistory(runId: string): void {
    this.eventHistory.delete(runId)
    this.listeners.delete(runId)
  }
}

const g = global as any
if (!g._streamingEmitter) {
  g._streamingEmitter = new StreamingEventEmitter()
}
export const streamingEmitter: StreamingEventEmitter = g._streamingEmitter