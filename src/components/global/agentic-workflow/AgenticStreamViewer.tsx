'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, Loader2, Copy, Check, Terminal, Network, Zap,
  Cpu, FileText, Brain, Layout, Search, Image as ImageIcon, Sparkles, Database
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

const AGENTS_META = [
  { id: 'projectInitializer', name: 'Project Setup', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'outlineGenerator', name: 'Structure Engine', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'contentWriter', name: 'Content Synthesis', icon: Brain, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { id: 'layoutSelector', name: 'Layout Intelligence', icon: Layout, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'imageQueryGenerator', name: 'Visual Search', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { id: 'imageFetcher', name: 'Asset Integration', icon: ImageIcon, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { id: 'jsonCompiler', name: 'JSON Compiler', icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'databasePersister', name: 'Database Committer', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
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
  
  // Auto-scroll to bottom smoothly
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [currentTokens, events])

  return (
    <div className={cn("flex flex-col h-full rounded-2xl border border-border/50 bg-background/40 backdrop-blur-md overflow-hidden shadow-inner", className)}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
            AI Execution Telemetry
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/20" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/20" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/20" />
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth">
        
        <AnimatePresence initial={false}>
          {events.length === 0 && isConnecting && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex items-center gap-3 text-blue-400 font-mono text-sm mb-6"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Establishing secure neural link...</span>
            </motion.div>
          )}

          {/* Render agents strictly in order of their execution sequence to prevent messy UI jumping */}
          {AGENTS_META.map((agent) => {
            const tokens = currentTokens[agent.id]
            const hasStarted = events.some(e => e.agentId === agent.id || e.stepId === agent.id) || tokens !== undefined
            const isActive = currentAgentId === agent.id

            if (!hasStarted && !isActive) return null

            const AgentIcon = agent.icon

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-8 relative"
              >
                {/* Connecting Line (if multiple agents) */}
                <div className="absolute left-4 top-10 bottom-[-32px] w-[1px] bg-gradient-to-b from-border to-transparent" />

                <div className="flex gap-4">
                  {/* Agent Icon Avatar */}
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border",
                      agent.bg, agent.border,
                      isActive && "shadow-[0_0_15px_-3px] shadow-current transition-shadow duration-500"
                    )}>
                      <AgentIcon className={cn("h-4 w-4", agent.color)} />
                    </div>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-blue-400" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                      </span>
                    )}
                  </div>

                  {/* Agent Content Block */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "font-mono text-xs font-bold uppercase tracking-widest",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {agent.name}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono text-blue-400 animate-pulse bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                          PROCESSING
                        </span>
                      )}
                    </div>

                    {/* Format tokens as premium markdown-like text instead of ugly numbered lines */}
                    <div className="relative mt-2">
                      <div className={cn(
                        "text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words rounded-xl",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {tokens || (isActive ? "Initializing module..." : "Process completed.")}
                        
                        {isActive && (
                          <motion.span 
                            animate={{ opacity: [1, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }} 
                            className={cn("inline-block w-2 h-3.5 ml-1 align-middle", agent.bg.replace('/10', ''))}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {events.some(e => e.type === 'complete') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 ml-12 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1 max-w-sm"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-mono text-sm font-bold uppercase tracking-wider">Sequence Terminated</span>
              </div>
              <span className="text-emerald-400/60 block text-xs font-mono ml-7">All processes disconnected safely. Output verified.</span>
            </motion.div>
          )}

          {error && (
            <motion.div
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="mt-8 ml-12 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-sm max-w-sm shadow-xl shadow-red-500/10"
            >
              <span className="font-bold flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4" /> FATAL_ERROR 
              </span>
              <p className="text-xs text-red-300/80 mb-3">{error}</p>
              {onRetry && (
                <button onClick={onRetry} className="text-xs bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-1.5 rounded-lg border border-red-500/30 transition-colors">
                  RETRY_CONNECTION
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}