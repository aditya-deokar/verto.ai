'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Edit3, Play, Sparkles, CheckCircle2,
  Radio, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamableHeaderProps {
  isStreaming: boolean
  streamComplete: boolean
  streamStatus: string
  streamProgress: number
  slideCount: number
  activeSlideIdx: number
  presentationId: string
  onBack: () => void
  onOpenEditor: () => void
}

export default function StreamableHeader({
  isStreaming,
  streamComplete,
  streamStatus,
  streamProgress,
  slideCount,
  activeSlideIdx,
  presentationId,
  onBack,
  onOpenEditor,
}: StreamableHeaderProps) {
  return (
    <header className="h-14 flex-shrink-0 border-b border-white/5 flex items-center px-6 gap-6 bg-black/20 backdrop-blur-3xl z-50 relative overflow-hidden">
      {/* Dynamic Background Glow during streaming */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"
          />
        )}
      </AnimatePresence>

      {/* Brand & Back */}
      <div className="flex items-center gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:bg-white/5 rounded-full h-8 w-8 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
             <Sparkles className="h-3 w-3 text-white" />
           </div>
           <span className="text-xs font-bold tracking-tighter text-white/90">Verto AI</span>
        </div>
      </div>

      <div className="h-4 w-px bg-white/5" />

      {/* Engine Status (Apple Style) */}
      <div className="flex-1 flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {isStreaming ? (
              <div className="flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
              </div>
            ) : (
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            )}
          </div>
          
          <motion.p
            key={streamStatus}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest truncate",
              isStreaming ? "text-violet-400" : "text-emerald-400/80"
            )}
          >
            {isStreaming ? streamStatus : "Ready for Presentation"}
          </motion.p>
        </div>

        {/* Header Progress Bar (Minimalist) */}
        {(isStreaming || (streamComplete && streamProgress < 100)) && (
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: 0 }}
                animate={{ width: `${streamProgress}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/30 w-8">{streamProgress}%</span>
          </div>
        )}
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {streamComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              size="sm"
              onClick={onOpenEditor}
              className="bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 rounded-full h-8 px-4 text-[11px] font-bold transition-all active:scale-95"
            >
              <Edit3 className="h-3 w-3 mr-1.5 opacity-50" />
              Edit Slides
            </Button>
          </motion.div>
        )}
        
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-full h-8 px-4 text-[11px] font-bold shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all active:scale-95"
        >
          <Play className="h-3 w-3 mr-1.5" />
          Present
        </Button>
      </div>
    </header>
  )
}
