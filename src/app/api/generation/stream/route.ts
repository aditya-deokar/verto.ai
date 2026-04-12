// src/app/api/generation/stream/route.ts - SSE endpoint for streaming LLM responses

import { NextRequest } from 'next/server'
import { streamingEmitter, type StreamEvent } from '@/lib/streaming/EventEmitter'

export const dynamic = 'force-dynamic'

function formatSSEEvent(event: StreamEvent): string {
  const data = JSON.stringify(event)
  return `data: ${data}\n\n`
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const runId = searchParams.get('runId')

  if (!runId) {
    return new Response('Missing runId parameter', { status: 400 })
  }

  console.log(`[SSE] Client connected for runId: ${runId}`)

  let heartbeatInterval: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const sendEvent = (event: StreamEvent) => {
        try {
          const data = formatSSEEvent(event)
          controller.enqueue(encoder.encode(data))
        } catch (err) {
          console.error('[SSE] Error sending event:', err)
        }
      }

      // Send initial connection event
      sendEvent({
        type: 'progress',
        stepId: 'connecting',
        progress: 0,
        message: 'Connected to stream',
        timestamp: Date.now(),
      })

      // Send existing events from history
      const history = streamingEmitter.getHistory(runId)
      if (history.length > 0) {
        console.log(`[SSE] Sending ${history.length} historical events`)
        history.forEach(event => sendEvent(event))
      }

      let isConnected = true

      const unsubscribe = streamingEmitter.subscribe(runId, (event) => {
        if (!isConnected) return
        console.log(`[SSE] Sending event: ${event.type} for ${event.agentId || event.stepId}`)
        sendEvent(event)
      })

      console.log(`[SSE] Subscribed to events for runId: ${runId}`)

      // More frequent heartbeat to keep connection alive
      heartbeatInterval = setInterval(() => {
        if (!isConnected) {
          if (heartbeatInterval) clearInterval(heartbeatInterval)
          return
        }
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval)
        }
      }, 5000)

      // Keep connection alive with frequent comments
      const keepAliveInterval = setInterval(() => {
        if (!isConnected) {
          clearInterval(keepAliveInterval)
          return
        }
        try {
          controller.enqueue(encoder.encode('\n'))
        } catch {
          clearInterval(keepAliveInterval)
        }
      }, 2000)

      request.signal.addEventListener('abort', () => {
        isConnected = false
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        clearInterval(keepAliveInterval)
        unsubscribe()
        console.log(`[SSE] Client disconnected for runId: ${runId}`)
        try {
          controller.close()
        } catch {
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Keep-Alive': 'timeout=120, max=1',
    },
  })
}