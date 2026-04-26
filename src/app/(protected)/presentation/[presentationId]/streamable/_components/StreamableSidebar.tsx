'use client'

import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles } from 'lucide-react'
import { Slide, Theme } from '@/lib/types'
import { MasterRecursiveComponent } from '../../_components/editor/MasterRecursiveComponent'

// Canvas constants
const SLIDE_WIDTH = 1280
const SLIDE_HEIGHT = 720
const THUMB_SCALE = 0.12

interface StreamableSidebarProps {
  slides: Slide[]
  activeSlideIdx: number
  isStreaming: boolean
  currentTheme: Theme | null
  onSelectSlide: (idx: number) => void
}

export default function StreamableSidebar({
  slides,
  activeSlideIdx,
  isStreaming,
  currentTheme,
  onSelectSlide,
}: StreamableSidebarProps) {
  const thumbnailRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Auto-scroll to the latest slide during streaming
  useEffect(() => {
    const el = thumbnailRefs.current.get(activeSlideIdx)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeSlideIdx])

  return (
    <aside className="w-52 lg:w-60 border-r border-border/40 bg-muted/20 backdrop-blur-sm flex-shrink-0 hidden md:flex flex-col">
      {/* Sidebar header */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
            Slides
          </p>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[10px] text-violet-500 font-medium">Live</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Thumbnail list */}
      <ScrollArea className="flex-1">
        <div className="p-2.5 space-y-2">
          <AnimatePresence mode="popLayout">
            {slides.map((slide, idx) => (
              <motion.div
                key={slide.id || `slide-${idx}`}
                ref={(el) => { if (el) thumbnailRefs.current.set(idx, el) }}
                layout
                initial={{ opacity: 0, x: -24, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, scale: 0.9 }}
                transition={{
                  delay: idx * 0.06,
                  duration: 0.4,
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
                onClick={() => onSelectSlide(idx)}
                className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 group ${
                  idx === activeSlideIdx
                    ? 'border-violet-500 shadow-lg shadow-violet-500/15 ring-1 ring-violet-500/30'
                    : 'border-transparent hover:border-border/60 hover:shadow-md'
                }`}
              >
                {/* Slide number badge */}
                <div className="relative">
                  <div
                    className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold backdrop-blur-md"
                    style={{
                      backgroundColor: idx === activeSlideIdx
                        ? 'rgba(139,92,246,0.9)'
                        : 'rgba(0,0,0,0.5)',
                      color: '#fff',
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Mini slide preview */}
                  <div
                    className="aspect-video w-full relative overflow-hidden"
                    style={{
                      backgroundColor: currentTheme?.slideBackgroundColor || '#fff',
                      color: currentTheme?.fontColor || '#000',
                    }}
                  >
                    <div
                      className="absolute inset-0 p-1"
                      style={{
                        transform: `scale(${THUMB_SCALE})`,
                        transformOrigin: 'top left',
                        width: SLIDE_WIDTH,
                        height: SLIDE_HEIGHT,
                      }}
                    >
                      <MasterRecursiveComponent
                        content={slide.content}
                        isPreview={true}
                        slideId={slide.id}
                        isEditable={false}
                        onContentChange={() => {}}
                      />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
                  </div>
                </div>

                {/* Slide name */}
                <div className={`px-2.5 py-1.5 transition-colors duration-200 ${
                  idx === activeSlideIdx ? 'bg-violet-500/5' : 'bg-background'
                }`}>
                  <p className="text-[10px] font-medium truncate text-muted-foreground group-hover:text-foreground transition-colors">
                    {slide.slideName || `Slide ${idx + 1}`}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Skeleton for next incoming slide */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-video w-full rounded-xl border-2 border-dashed border-violet-500/30 flex flex-col items-center justify-center bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 overflow-hidden"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 25%, rgba(139,92,246,0.08) 50%, transparent 75%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['100% 0%', '-100% 0%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />

              <div className="relative flex flex-col items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin text-violet-500/60" />
                <span className="text-[9px] text-violet-500/60 font-medium">Building...</span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
