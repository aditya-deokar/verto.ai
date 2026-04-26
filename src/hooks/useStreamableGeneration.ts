"use client";

// hooks/useStreamableGeneration.ts
//
// Client-side hook for consuming the Streamable Slides SSE stream.
// Manages connection lifecycle, parses SSE events, and incrementally
// builds up the slides array as each slide arrives from the server.

import { useState, useCallback, useRef } from "react";
import { Slide } from "@/lib/types";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type StreamableStatus =
  | "idle"
  | "creating-project"
  | "streaming"
  | "complete"
  | "error";

interface StreamableSSEEvent {
  type: "slide" | "progress" | "complete" | "error";
  index?: number;
  data?: any;
  projectId?: string;
  message?: string;
  progress?: number;
  timestamp: number;
}

interface UseStreamableGenerationReturn {
  /** Incrementally populated slides array */
  slides: Slide[];
  /** Current status of the generation */
  status: StreamableStatus;
  /** Overall progress (0-100) */
  progress: number;
  /** Human-readable status message */
  statusMessage: string;
  /** Index of the most recently received slide */
  currentSlideIndex: number;
  /** The projectId once generation is complete */
  projectId: string | null;
  /** Error message if status is 'error' */
  error: string | null;
  /** Start generation */
  generate: (
    topic: string,
    theme: string,
    context?: string
  ) => Promise<void>;
  /** Abort an in-progress generation */
  abort: () => void;
}

// ─────────────────────────────────────────────────────
// SSE line parser
// ─────────────────────────────────────────────────────

function parseSSEChunk(chunk: string): StreamableSSEEvent[] {
  const events: StreamableSSEEvent[] = [];

  // SSE format: each event is "data: <json>\n\n"
  const lines = chunk.split("\n");
  let currentData = "";

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      currentData = line.slice(6);
    } else if (line === "" && currentData) {
      try {
        events.push(JSON.parse(currentData));
      } catch {
        // Ignore malformed JSON (e.g. heartbeats)
      }
      currentData = "";
    }
    // Skip comment lines (heartbeats start with ":")
  }

  return events;
}

// ─────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────

export function useStreamableGeneration(): UseStreamableGenerationReturn {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [status, setStatus] = useState<StreamableStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(-1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStatus("idle");
      setStatusMessage("Generation cancelled");
    }
  }, []);

  const generate = useCallback(
    async (topic: string, theme: string, context?: string) => {
      // Reset state
      setSlides([]);
      setStatus("creating-project");
      setProgress(0);
      setStatusMessage("Creating project...");
      setCurrentSlideIndex(-1);
      setProjectId(null);
      setError(null);

      // Abort any previous stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // ── Step 1: Create project via server action ──
        const { createStreamableProject } = await import(
          "@/actions/streamable-generation"
        );

        const createResult = await createStreamableProject(topic, theme);

        if (createResult.status !== 200 || !createResult.data) {
          throw new Error(
            createResult.error || "Failed to create project"
          );
        }

        const newProjectId = createResult.data.projectId;
        setProjectId(newProjectId);

        // ── Step 2: Start SSE stream ──
        setStatus("streaming");
        setStatusMessage("Starting AI generation...");

        const response = await fetch("/api/generation/streamable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            theme,
            context,
            projectId: newProjectId,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error || `Server error: ${response.status}`
          );
        }

        if (!response.body) {
          throw new Error("No response stream available");
        }

        // ── Step 3: Read the SSE stream ──
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events (delimited by double newline)
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || ""; // Keep incomplete last part as buffer

          for (const part of parts) {
            const events = parseSSEChunk(part + "\n\n");

            for (const event of events) {
              switch (event.type) {
                case "slide": {
                  if (event.data && event.index !== undefined) {
                    const newSlide = event.data as Slide;
                    setSlides((prev) => {
                      // Avoid duplicates (in case of reconnection)
                      const exists = prev.some(
                        (s) => s.slideOrder === newSlide.slideOrder
                      );
                      if (exists) return prev;
                      return [...prev, newSlide];
                    });
                    setCurrentSlideIndex(event.index);
                    setStatusMessage(
                      `Building slide ${event.index + 1}: ${newSlide.slideName || ""}`
                    );
                  }
                  if (event.progress !== undefined) {
                    setProgress(event.progress);
                  }
                  break;
                }

                case "progress": {
                  if (event.message) {
                    setStatusMessage(event.message);
                  }
                  if (event.progress !== undefined) {
                    setProgress(event.progress);
                  }
                  break;
                }

                case "complete": {
                  setStatus("complete");
                  setProgress(100);
                  setStatusMessage(
                    event.message || "Presentation complete!"
                  );
                  if (event.projectId) {
                    setProjectId(event.projectId);
                  }
                  toast.success("Presentation Generated!", {
                    description: `Your presentation is ready with ${event.message || "all slides"}.`,
                  });
                  break;
                }

                case "error": {
                  setStatus("error");
                  setError(event.message || "Generation failed");
                  setStatusMessage(event.message || "Generation failed");
                  toast.error("Generation Failed", {
                    description: event.message || "An unexpected error occurred",
                  });
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // User cancelled — don't show error
          setStatus("idle");
          setStatusMessage("Generation cancelled");
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setStatus("error");
        setError(errorMessage);
        setStatusMessage(`Error: ${errorMessage}`);
        toast.error("Generation Failed", {
          description: errorMessage,
        });
      } finally {
        abortControllerRef.current = null;
      }
    },
    []
  );

  return {
    slides,
    status,
    progress,
    statusMessage,
    currentSlideIndex,
    projectId,
    error,
    generate,
    abort,
  };
}
