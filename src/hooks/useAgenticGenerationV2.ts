'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSlideStore } from '@/store/useSlideStore'
import { generatePresentationAction } from '@/actions/generatePresentation'
import {
  createPresentationGenerationRun,
  getPresentationGenerationRun,
} from '@/actions/presentation-generation'
import {
  GENERATION_STEP_DEFINITIONS,
  buildGenerationStepSnapshots,
} from '@/agentic-workflow-v2/lib/progress'
import type { Slide } from '@/lib/types'
import type {
  AgentStep,
} from '@/components/global/agentic-workflow/AgenticProgressTracker'

export interface UseAgenticGenerationV2Return {
  isGenerating: boolean
  progress: number
  currentAgent: string
  currentAgentName: string
  currentAgentDescription: string
  error: string | null
  runId: string | null
  generate: (
    topic: string,
    additionalContext?: string,
    theme?: string,
    providedOutlines?: string[],
    projectId?: string
  ) => Promise<void>
  reset: () => void
  agentSteps: AgentStep[]
}

function mapStepsToAgentSteps(
  steps: ReturnType<typeof buildGenerationStepSnapshots>
): AgentStep[] {
  return steps.map((step) => ({
    id: step.id,
    name: step.name,
    description: step.description,
    status: step.status,
    details: step.details,
  }))
}

function getCurrentAgentInfo(agentId: string) {
  return (
    GENERATION_STEP_DEFINITIONS.find((step) => step.id === agentId) ??
    GENERATION_STEP_DEFINITIONS[0]
  )
}

export function useAgenticGenerationV2(): UseAgenticGenerationV2Return {
  const router = useRouter()
  const { setSlides } = useSlideStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentAgent, setCurrentAgent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>(
    mapStepsToAgentSteps(buildGenerationStepSnapshots())
  )

  const reset = useCallback(() => {
    setIsGenerating(false)
    setProgress(0)
    setCurrentAgent('')
    setError(null)
    setRunId(null)
    setAgentSteps(mapStepsToAgentSteps(buildGenerationStepSnapshots()))
  }, [])

  const generate = useCallback(async (
    topic: string,
    additionalContext?: string,
    theme: string = 'Default',
    providedOutlines?: string[],
    projectId?: string
  ) => {
    let pollInterval: ReturnType<typeof setInterval> | null = null

    try {
      reset()
      setIsGenerating(true)
      setError(null)

      const runResponse = await createPresentationGenerationRun(topic)
      if (runResponse.status !== 200 || !runResponse.data) {
        throw new Error(runResponse.error || 'Failed to create generation run')
      }

    const runId = runResponse.data.id
    setRunId(runId)
    setAgentSteps(mapStepsToAgentSteps(buildGenerationStepSnapshots()))

    // Start SSE streaming immediately (before generation)
    if (runId) {
      setTimeout(() => {
        // The dialog will handle SSE connection via runId
      }, 100)
    }

    const pollProgress = async () => {
        const response = await getPresentationGenerationRun(runId)
        if (response.status !== 200 || !response.data) {
          return
        }

        const data = response.data
        setProgress(data.progress)
        setCurrentAgent(data.currentStepId || '')
        setAgentSteps(
          data.steps.map((step) => ({
            id: step.id,
            name: step.name,
            description: step.description,
            status: step.status,
            details: step.details,
          }))
        )

        if (data.status === 'FAILED' && data.error) {
          setError(data.error)
        }
      }

      await pollProgress()
      pollInterval = setInterval(() => {
        void pollProgress()
      }, 1000)

      const result = await generatePresentationAction(
        topic,
        additionalContext,
        theme,
        providedOutlines,
        runId,
        projectId
      )

      if (pollInterval) {
        clearInterval(pollInterval)
      }

      await pollProgress()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate presentation')
      }

      setProgress(100)
      setCurrentAgent('databasePersister')

      if ('slides' in result && result.slides) {
        setSlides(result.slides as Slide[])
      }

      setTimeout(() => {
        if ('projectId' in result && result.projectId) {
          router.push(`/presentation/${result.projectId}`)
        }
      }, 2000)
    } catch (err) {
      if (pollInterval) {
        clearInterval(pollInterval)
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setCurrentAgent('')
      setIsGenerating(false)
      throw new Error(errorMessage)
    }
  }, [router, setSlides, reset])

  const currentAgentInfo = getCurrentAgentInfo(currentAgent)

  return {
    isGenerating,
    progress,
    currentAgent,
    currentAgentName: currentAgentInfo.name,
    currentAgentDescription: currentAgentInfo.description,
    error,
    runId,
    generate,
    reset,
    agentSteps,
  }
}
