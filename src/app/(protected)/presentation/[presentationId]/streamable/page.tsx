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
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import StreamableHeader from './_components/StreamableHeader'
import StreamableSidebar from './_components/StreamableSidebar'
import StreamableSlidePreview from './_components/StreamableSlidePreview'
import StreamableDetailsPanel from './_components/StreamableDetailsPanel'

// ─── Canvas Constants ───
const SLIDE_WIDTH = 1280
const SLIDE_HEIGHT = 720

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
  const [scale, setScale] = useState(1)
  const [activeSlideIdx, setActiveSlideIdx] = useState(0)

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
          // Project already has slides — show them (completed generation)
          setLocalSlides(projectSlides)
          setSlides(projectSlides)
          setStreamComplete(true)
        } else {
          // Empty project — check URL for streaming params
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
    const padX = width < 640 ? 20 : 56
    const padY = height < 500 ? 20 : 56
    const sW = (width - padX * 2) / SLIDE_WIDTH
    const sH = (height - padY * 2) / SLIDE_HEIGHT
    setScale(Math.max(0.15, Math.min(sW, sH, 1)))
  }, [])

  useEffect(() => {
    computeScale()
    const observer = new ResizeObserver(computeScale)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [computeScale])

  // ─── Keyboard navigation ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSlideIdx((i) => Math.max(0, i - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSlideIdx((i) => Math.min(orderedSlides.length - 1, i + 1))
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

                // Post-generation: patch placeholder images with real ones
                try {
                  const patchResult = await patchStreamableImages(presentationId)
                  if (patchResult.status === 200 && patchResult.data) {
                    console.log(`[Streamable] Image patch: ${patchResult.data.message}`)
                  }
                } catch (patchErr) {
                  console.warn('[Streamable] Image patching failed (non-fatal):', patchErr)
                }

                setIsResolvingImages(false)

                // Reload from DB to get patched slides
                const res = await getProjectById(presentationId)
                if (res?.status === 200 && res.data?.slides) {
                  const slides = JSON.parse(JSON.stringify(res.data.slides))
                  setLocalSlides(slides)
                  setSlides(slides)
                }

                setStreamComplete(true)
                setStreamProgress(100)
                setStreamStatus('Complete!')
                toast.success('Presentation Ready!', {
                  description: `${event.message || 'All slides generated'} — images resolved.`,
                })
              }
              if (event.type === 'error') {
                setIsStreaming(false)
                toast.error(event.message || 'Generation failed')
              }
            } catch {
              // skip malformed
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

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
            <div className="relative p-4 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading presentation...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ══════ Top Bar ══════ */}
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

      <div className="flex-1 flex min-h-0">
        {/* ══════ Left: Thumbnail Sidebar ══════ */}
        <StreamableSidebar
          slides={orderedSlides}
          activeSlideIdx={activeSlideIdx}
          isStreaming={isStreaming}
          currentTheme={currentTheme}
          onSelectSlide={setActiveSlideIdx}
        />

        {/* ══════ Center: Main Slide Canvas ══════ */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
          </div>

          {/* Slide canvas */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center overflow-hidden relative"
          >
            <StreamableSlidePreview
              activeSlide={activeSlide}
              scale={scale}
              isStreaming={isStreaming}
              streamStatus={streamStatus}
              currentTheme={currentTheme}
              onNavigateCreate={handleNavigateCreate}
            />
          </div>

          {/* ── Bottom nav ── */}
          {orderedSlides.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-12 border-t border-border/40 flex items-center justify-center gap-4 bg-background/70 backdrop-blur-sm"
            >
              <Button
                variant="ghost"
                size="icon"
                disabled={activeSlideIdx === 0}
                onClick={() => setActiveSlideIdx((i) => Math.max(0, i - 1))}
                className="rounded-xl h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Dot indicators for small slide counts */}
              {orderedSlides.length <= 15 ? (
                <div className="flex items-center gap-1.5">
                  {orderedSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`rounded-full transition-all duration-300 ${
                        idx === activeSlideIdx
                          ? 'w-6 h-2 bg-violet-500'
                          : 'w-2 h-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-sm font-mono text-muted-foreground tabular-nums">
                  {activeSlideIdx + 1} of {orderedSlides.length}
                </span>
              )}

              <Button
                variant="ghost"
                size="icon"
                disabled={activeSlideIdx >= orderedSlides.length - 1}
                onClick={() => setActiveSlideIdx((i) => Math.min(orderedSlides.length - 1, i + 1))}
                className="rounded-xl h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </main>

        {/* ══════ Right: Details Panel ══════ */}
        <StreamableDetailsPanel
          activeSlide={activeSlide}
          slides={orderedSlides}
          isStreaming={isStreaming}
          streamComplete={streamComplete}
          currentTheme={currentTheme}
          presentationId={presentationId}
          onOpenEditor={handleOpenEditor}
        />
      </div>
    </div>
  )
}
