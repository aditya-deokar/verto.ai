'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type StreamEventType = 
  | 'progress' 
  | 'token' 
  | 'agent_start' 
  | 'agent_complete' 
  | 'error' 
  | 'complete'

export interface StreamEvent {
  type: StreamEventType
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

interface UseStreamingGenerationReturn {
  isConnected: boolean
  isConnecting: boolean
  events: StreamEvent[]
  currentTokens: Record<string, string>
  currentAgentId: string | null
  error: string | null
  connect: (runId: string) => void
  disconnect: () => void
  clear: () => void
}

export function useStreamingGeneration(): UseStreamingGenerationReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [currentTokens, setCurrentTokens] = useState<Record<string, string>>({})
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const currentRunIdRef = useRef<string | null>(null)

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  const clear = useCallback(() => {
    setEvents([])
    setCurrentTokens({})
    setCurrentAgentId(null)
    setError(null)
  }, [])

  const connect = useCallback((runId: string) => {
    if (eventSourceRef.current && currentRunIdRef.current === runId && isConnected) {
      return
    }
    
    disconnect()
    clear()
    setError(null)
    setIsConnecting(true)
    currentRunIdRef.current = runId

    const url = `/api/generation/stream?runId=${encodeURIComponent(runId)}`
    console.log('[useStreaming] Connecting to:', url)
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('[useStreaming] Connection opened')
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data)
        console.log('[useStreaming] Received event:', data.type, data.agentId || data.stepId)
        
        setEvents(prev => [...prev.slice(-499), data])

        if (data.type === 'agent_start' && data.agentId) {
          setCurrentAgentId(data.agentId)
        }

        if (data.type === 'agent_complete' && data.agentId) {
          setCurrentAgentId(null)
        }

        if (data.type === 'token' && data.agentId && data.content) {
          setCurrentTokens(prev => ({
            ...prev,
            [data.agentId!]: (prev[data.agentId!] || '') + data.content,
          }))
        }

        if (data.type === 'agent_complete') {
          // Intentionally keeping the tokens in state so the UI can display them even after completion.
        }

        if (data.type === 'error') {
          setError(data.message || 'Streaming error')
        }
      } catch (err) {
        console.error('[useStreaming] Failed to parse event:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[useStreaming] SSE error:', err)
      setIsConnected(false)
      setIsConnecting(false)
      setError('Connection lost. Retrying...')
      
      eventSource.close()
      eventSourceRef.current = null
      
      setTimeout(() => {
        if (currentRunIdRef.current) {
          console.log('[useStreaming] Retrying connection...')
          connect(currentRunIdRef.current)
        }
      }, 2000)
    }
  }, [disconnect, clear, isConnected])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return {
    isConnected,
    isConnecting,
    events,
    currentTokens,
    currentAgentId,
    error,
    connect,
    disconnect,
    clear,
  }
}