'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Edit3, Play, Sparkles, CheckCircle2,
  Radio, Loader2,
} from 'lucide-react'

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
    <header className="h-16 flex-shrink-0 border-b border-border/50 flex items-center px-5 gap-4 bg-background/70 backdrop-blur-xl z-50 relative overflow-hidden">
      {/* Subtle shimmer line at bottom during streaming */}
      {isStreaming && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, #8b5cf6, #d946ef, transparent)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="shrink-0 hover:bg-muted/60 rounded-xl h-9 w-9"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Status area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <AnimatePresence mode="wait">
            {isStreaming ? (
              <motion.div
                key="streaming-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" />
                <div className="relative p-1.5 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500">
                  <Radio className="h-3.5 w-3.5 text-white" />
                </div>
              </motion.div>
            ) : streamComplete ? (
              <motion.div
                key="complete-icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <div className="p-1.5 rounded-full bg-gradient-to-br from-emerald-500 to-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className="p-1.5 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                  <Play className="h-3.5 w-3.5 text-violet-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="min-w-0">
            <motion.h1
              key={streamStatus}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold truncate"
            >
              {isStreaming
                ? streamStatus
                : streamComplete
                  ? 'Presentation Complete'
                  : 'Live Slide Builder'}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {(isStreaming || streamComplete) && (
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="w-36 h-2 bg-muted/80 rounded-full overflow-hidden relative">
            {/* Shimmer backdrop */}
            {isStreaming && (
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['100% 0%', '-100% 0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: streamComplete
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #8b5cf6, #d946ef)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${streamProgress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
          <span className="text-xs font-mono text-muted-foreground tabular-nums w-8 text-right">
            {streamProgress}%
          </span>
        </div>
      )}

      {/* Slide counter badge */}
      <Badge
        variant="outline"
        className="shrink-0 font-mono text-xs px-2.5 py-1 rounded-lg border-border/60"
      >
        {slideCount > 0 ? (
          <>
            <span className="text-foreground">{activeSlideIdx + 1}</span>
            <span className="text-muted-foreground mx-0.5">/</span>
            <span className="text-muted-foreground">{slideCount}</span>
          </>
        ) : (
          <span className="text-muted-foreground">–</span>
        )}
      </Badge>

      {/* Edit CTA */}
      <AnimatePresence>
        {streamComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Button
              size="sm"
              onClick={onOpenEditor}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 px-4"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" />
              Open Editor
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
