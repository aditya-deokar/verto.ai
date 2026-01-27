"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { fetchRealtimeSubscriptionToken } from "@/mobile-design/actions/realtime";
import { THEME_LIST, ThemeType } from "@/mobile-design/lib/themes";
import { FrameType } from "@/mobile-design/types/project";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type LoadingStatusType =
  | "idle"
  | "running"
  | "analyzing"
  | "generating"
  | "completed";

interface CanvasContextType {
  theme?: ThemeType;
  setTheme: (id: string) => void;
  themes: ThemeType[];

  frames: FrameType[];
  setFrames: (frames: FrameType[]) => void;
  updateFrame: (id: string, data: Partial<FrameType>) => void;
  addFrame: (frame: FrameType) => void;
  removeFrame: (id: string) => void;

  selectedFrameId: string | null;
  selectedFrame: FrameType | null;
  setSelectedFrameId: (id: string | null) => void;

  loadingStatus: LoadingStatusType | null;
  setLoadingStatus: (status: LoadingStatusType | null) => void;

  isRegenerating: boolean;
  setIsRegenerating: (value: boolean) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({
  children,
  initialFrames,
  initialThemeId,
  hasInitialData,
  projectId,
}: {
  children: ReactNode;
  initialFrames: FrameType[];
  initialThemeId?: string;
  hasInitialData: boolean;
  projectId: string | null;
}) => {
  const [themeId, setThemeId] = useState<string>(
    initialThemeId || THEME_LIST[0].id
  );

  const [frames, setFrames] = useState<FrameType[]>(initialFrames);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType | null>(
    hasInitialData ? null : "running"
  );
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [prevProjectId, setPrevProjectId] = useState(projectId);
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);
    setLoadingStatus(hasInitialData ? "idle" : "running");
    setFrames(initialFrames);
    setThemeId(initialThemeId || THEME_LIST[0].id);
    setSelectedFrameId(null);
  }

  const theme = THEME_LIST.find((t) => t.id === themeId);
  const selectedFrame =
    selectedFrameId && frames.length !== 0
      ? frames.find((f) => f.id === selectedFrameId) || null
      : null;

  // Subscribe to Inngest Realtime events - always enabled like XDesign
  const { freshData } = useInngestSubscription({
    refreshToken: fetchRealtimeSubscriptionToken as any,
  });

  useEffect(() => {
    if (!freshData || freshData.length === 0) return;

    console.log("[Canvas] Received realtime data:", freshData);

    freshData.forEach((message) => {
      const { data, topic } = message;

      console.log("[Canvas] Processing topic:", topic, "data:", data);

      if (data.projectId !== projectId) {
        console.log("[Canvas] Skipping - projectId mismatch:", data.projectId, "vs", projectId);
        return;
      }

      switch (topic) {
        case "generation.start":
          console.log("[Canvas] generation.start - status:", data.status);
          setLoadingStatus(data.status);
          break;
        case "analysis.start":
          console.log("[Canvas] analysis.start");
          setLoadingStatus("analyzing");
          break;
        case "analysis.complete":
          console.log("[Canvas] analysis.complete - theme:", data.theme, "screens:", data.screens?.length);
          setLoadingStatus("generating");
          if (data.theme) setThemeId(data.theme);

          if (data.screens && data.screens.length > 0) {
            const skeletonFrames: FrameType[] = data.screens.map((s: any) => ({
              id: s.id,
              title: s.name,
              htmlContent: "",
              isLoading: true,
            }));
            setFrames((prev) => [...prev, ...skeletonFrames]);
          }
          break;
        case "frame.created":
          console.log("[Canvas] frame.created - frame:", data.frame?.id, "screenId:", data.screenId);
          if (data.frame) {
            setFrames((prev) => {
              const newFrames = [...prev];
              // Try to find by screenId (initial generation) or frame.id (regeneration)
              const idx = newFrames.findIndex(
                (f) => f.id === data.screenId || f.id === data.frame.id
              );
              if (idx !== -1) {
                // Update existing frame - set isLoading to false
                newFrames[idx] = { ...data.frame, isLoading: false };
              } else {
                // Add new frame
                newFrames.push({ ...data.frame, isLoading: false });
              }
              return newFrames;
            });
            // Also reset regenerating state when a frame is updated
            setIsRegenerating(false);
          }
          break;
        case "generation.complete":
          console.log("[Canvas] generation.complete");
          setLoadingStatus("completed");
          setIsRegenerating(false);
          setTimeout(() => {
            setLoadingStatus("idle");
          }, 100);
          break;
        default:
          console.log("[Canvas] Unknown topic:", topic);
          break;
      }
    });
  }, [projectId, freshData]);

  const addFrame = useCallback((frame: FrameType) => {
    setFrames((prev) => [...prev, frame]);
  }, []);

  const updateFrame = useCallback((id: string, data: Partial<FrameType>) => {
    setFrames((prev) => {
      return prev.map((frame) =>
        frame.id === id ? { ...frame, ...data } : frame
      );
    });
  }, []);

  const removeFrame = useCallback((id: string) => {
    setFrames((prev) => prev.filter((frame) => frame.id !== id));
    if (selectedFrameId === id) {
      setSelectedFrameId(null);
    }
  }, [selectedFrameId]);

  return (
    <CanvasContext.Provider
      value={{
        theme,
        setTheme: setThemeId,
        themes: THEME_LIST,
        frames,
        setFrames,
        selectedFrameId,
        selectedFrame,
        setSelectedFrameId,
        updateFrame,
        addFrame,
        removeFrame,
        loadingStatus,
        setLoadingStatus,
        isRegenerating,
        setIsRegenerating,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside CanvasProvider");
  return ctx;
};
