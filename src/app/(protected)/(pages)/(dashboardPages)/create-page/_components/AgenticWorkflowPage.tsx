'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, Loader2, Wand2, Brain, FileText, Palette, Image as ImageIcon, Package, Target, Search, ImagePlus, Database, Zap, Lightbulb, CheckCircle2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAgenticGenerationV2 } from '@/hooks/useAgenticGenerationV2'
import AgenticWorkflowDialog from '@/components/global/agentic-workflow/AgenticWorkflowDialog'
import { useSlideStore } from '@/store/useSlideStore'
import { containerVariants, itemVariants, themes } from '@/lib/constants'
import { Theme } from '@/lib/types'

type Props = {
  onBack: () => void
}

const AGENT_INFO = [
  {
    icon: Target,
    name: 'Project Initializer',
    description: 'Creates your project in the database and sets up the foundation',
    color: 'text-purple-500'
  },
  {
    icon: Brain,
    name: 'Outline Generator',
    description: 'Analyzes your topic and creates a logical presentation structure',
    color: 'text-blue-500'
  },
  {
    icon: FileText,
    name: 'Content Writer',
    description: 'Writes engaging titles and compelling content for each slide',
    color: 'text-cyan-500'
  },
  {
    icon: Palette,
    name: 'Layout Selector',
    description: 'AI-powered layout selection for optimal visual presentation',
    color: 'text-pink-500'
  },
  {
    icon: Search,
    name: 'Image Query Generator',
    description: 'Creates contextual image queries to enhance your slides',
    color: 'text-green-500'
  },
  {
    icon: ImagePlus,
    name: 'Image Fetcher',
    description: 'Fetches high-quality images matching your content',
    color: 'text-yellow-500'
  },
  {
    icon: Package,
    name: 'JSON Compiler',
    description: 'Compiles everything into a beautiful, structured presentation',
    color: 'text-orange-500'
  },
  {
    icon: Database,
    name: 'Database Persister',
    description: 'Saves your complete presentation to the database',
    color: 'text-red-500'
  }
]

const AgenticWorkflowPage = ({ onBack }: Props) => {
  const router = useRouter()
  const { setSlides, setProject } = useSlideStore()
  const [presentationTitle, setPresentationTitle] = useState('')
  const [presentationTopic, setPresentationTopic] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]) // Default theme

  const { 
    generate, 
    isGenerating, 
    progress,
    currentAgentName,
    currentAgentDescription,
    error,
    agentSteps
  } = useAgenticGenerationV2()

  const handleGenerate = async () => {
    // Validation
    if (!presentationTitle.trim()) {
      toast.error("Error", {
        description: "Please enter a presentation title",
      })
      return
    }

    if (!presentationTopic.trim()) {
      toast.error("Error", {
        description: "Please enter a topic for your presentation",
      })
      return
    }

    if (!selectedTheme) {
      toast.error("Error", {
        description: "Please select a theme",
      })
      return
    }

    try {
      // V2 workflow handles everything (project creation + AI generation)
      const fullTopic = `${presentationTitle}: ${presentationTopic}`
      
      await generate(fullTopic, additionalContext, selectedTheme.type)
      
      // Success toast is shown after navigation in the hook
      
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to generate presentation",
      })
    }
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8 max-w-7xl mx-auto pb-12 px-4"
      >
        {/* Header with Gradient Background */}
        <motion.div 
          variants={itemVariants} 
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-background/80 p-8 shadow-lg"
        >
          {/* Animated Background Effect */}
          <div className="absolute inset-0 hero-gradient opacity-50" />
          <div className="absolute inset-0 dotted-grid" />
          
          <div className="relative flex items-start gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-background/80 hover:scale-110 transition-all duration-200 border border-border/50 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <motion.div 
                  className="p-3 rounded-xl verto-bg shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                    <span className="verto">Agentic Workflow</span>
                    <span className="text-primary">Generator</span>
                  </h1>
                  <Badge variant="secondary" className="mt-2">
                    <Zap className="h-3 w-3 mr-1" />
                    Powered by 8 AI Agents
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Watch as specialized AI agents collaborate in real-time to craft your perfect presentation—from structure to visuals
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-border/50 shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 verto-bg" />
              <CardHeader className="bg-gradient-to-br from-muted/30 via-background to-background pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
                    <Wand2 className="h-6 w-6 text-red-500" />
                  </div>
                  Presentation Details
                </CardTitle>
                <CardDescription className="text-base">
                  Tell us what you want to create and we'll handle the rest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Title Input */}
                <motion.div 
                  className="space-y-3"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-red-500">*</span> Presentation Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Machine Learning"
                    value={presentationTitle}
                    onChange={(e) => setPresentationTitle(e.target.value)}
                    className="text-base h-12 border-2 focus:border-red-500 transition-colors"
                    disabled={isGenerating}
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                    Give your presentation a clear, descriptive title
                  </p>
                </motion.div>

                {/* Topic Input */}
                <motion.div 
                  className="space-y-3"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="topic" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-red-500">*</span> Main Topic
                  </Label>
                  <Textarea
                    id="topic"
                    placeholder="e.g., Explain the basics of machine learning, including supervised and unsupervised learning, neural networks, and real-world applications"
                    value={presentationTopic}
                    onChange={(e) => setPresentationTopic(e.target.value)}
                    rows={5}
                    className="text-base resize-none border-2 focus:border-red-500 transition-colors"
                    disabled={isGenerating}
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                    Describe what you want your presentation to cover
                  </p>
                </motion.div>

                {/* Additional Context */}
                <motion.div 
                  className="space-y-3"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="context" className="text-base font-semibold flex items-center gap-2">
                    Additional Context
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </Label>
                  <Textarea
                    id="context"
                    placeholder="e.g., Target audience: college students with basic programming knowledge. Focus on practical examples. Include code snippets where relevant."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    rows={4}
                    className="text-base resize-none border-2 focus:border-orange-500 transition-colors"
                    disabled={isGenerating}
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                    Add specific requirements, target audience, or style preferences
                  </p>
                </motion.div>

                {/* Theme Selection */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span className="text-red-500">*</span> Select Theme
                  </Label>
                  <ScrollArea className="h-[300px] rounded-xl border-2 border-border/50 bg-muted/20 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {themes.map((theme) => (
                        <motion.div
                          key={theme.name}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="relative"
                        >
                          <Button
                            type="button"
                            onClick={() => setSelectedTheme(theme)}
                            disabled={isGenerating}
                            className="w-full h-auto p-4 flex flex-col items-start gap-2 relative overflow-hidden transition-all duration-300 border-2"
                            style={{
                              fontFamily: theme.fontFamily,
                              color: theme.fontColor,
                              background: theme.gradientBackground || theme.backgroundColor,
                              borderColor: selectedTheme.name === theme.name ? theme.accentColor : 'transparent',
                              opacity: isGenerating ? 0.6 : 1,
                            }}
                          >
                            {/* Selection Indicator */}
                            {selectedTheme.name === theme.name && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                                style={{ backgroundColor: theme.accentColor }}
                              >
                                <Check className="h-4 w-4" style={{ color: theme.backgroundColor }} />
                              </motion.div>
                            )}

                            <div className="w-full text-left">
                              <p className="font-bold text-sm mb-1">{theme.name}</p>
                              <div className="flex items-center gap-1">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs px-2 py-0"
                                  style={{
                                    backgroundColor: `${theme.accentColor}20`,
                                    color: theme.accentColor,
                                    borderColor: theme.accentColor,
                                  }}
                                >
                                  {theme.type}
                                </Badge>
                              </div>
                            </div>

                            {/* Theme Preview Dots */}
                            <div className="flex gap-1.5 mt-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: theme.backgroundColor }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: theme.accentColor }}
                              />
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: theme.slideBackgroundColor || theme.backgroundColor }}
                              />
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Palette className="h-4 w-4 text-purple-500" />
                    Selected: <span className="font-semibold text-primary">{selectedTheme.name}</span>
                  </p>
                </motion.div>

                {/* Generate Button */}
                <motion.div
                  className="pt-4"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    size="lg"
                    className="w-full h-16 text-lg font-bold verto-bg hover:opacity-90 relative overflow-hidden group shadow-2xl border-0"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {/* Shimmer Effect */}
                    {!isGenerating && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "linear",
                        }}
                      />
                    )}
                    
                    <span className="relative flex items-center justify-center gap-3 text-white">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="flex items-center gap-2">
                            Generating... 
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                              {Math.round(progress)}%
                            </Badge>
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-6 w-6" />
                          Generate with AI Agents
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Agent Information */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-2 border-border/50 shadow-xl sticky top-6 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 verto-bg" />
              <CardHeader className="bg-gradient-to-br from-muted/30 via-background to-background pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
                    <Brain className="h-5 w-5 text-red-500" />
                  </div>
                  AI Agent Pipeline
                </CardTitle>
                <CardDescription className="text-sm">
                  8 specialized agents working in sequence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {AGENT_INFO.map((agent, index) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="group relative flex gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 via-muted/20 to-background border border-border/50 hover:border-red-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    {/* Step Number Badge */}
                    <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full verto-bg flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                    
                    <div className={`flex-shrink-0 mt-1 ${agent.color} group-hover:scale-110 transition-transform duration-300`}>
                      <agent.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-primary group-hover:text-red-500 transition-colors">
                        {agent.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {agent.description}
                      </p>
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 className="h-4 w-4 text-red-500" />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-2 border-orange-200/50 dark:border-orange-900/30 bg-gradient-to-br from-orange-50/50 via-red-50/30 to-background dark:from-orange-950/20 dark:via-red-950/10 dark:to-background shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Lightbulb className="h-5 w-5 text-orange-500" />
                  </motion.div>
                  <span className="verto">Pro Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                {[
                  "Be specific about your topic",
                  "Mention target audience",
                  "Specify any style preferences",
                  "Include key points to cover",
                  "The more context, the better!"
                ].map((tip, index) => (
                  <motion.div
                    key={tip}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{tip}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Agentic Workflow Dialog */}
      <AgenticWorkflowDialog
        open={isGenerating}
        onOpenChange={() => {}}
        topic={presentationTitle || "Your Presentation"}
        steps={agentSteps}
        currentProgress={progress}
        currentAgentName={currentAgentName}
        currentAgentDescription={currentAgentDescription}
        onComplete={() => {
          // Navigation is handled in the hook after success
        }}
      />
    </>
  )
}

export default AgenticWorkflowPage
