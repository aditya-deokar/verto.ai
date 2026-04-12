'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, FileText, Layout, Image, Search, Database, 
  CheckCircle, XCircle, Loader2, ChevronDown, Copy, 
  Check, Sparkles, Brain, Cpu, Wifi, WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StreamEvent } from '@/hooks/useStreamingGeneration'

interface AgenticStreamViewerProps {
  events: StreamEvent[]
  currentTokens: Record<string, string>
  isConnected: boolean
  isConnecting?: boolean
  currentAgentId?: string | null
  error?: string | null
  onRetry?: () => void
  className?: string
}

interface AgentInfo {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

const AGENTS: AgentInfo[] = [
  { id: 'projectInitializer', name: 'Project Setup', description: 'Initializing workspace & theme', icon: <Cpu className="h-4 w-4" />, color: 'text-purple-500' },
  { id: 'outlineGenerator', name: 'Structure', description: 'Creating presentation outline', icon: <FileText className="h-4 w-4" />, color: 'text-blue-500' },
  { id: 'contentWriter', name: 'Content Writing', description: 'Generating slide content', icon: <Brain className="h-4 w-4" />, color: 'text-green-500' },
  { id: 'layoutSelector', name: 'Design Layout', description: 'Selecting optimal layouts', icon: <Layout className="h-4 w-4" />, color: 'text-orange-500' },
  { id: 'imageQueryGenerator', name: 'Visual Search', description: 'Finding perfect images', icon: <Search className="h-4 w-4" />, color: 'text-pink-500' },
  { id: 'imageFetcher', name: 'Image Integration', description: 'Downloading & optimizing', icon: <Image className="h-4 w-4" />, color: 'text-rose-500' },
  { id: 'jsonCompiler', name: 'Assembly', description: 'Compiling final presentation', icon: <Sparkles className="h-4 w-4" />, color: 'text-yellow-500' },
  { id: 'databasePersister', name: 'Finalization', description: 'Saving to database', icon: <Database className="h-4 w-4" />, color: 'text-emerald-500' },
]

export function AgenticStreamViewer({
  events,
  currentTokens,
  isConnected,
  isConnecting,
  currentAgentId,
  error,
  onRetry,
  className,
}: AgenticStreamViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentTokens, events])

  const getAgentStatus = (agentId: string) => {
    if (currentAgentId === agentId) return 'running'
    const hasCompleted = events.some(e => e.type === 'agent_complete' && e.agentId === agentId)
    const hasError = events.some(e => e.type === 'error' && e.agentId === agentId)
    if (hasError) return 'error'
    if (hasCompleted) return 'completed'
    return 'pending'
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activeAgent = currentAgentId ? AGENTS.find(a => a.id === currentAgentId) : null

  return (
    <div className={cn("border rounded-xl bg-gradient-to-b from-background to-muted/20 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 backdrop-blur">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
            </div>
          ) : isConnecting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-blue-500">Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Disconnected</span>
            </div>
          )}
          {activeAgent && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {activeAgent.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {error && onRetry && (
            <button
              onClick={onRetry}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              title="Retry connection"
            >
              <Wifi className="h-4 w-4 text-orange-500" />
            </button>
          )}
          {Object.keys(currentTokens).length > 0 && (
            <button
              onClick={() => copyToClipboard(
                Object.values(currentTokens).join('\n\n'),
                'all'
              )}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              title="Copy all output"
            >
              {copiedId === 'all' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-950/30 border-b text-xs text-orange-700 dark:text-orange-400 flex items-center gap-2">
          <WifiOff className="h-3 w-3" />
          {error} - Falling back to polling
        </div>
      )}

      {/* Terminal-like output */}
      <div ref={scrollRef} className="max-h-96 overflow-y-auto font-mono text-sm">
        <div className="p-4 space-y-3">
          {/* Connection message */}
          {events.length === 0 && isConnecting && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="animate-pulse">●</span>
              Connecting to generation stream...
            </div>
          )}

          {/* Agent status cards */}
          {AGENTS.map((agent, index) => {
            const status = getAgentStatus(agent.id)
            const tokens = currentTokens[agent.id] || ''
            const isActive = currentAgentId === agent.id

            if (status === 'pending' && !tokens) {
              return null
            }

            return (
              <AgentOutputCard
                key={agent.id}
                agent={agent}
                status={status}
                tokens={tokens}
                isActive={isActive}
                onCopy={() => copyToClipboard(tokens, agent.id)}
                copied={copiedId === agent.id}
              />
            )
          })}

          {/* Final completion */}
          {events.some(e => e.type === 'complete') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
            >
              <div className="p-2 bg-green-500/20 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">Generation Complete!</p>
                <p className="text-xs text-green-600 dark:text-green-500">Your presentation is ready</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Running indicator at bottom */}
      {currentAgentId && (
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          <span className="text-xs text-muted-foreground">Processing...</span>
          <div className="flex gap-1 ml-auto">
            {AGENTS.slice(0, 4).map(agent => (
              <div
                key={agent.id}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentAgentId === agent.id 
                    ? "bg-blue-500 scale-125" 
                    : events.some(e => e.type === 'agent_complete' && e.agentId === agent.id)
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">4/8</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface AgentOutputCardProps {
  agent: AgentInfo
  status: 'pending' | 'running' | 'completed' | 'error'
  tokens: string
  isActive: boolean
  onCopy: () => void
  copied: boolean
}

function AgentOutputCard({
  agent,
  status,
  tokens,
  isActive,
  onCopy,
  copied,
}: AgentOutputCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const statusConfig = {
    pending: { icon: null, border: 'border-gray-200 dark:border-gray-700', bg: 'bg-gray-50 dark:bg-gray-900' },
    running: { icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />, border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    completed: { icon: <CheckCircle className="h-4 w-4 text-green-500" />, border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
    error: { icon: <XCircle className="h-4 w-4 text-red-500" />, border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
  }

  const config = statusConfig[status]
  const lines = tokens.split('\n').filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-2 rounded-lg overflow-hidden transition-all",
        config.border,
        isActive && "ring-2 ring-blue-500/20"
      )}
    >
      {/* Agent header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-colors",
          config.bg
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-background/50", agent.color)}>
            {config.icon || agent.icon}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{agent.name}</p>
            <p className="text-xs text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'running' && (
            <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full animate-pulse">
              Working
            </span>
          )}
          {tokens && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCopy()
              }}
              className="p-1.5 hover:bg-muted rounded transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            !isExpanded && "-rotate-90"
          )} />
        </div>
      </button>

      {/* Token output */}
      <AnimatePresence>
        {isExpanded && tokens && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t bg-background"
          >
            <div className="p-3 max-h-48 overflow-y-auto">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2 text-xs py-0.5">
                  <span className="text-muted-foreground select-none w-6 shrink-0">
                    {i + 1}.
                  </span>
                  <span className="text-foreground/80">{line}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AgenticStreamViewer