'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Sparkles, Loader2, Zap, Play, CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createStreamableProject } from '@/actions/streamable-generation'
import { containerVariants, itemVariants, themes } from '@/lib/constants'
import { Theme } from '@/lib/types'

type Props = { onBack: () => void }

const StreamableSlidesPage = ({ onBack }: Props) => {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0])
  const [isCreating, setIsCreating] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for your presentation')
      return
    }

    setIsCreating(true)

    try {
      // Create the project first
      const result = await createStreamableProject(topic, selectedTheme.name)

      if (result.status !== 200 || !result.data) {
        throw new Error(result.error || 'Failed to create project')
      }

      // Redirect to the dedicated viewer with streaming params
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
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-8 max-w-5xl mx-auto pb-12 px-4"
    >
      {/* ── Header ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-linear-to-br from-background via-background to-background/80 p-8 shadow-lg"
      >
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="absolute inset-0 dotted-grid" />
        <div className="relative flex items-start gap-6">
          <Button variant="ghost" size="icon" onClick={onBack}
            className="hover:bg-background/80 hover:scale-110 transition-all duration-200 border border-border/50 shadow-xs"
            disabled={isCreating}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <motion.div className="p-3 rounded-xl bg-linear-to-br from-violet-600 to-fuchsia-500 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Play className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                  <span className="bg-linear-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Live</span>
                  <span className="text-primary">Slide Builder</span>
                </h1>
                <Badge variant="secondary" className="mt-2">
                  <Zap className="h-3 w-3 mr-1" />
                  Real-time Streaming
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Enter your topic and watch your slides build in real-time in an immersive full-screen viewer.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Input Form ── */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-border/50 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-violet-600 to-fuchsia-500" />
          <CardHeader className="bg-linear-to-br from-muted/30 via-background to-background pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                <Sparkles className="h-6 w-6 text-violet-500" />
              </div>
              Presentation Details
            </CardTitle>
            <CardDescription className="text-base">
              Fill in your topic and we&apos;ll launch the immersive live builder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="streamable-topic" className="text-base font-semibold">Topic *</Label>
              <Input
                id="streamable-topic"
                placeholder="e.g. The Future of Artificial Intelligence"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isCreating}
                className="text-lg h-12"
              />
            </div>

            {/* Context */}
            <div className="space-y-2">
              <Label htmlFor="streamable-context" className="text-base font-semibold">
                Additional Context <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="streamable-context"
                placeholder="Any specific focus areas, audience details, or tone preferences..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={isCreating}
                rows={3}
              />
            </div>

            {/* Theme Picker */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Theme</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {themes.slice(0, 10).map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(theme)}
                    disabled={isCreating}
                    className={`relative group rounded-lg p-3 border-2 transition-all duration-200 text-left ${
                      selectedTheme.name === theme.name
                        ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-105'
                        : 'border-border/50 hover:border-border hover:shadow-md'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.accentColor }} />
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.slideBackgroundColor }} />
                    </div>
                    <p className="text-xs font-medium truncate">{theme.name}</p>
                    {selectedTheme.name === theme.name && (
                      <motion.div layoutId="theme-check"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.div whileHover={isCreating ? {} : { scale: 1.01 }} whileTap={isCreating ? {} : { scale: 0.99 }}>
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isCreating}
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white"
              >
                {isCreating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Launching Live Builder...</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" /> Launch Live Builder</>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default StreamableSlidesPage
