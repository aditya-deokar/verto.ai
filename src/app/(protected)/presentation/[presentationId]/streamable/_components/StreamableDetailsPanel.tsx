'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2, Edit3, Palette, Layers,
  Clock, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Slide, Theme } from '@/lib/types'

interface StreamableDetailsPanelProps {
  activeSlide: Slide | null
  slides: Slide[]
  isStreaming: boolean
  streamComplete: boolean
  currentTheme: Theme | null
  presentationId: string
  onOpenEditor: () => void
}

export default function StreamableDetailsPanel({
  activeSlide,
  slides,
  isStreaming,
  streamComplete,
  currentTheme,
  presentationId,
  onOpenEditor,
}: StreamableDetailsPanelProps) {
  return (
    <aside className="w-64 xl:w-72 h-full border-l border-white/5 bg-black/40 backdrop-blur-3xl flex-shrink-0 flex flex-col relative z-20">
      {/* Panel header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
          Inspect
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Active slide info */}
          <AnimatePresence mode='wait'>
            {activeSlide && (
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em]">Slide Name</span>
                  <p className="text-sm font-semibold text-white/90 leading-tight">
                    {activeSlide.slideName || 'Untitled Slide'}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em]">Properties</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2 text-[11px] text-white/50">
                        <Sparkles className="h-3 w-3" />
                        <span>Layout</span>
                      </div>
                      <span className="text-[10px] font-mono text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-lg border border-violet-400/20">
                        {activeSlide.type || 'standard'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Engine */}
          <div className="space-y-4 pt-2">
             <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em]">Engine Status</span>
            
             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isStreaming ? (
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                      </div>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                    <span className={cn(
                      "text-[11px] font-bold tracking-wide uppercase",
                      isStreaming ? "text-violet-400" : "text-emerald-400"
                    )}>
                      {isStreaming ? "Synthesizing" : "Operational"}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-white/40">
                    v2.1
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-white/40">Throughput</span>
                   <span className="text-white/80 font-mono">{slides.length} nodes</span>
                </div>
             </div>
          </div>

          {/* Style Configuration */}
          {currentTheme && (
            <div className="space-y-4 pt-2">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em]">Visual Identity</span>
              
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {[currentTheme.accentColor, currentTheme.slideBackgroundColor, currentTheme.fontColor].map((c, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] shadow-xl"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white/90">{currentTheme.name}</span>
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-tighter">System Preset</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <Palette className="h-3 w-3" />
                    <span>Typography</span>
                  </div>
                  <span className="text-[10px] font-medium text-white/70">
                    {currentTheme.fontFamily?.split(',')[0]?.replace(/'/g, '')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Slide Breakdown (Minimalist) */}
          {slides.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em]">Layout Matrix</span>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(slides.map((s) => s.type)))
                  .filter(Boolean)
                  .map((type) => (
                    <div
                      key={type}
                      className="text-[9px] px-2 py-1 font-bold text-white/50 bg-white/[0.04] border border-white/5 rounded-lg uppercase tracking-tight"
                    >
                      {type}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Action (Apple Style) */}
      <AnimatePresence>
        {streamComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 border-t border-white/5 bg-white/[0.01]"
          >
            <Button
              onClick={onOpenEditor}
              className="w-full bg-white text-black hover:bg-white/90 font-bold rounded-2xl h-12 shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all active:scale-95"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Launch Editor
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}
