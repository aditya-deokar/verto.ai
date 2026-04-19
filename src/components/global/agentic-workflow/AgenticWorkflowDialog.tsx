'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import AgenticProgressTracker, { AgentStep, AgentStatus } from './AgenticProgressTracker'
import { AgenticStreamViewer } from './AgenticStreamViewer'
import { useStreamingGeneration } from '@/hooks/useStreamingGeneration'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ArrowRight, BrainCircuit, Loader2, Workflow, DatabaseZap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgenticWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
  topic: string
  steps?: readonly AgentStep[] | AgentStep[]
  currentProgress?: number
  currentAgentName?: string
  currentAgentDescription?: string
  runId?: string | null
  showStream?: boolean
}

const AGENT_STEPS_CONFIG: Omit<AgentStep, 'status' | 'details'>[] = [
  { id: 'projectInitializer', name: 'Project Setup', description: 'Preparing your presentation workspace' },
  { id: 'outlineGenerator', name: 'Structure', description: 'Organizing the presentation flow' },
  { id: 'contentWriter', name: 'Content Writing', description: 'Creating engaging text for all slides' },
  { id: 'layoutSelector', name: 'Design Layout', description: 'Selecting the best look for your slides' },
  { id: 'imageQueryGenerator', name: 'Visual Search', description: 'Finding the right visuals for each slide' },
  { id: 'imageFetcher', name: 'Image Integration', description: 'Adding beautiful visuals' },
  { id: 'jsonCompiler', name: 'Assembly', description: 'Formatting and polishing your slides' },
  { id: 'databasePersister', name: 'Finalization', description: 'Saving your masterpiece' }
]

const AgenticWorkflowDialog = ({
  open,
  onOpenChange,
  onComplete,
  topic,
  steps: externalSteps,
  currentProgress: externalProgress,
  currentAgentName,
  currentAgentDescription,
  runId,
  showStream = true
}: AgenticWorkflowDialogProps) => {
  const [steps, setSteps] = useState<AgentStep[]>(
    externalSteps ? [...externalSteps] : AGENT_STEPS_CONFIG.map(step => ({ ...step, status: 'pending' as AgentStatus }))
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(externalProgress || 0)
  const [streamEnabled, setStreamEnabled] = useState(showStream)
  
  // Extra visual state for auto redirect
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const {
    isConnected,
    isConnecting,
    events,
    currentTokens,
    currentAgentId,
    error: streamError,
    connect,
    disconnect,
  } = useStreamingGeneration()

  useEffect(() => {
    if (open && runId && streamEnabled) {
      connect(runId)
    }
    return () => {
      if (!open) {
        disconnect()
        setIsRedirecting(false)
        setCountdown(3)
      }
    }
  }, [open, runId, streamEnabled, connect, disconnect])

  React.useEffect(() => {
    if (externalSteps) {
      setSteps([...externalSteps])
      const runningIndex = externalSteps.findIndex((step) => step.status === 'running')
      const errorIndex = externalSteps.findIndex((step) => step.status === 'error')
      const activeIndex = runningIndex >= 0
        ? runningIndex
        : errorIndex >= 0
          ? errorIndex
          : Math.max(
              externalSteps.findLastIndex((step) => step.status === 'completed'),
              0
            )

      setCurrentStep(activeIndex)
    }
  }, [externalSteps])

  React.useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress)
    }
  }, [externalProgress])

  // Handle auto-redirect countdown
  useEffect(() => {
    if (progress === 100) {
      setIsRedirecting(true)
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [progress])

  const completedSteps = steps.filter(s => s.status === 'completed').length
  const totalSteps = steps.length
  const overallProgress = (completedSteps / totalSteps) * 100

  const handleCancel = () => {
    setSteps(AGENT_STEPS_CONFIG.map(step => ({ ...step, status: 'pending' as AgentStatus })))
    setCurrentStep(0)
    setProgress(0)
    onOpenChange(false)
  }

  // Generate some "meta data" from stream events
  const tokenEvents = events.filter(e => e.type === 'token')
  const computePower = Math.min((tokenEvents.length / 50) * 100, 100).toFixed(1)
  const insightsFound = Math.floor(tokenEvents.length / 15)
  const timeElapsedMs = events.length > 0 ? (events[events.length -1].timestamp - events[0].timestamp) : 0
  const timeSecs = (timeElapsedMs / 1000).toFixed(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm z-[100]" />
      <DialogContent className="max-w-6xl w-[90vw] p-0 overflow-hidden border-0 bg-transparent shadow-2xl z-[101]">
        
        <div className="relative rounded-2xl overflow-hidden bg-background/80 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[750px]">
          
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/30 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/30 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* LEFT PANEL : Intelligence & Stream Output */}
          <div className="flex-1 min-h-0 border-r border-white/10 flex flex-col relative z-10 bg-gradient-to-br from-background/40 to-muted/20">
            
            {/* Header / Hero component */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/20">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    Agentic Synthesis
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium mt-0.5 text-muted-foreground flex items-center gap-2">
                    <span className="truncate max-w-[250px]">"{topic}"</span>
                  </DialogDescription>
                </div>
              </div>

              {/* Live Data Meta */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-background/40 backdrop-blur border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="rounded-full bg-blue-500/10 p-2">
                    <DatabaseZap className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Tokens Processed</p>
                    <p className="text-lg font-bold font-mono slashed-zero text-foreground">{tokenEvents.length * 4}</p>
                  </div>
                </div>
                <div className="bg-background/40 backdrop-blur border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="rounded-full bg-purple-500/10 p-2">
                    <Workflow className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Insights Generated</p>
                    <p className="text-lg font-bold font-mono slashed-zero text-foreground">{insightsFound}</p>
                  </div>
                </div>
                <div className="bg-background/40 backdrop-blur border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="rounded-full bg-emerald-500/10 p-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Compute Power</p>
                    <p className="text-lg font-bold font-mono slashed-zero text-foreground">{computePower}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Viewer Core */}
            <div className="flex-1 min-h-0 overflow-hidden p-4 relative">
              {streamEnabled && (
                <AgenticStreamViewer
                  events={events}
                  currentTokens={currentTokens}
                  isConnected={isConnected}
                  isConnecting={isConnecting}
                  currentAgentId={currentAgentId}
                  error={streamError}
                  onRetry={runId ? () => connect(runId) : undefined}
                  className="h-full border-none bg-background/50 backdrop-blur-sm shadow-inner"
                />
              )}
            </div>
            
            {/* Realtime Action Footer */}
            <div className="p-4 border-t border-white/10 bg-background/30 backdrop-blur flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isConnected && progress < 100 ? "bg-emerald-400" : "bg-gray-400 hidden")} />
                  <span className={cn("relative inline-flex rounded-full h-3 w-3", 
                    progress === 100 ? "bg-emerald-500" : 
                    isConnected ? "bg-emerald-500" : "bg-gray-500"
                  )} />
                </span>
                <span className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider">
                  {progress === 100 ? "Synthesis Complete" :
                   isConnected ? `Active Connection • ${timeSecs}s elapsed` : 
                   "Waiting for telemetry"}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                Cancel
              </Button>
            </div>
          </div>

          {/* RIGHT PANEL : Progress & Navigation */}
          <div className="w-full md:w-[400px] flex flex-col relative z-10 bg-background/60 backdrop-blur">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold tracking-tight text-foreground/80">Workflow Sequence</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
              <AgenticProgressTracker
                steps={steps}
                currentStep={currentStep}
                className="pb-24"
              />
            </div>

            {/* Fixed Bottom Success Banner / Progress */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-12 border-t border-white/5">
              <AnimatePresence mode="wait">
                {progress === 100 ? (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-2 rounded-full">
                          <Sparkles className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            Presentation Ready!
                          </p>
                          <p className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 flex items-center gap-2">
                             <Loader2 className="h-3 w-3 animate-spin inline-block" /> Redirecting in {countdown}s
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        onComplete?.()
                        onOpenChange(false)
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all rounded-xl h-12 text-md font-bold group"
                    >
                      Enter Editor Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="working"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground/80">Overall Progress</span>
                      <span className="font-mono font-bold text-blue-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="relative h-2 w-full bg-muted overflow-hidden rounded-full">
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                      />
                    </div>
                    {currentAgentName && (
                      <p className="text-xs text-muted-foreground font-medium animate-pulse">
                        <span className="text-foreground/80 font-bold">{currentAgentName}</span> is currently processing...
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}

export default AgenticWorkflowDialog

export const useAgenticWorkflow = () => {
  const [open, setOpen] = useState(false)
  const [steps, setSteps] = useState<AgentStep[]>(
    AGENT_STEPS_CONFIG.map(step => ({ ...step, status: 'pending' as AgentStatus }))
  )

  const updateStep = (stepId: string, status: AgentStatus, details?: string) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status, details } : step
    ))
  }

  const resetWorkflow = () => {
    setSteps(AGENT_STEPS_CONFIG.map(step => ({ ...step, status: 'pending' as AgentStatus })))
  }

  return {
    open,
    setOpen,
    steps,
    updateStep,
    resetWorkflow
  }
}
