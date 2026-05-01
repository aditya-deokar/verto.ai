'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Sparkles, Loader2, Zap, Play, CheckCircle2, ChevronDown, ChevronUp, ChevronRight, ChevronLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createStreamableProject } from '@/actions/streamable-generation'
import { containerVariants, itemVariants, themes } from '@/lib/constants'
import { Theme } from '@/lib/types'
import { useUsageLimit } from '@/hooks/use-usage-limit'

type Props = { onBack: () => void }

const ThemeCard = ({ theme, isSelected, onSelect, isCreating }: { 
  theme: Theme, 
  isSelected: boolean, 
  onSelect: (t: Theme) => void,
  isCreating: boolean 
}) => (
  <motion.button
    whileHover={{ y: -8, scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onSelect(theme)}
    disabled={isCreating}
    className={`relative shrink-0 w-36 h-36 rounded-3xl overflow-hidden border-2 transition-all duration-500 group/card ${
      isSelected 
        ? 'border-violet-500 ring-8 ring-violet-500/10 scale-110 z-20 shadow-2xl' 
        : 'border-border/40 hover:border-border/80 hover:shadow-xl'
    }`}
  >
    <div className="absolute inset-0 flex flex-col p-4" style={{ background: theme.backgroundColor }}>
      {/* Mini Slide Preview */}
      <div className="relative w-full h-1/2 rounded-xl mb-2 overflow-hidden border border-white/10 shadow-inner" style={{ background: theme.slideBackgroundColor }}>
         <div className="absolute top-2 left-2 w-1/2 h-2 rounded-full opacity-20" style={{ background: theme.fontColor }} />
         <div className="absolute top-5 left-2 w-1/3 h-1.5 rounded-full opacity-10" style={{ background: theme.fontColor }} />
         <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full opacity-30 shadow-lg" style={{ background: theme.accentColor }} />
      </div>
      
      <div className="mt-auto flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: theme.fontColor }}>Style</p>
          <p className="text-xs font-bold truncate max-w-[80px]" style={{ color: theme.fontColor }}>{theme.name}</p>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-violet-500 scale-110' : 'bg-muted/20 opacity-0 group-hover/card:opacity-100'}`}>
          {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3 h-3" />}
        </div>
      </div>
    </div>
  </motion.button>
);

const ThemeMarquee = ({ themes, selectedTheme, onSelect, isCreating, direction = 'left' }: {
  themes: Theme[],
  selectedTheme: Theme,
  onSelect: (t: Theme) => void,
  isCreating: boolean,
  direction?: 'left' | 'right'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const duplicatedThemes = useMemo(() => [...themes, ...themes], [themes]);

  const scroll = (side: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = side === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="relative w-full group/marquee overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 -left-2 z-30 flex items-center opacity-0 group-hover/marquee:opacity-100 transition-opacity duration-300">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scroll('left')}
          className="rounded-full shadow-xl border-border/50 backdrop-blur-xl bg-background/80 hover:bg-background h-12 w-12"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 -right-2 z-30 flex items-center opacity-0 group-hover/marquee:opacity-100 transition-opacity duration-300">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scroll('right')}
          className="rounded-full shadow-xl border-border/50 backdrop-blur-xl bg-background/80 hover:bg-background h-12 w-12"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-hidden py-10 px-4"
      >
        <motion.div
          className="flex gap-8 shrink-0"
          animate={{ x: isHovered ? undefined : (direction === 'left' ? ["0%", "-50%"] : ["-50%", "0%"]) }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear",
          }}
        >
          {duplicatedThemes.map((theme, i) => (
            <ThemeCard 
              key={`${theme.name}-${i}`} 
              theme={theme} 
              isSelected={selectedTheme.name === theme.name}
              onSelect={onSelect}
              isCreating={isCreating}
            />
          ))}
        </motion.div>
      </div>

      {/* Fade Gradients */}
      <div className="absolute inset-y-0 left-0 w-40 bg-linear-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-40 bg-linear-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

const StreamableSlidesPage = ({ onBack }: Props) => {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0])
  const [isCreating, setIsCreating] = useState(false)
  const [showContext, setShowContext] = useState(false)
  const { checkUsage, UsageModal } = useUsageLimit()

  const row1 = useMemo(() => themes.slice(0, 10), []);
  const row2 = useMemo(() => themes.slice(10, 20), []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for your presentation')
      return
    }

    const canGenerate = await checkUsage()
    if (!canGenerate) return

    setIsCreating(true)

    try {
      const result = await createStreamableProject(topic, selectedTheme.name)

      if (result.status !== 200 || !result.data) {
        throw new Error(result.error || 'Failed to create project')
      }

      const params = new URLSearchParams({
        topic,
        theme: selectedTheme.name,
        ...(context ? { context } : {}),
      })

      router.push(`/presentation/${result.data.projectId}/streamable?${params.toString()}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start generation')
      setIsCreating(false)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex flex-col items-center pt-8 pb-20 px-4 max-w-7xl mx-auto"
    >
      {/* --- Back Navigation --- */}
      <motion.div variants={itemVariants} className="w-full flex justify-start mb-12">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isCreating}
          className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full px-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </motion.div>

      {/* --- Immersive Hero --- */}
      <motion.div variants={itemVariants} className="text-center space-y-6 mb-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-sm font-semibold shadow-sm mb-4"
        >
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          Live Streaming AI
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          Watch your ideas <br />
          <span className="bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            come to life.
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed">
          Enter your topic and watch as our AI builds your presentation in real-time. 
          Experience a new era of creation.
        </p>
      </motion.div>

      {/* --- Main Interactive Area --- */}
      <motion.div
        variants={itemVariants}
        className="w-full space-y-12"
      >
        <div className="relative group w-full max-w-4xl mx-auto">
          <div className="relative bg-background/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="space-y-6">
              {/* Minimal Topic Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Presentation Topic</label>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">AI Ready</span>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    placeholder="Describe your presentation topic..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isCreating}
                    className="text-xl md:text-2xl font-medium tracking-tight h-auto py-2 bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 px-0 transition-all"
                  />
                  <div className="relative h-0.5 w-full bg-muted/20 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-violet-500"
                      initial={{ width: "0%" }}
                      animate={{ width: topic ? "100%" : "2%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Minimal Context Toggle */}
              <div className="pt-2">
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 hover:text-violet-500 transition-colors"
                >
                  {showContext ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showContext ? "Less detail" : "Add more context"}
                </button>
                
                <AnimatePresence>
                  {showContext && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <Textarea
                        placeholder="Specific instructions for the AI..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        disabled={isCreating}
                        rows={3}
                        className="text-sm bg-muted/10 border-border/20 focus:border-violet-500/20 rounded-2xl p-4 transition-all resize-none placeholder:text-muted-foreground/20"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* --- Premium Theme Marquee Section --- */}
        <motion.div variants={itemVariants} className="w-full space-y-4">
          <div className="flex items-center justify-between px-4 max-w-4xl mx-auto w-full">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">Choose Your Visual Identity</h3>
              <p className="text-sm text-muted-foreground">Hover to pause and select your style</p>
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="px-3 py-1 bg-violet-500/5 text-violet-500 border-violet-500/20">{selectedTheme.name}</Badge>
            </div>
          </div>

          <div className="space-y-0 relative">
            <ThemeMarquee 
              themes={row1} 
              selectedTheme={selectedTheme} 
              onSelect={setSelectedTheme} 
              isCreating={isCreating} 
              direction="left"
            />
            <ThemeMarquee 
              themes={row2} 
              selectedTheme={selectedTheme} 
              onSelect={setSelectedTheme} 
              isCreating={isCreating} 
              direction="right"
            />
          </div>
        </motion.div>

        {/* --- Action Button --- */}
        <div className="max-w-4xl mx-auto w-full pt-8">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isCreating}
              className="w-full h-14 text-base font-bold rounded-2xl shadow-xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 group relative overflow-hidden"
            >
              <span className="relative flex items-center justify-center gap-3 tracking-tight">
                {isCreating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-current" />
                    Generate Presentation
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>
            <p className="text-center text-[10px] text-muted-foreground/40 mt-4 font-bold uppercase tracking-[0.2em]">
              Powered by Advanced Agentic Orchestration
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* --- Footer Hint --- */}
      <motion.div
        variants={itemVariants}
        className="mt-24 text-center text-muted-foreground/40 flex items-center gap-4 text-sm"
      >
        <span className="w-12 h-px bg-border" />
        Advanced AI Orchestration Active
        <span className="w-12 h-px bg-border" />
      </motion.div>

      <UsageModal />
    </motion.div>
  )
}

export default StreamableSlidesPage

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

