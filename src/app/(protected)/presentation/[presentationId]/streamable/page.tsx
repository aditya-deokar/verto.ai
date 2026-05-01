'use client'

// ─────────────────────────────────────────────────────
// Streamable Viewer Page — Phase 5
//
// The immersive full-screen viewer where users watch
// their slides build in real-time via SSE streaming.
//
// Composed of modular sub-components:
//   • StreamableHeader    — progress bar, status, CTA
//   • StreamableSidebar   — thumbnail rail
//   • StreamableSlidePreview — main slide canvas
//   • StreamableDetailsPanel — right details sidebar
// ─────────────────────────────────────────────────────

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSlideStore } from '@/store/useSlideStore'
import { themes } from '@/lib/constants'
import { getProjectById } from '@/actions/projects'
import { patchStreamableImages } from '@/actions/streamable-generation'
import { toast } from 'sonner'
import { Slide } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import StreamableHeader from './_components/StreamableHeader'
import StreamableSidebar from './_components/StreamableSidebar'
import StreamableSlidePreview from './_components/StreamableSlidePreview'
import StreamableDetailsPanel from './_components/StreamableDetailsPanel'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { PanelLeft, PanelRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TransformWrapper, TransformComponent, useControls, useTransformContext } from "react-zoom-pan-pinch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Canvas Constants ───
const SLIDE_WIDTH = 1280
const SLIDE_HEIGHT = 720

const ZoomControls = ({ autoFitScale }: { autoFitScale: number }) => {
  const { zoomIn, zoomOut, centerView } = useControls();
  const { transformState } = useTransformContext();
  const currentScale = Math.round(transformState.scale * 100);

  return (
    <div className="absolute top-3 right-3 lg:top-auto lg:bottom-6 lg:right-6 z-50 flex items-center gap-1 bg-black/80 backdrop-blur-xl border border-white/10 p-1 rounded-full shadow-2xl scale-90 sm:scale-100">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
        onClick={() => zoomOut(0.2)}
      >
        <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="px-1.5 sm:px-2 min-w-[40px] sm:min-w-[50px] text-center text-[10px] sm:text-xs font-medium text-white/90 cursor-pointer select-none hover:text-white"
            title="Change zoom level"
          >
            {currentScale}%
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="w-32 bg-black/90 border-white/10 text-white backdrop-blur-xl">
          {[25, 50, 75, 100, 150, 200].map(preset => (
            <DropdownMenuItem 
              key={preset} 
              onClick={() => {
                  const newScale = preset / 100;
                  centerView(newScale);
              }} 
              className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
            >
              {preset}%
            </DropdownMenuItem>
          ))}
          <div className="h-px w-full bg-white/10 my-1" />
          <DropdownMenuItem 
            onClick={() => centerView(autoFitScale)} 
            className="cursor-pointer hover:bg-white/10 focus:bg-white/10 text-primary"
          >
            Fit to screen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
        onClick={() => zoomIn(0.2)}
      >
        <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
      <div className="w-px h-3 sm:h-4 bg-white/10 mx-0.5 sm:mx-1" />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
        onClick={() => centerView(autoFitScale)}
        title="Auto-fit"
      >
        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
    </div>
  )
}

export default function StreamableViewerPage() {
  const params = useParams()
  const router = useRouter()
  const presentationId = params.presentationId as string

  const {
    currentTheme, setCurrentTheme, setProject, setSlides,
  } = useSlideStore()

  const [isLoading, setIsLoading] = useState(true)
  const [localSlides, setLocalSlides] = useState<Slide[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isResolvingImages, setIsResolvingImages] = useState(false)
  const [streamStatus, setStreamStatus] = useState('')
  const [streamProgress, setStreamProgress] = useState(0)
  const [streamComplete, setStreamComplete] = useState(false)
  const [autoFitScale, setAutoFitScale] = useState(0)
  const [activeSlideIdx, setActiveSlideIdx] = useState(0)
  const [isSidebarsOpen, setIsSidebarsOpen] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)

  // ─── Load project from DB ───
  useEffect(() => {
    ;(async () => {
      try {
        const res = await getProjectById(presentationId)
        if (res?.status !== 200 || !res.data) {
          toast.error('Could not load project')
          router.push('/dashboard')
          return
        }

        const findTheme = themes.find((t) => t.name === res.data.themeName)
        setCurrentTheme(findTheme || themes[0])
        setProject(res.data)

        const projectSlides = res.data.slides
          ? JSON.parse(JSON.stringify(res.data.slides))
          : []

        if (projectSlides.length > 0) {
          setLocalSlides(projectSlides)
          setSlides(projectSlides)
          setStreamComplete(true)
        } else {
          const searchParams = new URLSearchParams(window.location.search)
          const topic = searchParams.get('topic')
          const theme = searchParams.get('theme')
          const context = searchParams.get('context')

          if (topic) {
            startStreaming(topic, theme || 'Default', context || undefined)
          }
        }
      } catch {
        toast.error('Failed to load project')
      } finally {
        setIsLoading(false)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentationId])

  // ─── Auto-scale slide canvas ───
  const computeScale = useCallback(() => {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    const padX = width < 640 ? 32 : 100
    const padY = height < 500 ? 32 : 100
    const availableW = width - padX * 2;
    const availableH = height - padY * 2;
    const sW = availableW / SLIDE_WIDTH
    const sH = availableH / SLIDE_HEIGHT
    setAutoFitScale(Math.max(0.1, Math.min(sW, sH, 1)))
  }, [])

  useEffect(() => {
    computeScale()
    const observer = new ResizeObserver(computeScale)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [computeScale, isSidebarsOpen])

  // ─── Keyboard navigation ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSlideIdx((i) => Math.max(0, i - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        setActiveSlideIdx((i) => Math.min(orderedSlides.length - 1, i + 1))
      } else if (e.key === 'b') {
        setIsSidebarsOpen(s => !s)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  // ─── SSE Streaming ───
  const startStreaming = async (topic: string, theme: string, context?: string) => {
    setIsStreaming(true)
    setStreamProgress(0)
    setStreamStatus('Starting AI generation...')

    try {
      const response = await fetch('/api/generation/streamable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, theme, context, projectId: presentationId }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Stream failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (!line.startsWith('data: ')) continue
            try {
              const event = JSON.parse(line.slice(6))

              if (event.type === 'slide' && event.data) {
                setLocalSlides((prev) => {
                  const exists = prev.some((s) => s.slideOrder === event.data.slideOrder)
                  if (exists) return prev
                  const next = [...prev, event.data as Slide]
                  setActiveSlideIdx(next.length - 1)
                  return next
                })
                if (event.progress) setStreamProgress(event.progress)
              }
              if (event.type === 'progress') {
                setStreamStatus(event.message || '')
                if (event.progress) setStreamProgress(event.progress)
              }
              if (event.type === 'complete') {
                setIsStreaming(false)
                setStreamProgress(95)
                setStreamStatus('Resolving images...')
                setIsResolvingImages(true)

                try {
                  const patchResult = await patchStreamableImages(presentationId)
                  if (patchResult.status === 200 && patchResult.data) {
                    console.log(`[Streamable] Image patch: ${patchResult.data.message}`)
                  }
                } catch (patchErr) {
                  console.warn('[Streamable] Image patching failed (non-fatal):', patchErr)
                }

                setIsResolvingImages(false)

                const res = await getProjectById(presentationId)
                if (res?.status === 200 && res.data?.slides) {
                  const slides = JSON.parse(JSON.stringify(res.data.slides))
                  setLocalSlides(slides)
                  setSlides(slides)
                }

                setStreamComplete(true)
                setStreamProgress(100)
                setStreamStatus('Complete!')
                toast.success('Presentation Ready!')
              }
              if (event.type === 'error') {
                setIsStreaming(false)
                toast.error(event.message || 'Generation failed')
              }
            } catch {
            }
          }
        }
      }
    } catch (err) {
      setIsStreaming(false)
      toast.error(err instanceof Error ? err.message : 'Streaming failed')
    }
  }

  const orderedSlides = [...localSlides].sort(
    (a, b) => (a.slideOrder ?? 0) - (b.slideOrder ?? 0)
  )
  const activeSlide = orderedSlides[activeSlideIdx]

  const handleOpenEditor = () => router.push(`/presentation/${presentationId}`)
  const handleBack = () => router.push('/create-page')
  const handleNavigateCreate = () => router.push('/create-page')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#030303]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-violet-500/10 blur-2xl animate-pulse" />
            <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
              <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-white/90">Initializing Immersive Engine</p>
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Preparing slide canvas...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#030303] text-white selection:bg-violet-500/30 overflow-hidden font-outfit">
      {/* ── Immersive Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <StreamableHeader
        isStreaming={isStreaming || isResolvingImages}
        streamComplete={streamComplete}
        streamStatus={streamStatus}
        streamProgress={streamProgress}
        slideCount={orderedSlides.length}
        activeSlideIdx={activeSlideIdx}
        presentationId={presentationId}
        onBack={handleBack}
        onOpenEditor={handleOpenEditor}
      />

      <div className="flex-1 flex min-h-0 relative z-10">
        {/* ── Left Sidebar (Thumbnail Rail) ── */}
        <AnimatePresence mode='wait'>
          {isSidebarsOpen && (
            <motion.div 
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden lg:block h-full"
            >
              <StreamableSidebar
                slides={orderedSlides}
                activeSlideIdx={activeSlideIdx}
                isStreaming={isStreaming}
                currentTheme={currentTheme}
                onSelectSlide={setActiveSlideIdx}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Center Canvas ── */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative group"
          >
            {autoFitScale > 0 && (
              <TransformWrapper
                minScale={0.05}
                maxScale={4}
                initialScale={autoFitScale}
                centerOnInit={true}
                limitToBounds={false}
                panning={{ velocityDisabled: true }}
              >
                <ZoomControls autoFitScale={autoFitScale} />
                <TransformComponent 
                  wrapperStyle={{ width: "100%", height: "100%" }} 
                  contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="relative"
                  >
                    <StreamableSlidePreview
                      activeSlide={activeSlide}
                      scale={1}
                      isStreaming={isStreaming}
                      streamStatus={streamStatus}
                      currentTheme={currentTheme}
                      onNavigateCreate={handleNavigateCreate}
                    />
                  </motion.div>
                </TransformComponent>
              </TransformWrapper>
            )}

            {/* Sidebar Toggle Buttons (Canva Style) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarsOpen(s => !s)}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10"
               >
                 <PanelLeft className={cn("w-4 h-4 transition-transform", !isSidebarsOpen && "rotate-180")} />
               </Button>
            </div>
          </div>

          {/* ── Navigation Controls (Apple Grade) ── */}
          {orderedSlides.length > 0 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
              <div className="flex items-center gap-6 bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:border-white/20">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={activeSlideIdx === 0}
                  onClick={() => setActiveSlideIdx((i) => Math.max(0, i - 1))}
                  className="rounded-full h-10 w-10 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold tracking-widest text-violet-400 uppercase w-4 text-center">
                    {activeSlideIdx + 1}
                  </span>
                  <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((activeSlideIdx + 1) / orderedSlides.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-white/30 uppercase w-4 text-center">
                    {orderedSlides.length}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={activeSlideIdx >= orderedSlides.length - 1}
                  onClick={() => setActiveSlideIdx((i) => Math.min(orderedSlides.length - 1, i + 1))}
                  className="rounded-full h-10 w-10 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* ── Right Sidebar (Metadata Panel) ── */}
        <AnimatePresence mode='wait'>
          {isSidebarsOpen && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden lg:block h-full"
            >
              <StreamableDetailsPanel
                activeSlide={activeSlide}
                slides={orderedSlides}
                isStreaming={isStreaming}
                streamComplete={streamComplete}
                currentTheme={currentTheme}
                presentationId={presentationId}
                onOpenEditor={handleOpenEditor}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile Action Bar ── */}
        <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50 lg:hidden'>
          <div className='flex items-center gap-3 bg-black/80 backdrop-blur-3xl border border-white/10 px-5 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)]'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-white/70">
                  <PanelLeft className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px] border-r-white/5 bg-[#0a0a0a]/95 backdrop-blur-3xl">
                <StreamableSidebar
                  slides={orderedSlides}
                  activeSlideIdx={activeSlideIdx}
                  isStreaming={isStreaming}
                  currentTheme={currentTheme}
                  onSelectSlide={(idx) => {
                    setActiveSlideIdx(idx);
                    // Close sheet on selection? We'd need a trigger here.
                  }}
                />
              </SheetContent>
            </Sheet>

            <div className='w-px h-6 bg-white/10 mx-1' />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-white/70">
                  <PanelRight className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[300px] border-l-white/5 bg-[#0a0a0a]/95 backdrop-blur-3xl">
                <StreamableDetailsPanel
                  activeSlide={activeSlide}
                  slides={orderedSlides}
                  isStreaming={isStreaming}
                  streamComplete={streamComplete}
                  currentTheme={currentTheme}
                  presentationId={presentationId}
                  onOpenEditor={handleOpenEditor}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  )
}
