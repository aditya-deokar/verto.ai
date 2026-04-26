'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2, Edit3, Palette, Layers,
  Clock, Sparkles,
} from 'lucide-react'
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
    <aside className="w-64 xl:w-72 border-l border-border/40 bg-muted/10 backdrop-blur-sm flex-shrink-0 hidden lg:flex flex-col">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border/40">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
          Details
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Active slide info */}
          {activeSlide && (
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Layers className="h-3 w-3" />
                  <span>Slide Name</span>
                </div>
                <p className="font-semibold text-sm leading-snug">
                  {activeSlide.slideName || '—'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  <span>Layout Type</span>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs font-mono rounded-md"
                >
                  {activeSlide.type || '—'}
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Generation status */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <Clock className="h-3 w-3" />
              <span>Generation</span>
            </div>

            <div className="flex items-center gap-2.5">
              {isStreaming ? (
                <>
                  <div className="relative">
                    <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500/30 animate-ping" />
                    <span className="relative w-2.5 h-2.5 rounded-full bg-green-500 block" />
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Streaming live
                  </span>
                </>
              ) : streamComplete ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Complete
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Idle</span>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {slides.length} slide{slides.length !== 1 ? 's' : ''} generated
            </div>

            {/* Slide type breakdown */}
            {slides.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">
                  Layout breakdown
                </p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(slides.map((s) => s.type)))
                    .filter(Boolean)
                    .map((type) => (
                      <Badge
                        key={type}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0.5 font-mono rounded"
                      >
                        {type}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme info */}
          {currentTheme && (
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                <Palette className="h-3 w-3" />
                <span>Theme</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: currentTheme.accentColor }}
                  />
                  <div
                    className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: currentTheme.slideBackgroundColor }}
                  />
                  <div
                    className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: currentTheme.fontColor }}
                  />
                </div>
                <span className="text-xs font-medium">{currentTheme.name}</span>
              </div>

              <div className="text-[10px] text-muted-foreground font-mono">
                {currentTheme.fontFamily?.split(',')[0]?.replace(/'/g, '')}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom CTA */}
      {streamComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, type: 'spring' }}
          className="p-4 border-t border-border/40"
        >
          <Button
            onClick={onOpenEditor}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/15 h-11"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Open in Editor
          </Button>
        </motion.div>
      )}
    </aside>
  )
}
