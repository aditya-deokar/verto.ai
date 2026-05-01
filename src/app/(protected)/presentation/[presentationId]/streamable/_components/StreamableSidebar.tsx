'use client'

import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
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

  useEffect(() => {
    const el = thumbnailRefs.current.get(activeSlideIdx)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeSlideIdx])

  return (
    <aside className="w-56 lg:w-64 h-full border-r border-white/5 bg-black/40 backdrop-blur-3xl flex-shrink-0 flex flex-col relative z-20">
      {/* Sidebar header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Timeline
          </p>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20"
            >
              <span className="w-1 h-1 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,1)]" />
              <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">Live</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Thumbnail list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {slides.map((slide, idx) => {
              const isActive = idx === activeSlideIdx;
              return (
                <motion.div
                  key={slide.id || `slide-${idx}`}
                  ref={(el) => { if (el) thumbnailRefs.current.set(idx, el) }}
                  layout
                  initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: idx * 0.04,
                    duration: 0.5,
                    type: 'spring',
                    stiffness: 120,
                    damping: 20,
                  }}
                  onClick={() => onSelectSlide(idx)}
                  className="group cursor-pointer outline-none relative"
                >
                  <div className={cn(
                    "relative aspect-video rounded-xl overflow-hidden border transition-all duration-500",
                    isActive 
                      ? "border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.2)] ring-1 ring-violet-500/30 scale-[1.02]"
                      : "border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                  )}>
                    {/* Slide preview content */}
                    <div
                      className="w-full h-full relative"
                      style={{
                        backgroundColor: currentTheme?.slideBackgroundColor || '#0a0a0a',
                        color: currentTheme?.fontColor || '#fff',
                      }}
                    >
                      <div
                        className="absolute inset-0 origin-top-left"
                        style={{
                          transform: `scale(${THUMB_SCALE})`,
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
                      
                      {/* Glass Overlay for non-active */}
                      {!isActive && <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />}
                    </div>

                    {/* Badge */}
                    <div className={cn(
                      "absolute top-2 left-2 z-20 px-2 py-0.5 rounded-lg text-[9px] font-bold backdrop-blur-md border transition-all",
                      isActive 
                        ? "bg-violet-500 text-white border-violet-400 shadow-lg shadow-violet-500/40" 
                        : "bg-black/60 text-white/60 border-white/10"
                    )}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Slide name under thumbnail (Apple Style) */}
                  <div className="mt-2 px-1">
                    <p className={cn(
                      "text-[10px] font-medium truncate transition-all duration-300",
                      isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                    )}>
                      {slide.slideName || `Slide ${idx + 1}`}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Premium Skeleton for next incoming slide */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-xl border border-dashed border-violet-500/20 bg-violet-500/[0.02] overflow-hidden flex flex-col items-center justify-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500 blur-xl opacity-20 animate-pulse" />
                <Loader2 className="h-5 w-5 animate-spin text-violet-400 relative z-10" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-violet-400/60 uppercase tracking-widest">Synthesizing</span>
                <div className="flex gap-1">
                   {[0,1,2].map(i => (
                     <motion.div 
                        key={i} 
                        className="w-1 h-1 rounded-full bg-violet-500/30"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                     />
                   ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
