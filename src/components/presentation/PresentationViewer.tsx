"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slide, Theme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Settings2,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MasterRecursiveComponent } from "@/app/(protected)/presentation/[presentationId]/_components/editor/MasterRecursiveComponent";

type TransitionType = "slide" | "fade" | "scale" | "stack";

type PresentationViewerProps = {
  title: string;
  slides: Slide[];
  theme: Theme;
  exitHref: string;
  exitLabel?: string;
  viewerMode?: "owner" | "share";
};

const transitions: Record<TransitionType, any> = {
  slide: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.6 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
    transition: { duration: 0.5 },
  },
  stack: {
    initial: { y: 100, opacity: 0, scale: 0.9 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -50, opacity: 0, scale: 0.95 },
    transition: { duration: 0.5, type: "spring", bounce: 0.2 },
  },
};

function SlideCanvas({
  slide,
  currentTheme,
  scale = 1,
  isMobile = false,
}: {
  slide: Slide;
  currentTheme: Theme;
  scale?: number;
  isMobile?: boolean;
}) {
  const baseWidth = 960;
  const baseHeight = 540;

  return (
    <div
      style={{
        width: isMobile ? "100%" : baseWidth,
        height: isMobile ? "auto" : baseHeight,
        minHeight: isMobile ? "100vh" : baseHeight,
        transform: isMobile ? "none" : `scale(${scale})`,
        backgroundColor:
          currentTheme.slideBackgroundColor || currentTheme.backgroundColor,
        backgroundImage: currentTheme.gradientBackground,
        color: currentTheme.fontColor,
        fontFamily: currentTheme.fontFamily,
      }}
      className={cn(
        "relative origin-center overflow-hidden shadow-2xl transition-all duration-300",
        isMobile ? "rounded-none overflow-y-auto" : "rounded-xl"
      )}
    >
      <div
        className={cn(
          "h-full w-full pointer-events-none select-none",
          isMobile ? "p-4" : "p-8"
        )}
      >
        <MasterRecursiveComponent
          content={slide.content}
          onContentChange={() => {}}
          isPreview={true}
          isEditable={false}
          slideId={slide.id}
        />
      </div>
    </div>
  );
}

export default function PresentationViewer({
  title,
  slides,
  theme,
  exitHref,
  exitLabel = "Exit",
  viewerMode = "owner",
}: PresentationViewerProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safeSlides = useMemo(() => slides ?? [], [slides]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [transitionType, setTransitionType] =
    useState<TransitionType>("slide");
  const [mouseIdle, setMouseIdle] = useState(false);

  const currentSlideData = safeSlides[currentSlide];

  useEffect(() => {
    setTheme(theme.type === "dark" ? "dark" : "light");
  }, [setTheme, theme.type]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [safeSlides]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobileBreakpoint = 768;

      setIsMobile(width < mobileBreakpoint);

      if (width >= mobileBreakpoint) {
        const padding = 64;
        const availableWidth = width - padding;
        const availableHeight = window.innerHeight - padding;
        const baseWidth = 960;
        const baseHeight = 540;
        const scaleX = availableWidth / baseWidth;
        const scaleY = availableHeight / baseHeight;

        setScale(Math.min(scaleX, scaleY));
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlide((previous) =>
      Math.min(previous + 1, Math.max(safeSlides.length - 1, 0))
    );
  }, [safeSlides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((previous) => Math.max(previous - 1, 0));
  }, []);

  const handleExit = useCallback(() => {
    router.push(exitHref);
  }, [exitHref, router]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen();
      return;
    }

    void document.exitFullscreen();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGridView) {
        if (event.key === "Escape") {
          setIsGridView(false);
        }
        return;
      }

      if (
        event.key === "ArrowRight" ||
        event.key === " " ||
        event.key === "Enter"
      ) {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      } else if (event.key === "Escape") {
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          handleExit();
        }
      } else if (event.key.toLowerCase() === "g") {
        setIsGridView((previous) => !previous);
      } else if (event.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExit, handleNext, handlePrev, isGridView, toggleFullscreen]);

  useEffect(() => {
    const handleMouseMove = () => {
      setMouseIdle(false);

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => setMouseIdle(true), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    handleMouseMove();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  if (safeSlides.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101010] px-6 text-white">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-white/70">
            This presentation does not have any slides available yet.
          </p>
          <Button onClick={handleExit}>{exitLabel}</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className="relative h-screen w-full overflow-hidden bg-[#101010] text-white selection:bg-primary/30"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: mouseIdle && !isGridView ? 0 : 1,
            y: mouseIdle && !isGridView ? -20 : 0,
          }}
          className="absolute left-0 top-0 z-50 flex h-24 w-full items-start justify-between bg-gradient-to-b from-black/60 to-transparent p-4"
        >
          <div
            className="absolute left-0 top-0 h-1 bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${((currentSlide + 1) / safeSlides.length) * 100}%`,
            }}
          />

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={handleExit}
            >
              <X className="mr-2 h-5 w-5" />
              {exitLabel}
            </Button>

            {viewerMode === "share" ? (
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 backdrop-blur md:flex">
                <Globe className="h-3.5 w-3.5" />
                Public link
              </div>
            ) : null}
          </div>

          <div className="hidden max-w-[50vw] truncate rounded-full bg-black/30 px-4 py-2 text-sm text-white/85 backdrop-blur md:block">
            {title}
          </div>
        </motion.div>

        <div className="relative flex h-full w-full items-center justify-center">
          <AnimatePresence mode="wait">
            {!isGridView && currentSlideData ? (
              <motion.div
                key={currentSlide}
                {...transitions[transitionType]}
                className="absolute inset-0 flex items-center justify-center"
              >
                <SlideCanvas
                  slide={currentSlideData}
                  currentTheme={theme}
                  scale={scale}
                  isMobile={isMobile}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {isGridView ? (
              <motion.div
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                className="absolute inset-0 z-40 overflow-y-auto bg-black/60 p-12"
              >
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
                  {safeSlides.map((slide, index) => (
                    <motion.button
                      key={slide.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setCurrentSlide(index);
                        setIsGridView(false);
                      }}
                      className={cn(
                        "group relative aspect-video overflow-hidden rounded-xl ring-2 transition-all duration-300",
                        currentSlide === index
                          ? "scale-105 ring-primary shadow-2xl shadow-primary/20"
                          : "ring-transparent hover:scale-105 hover:ring-white/50"
                      )}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 origin-top-left"
                        style={{
                          transform: "scale(0.25)",
                          width: "400%",
                          height: "400%",
                        }}
                      >
                        <div
                          className="h-full w-full p-8"
                          style={{
                            backgroundColor:
                              theme.slideBackgroundColor || theme.backgroundColor,
                            backgroundImage: theme.gradientBackground,
                            color: theme.fontColor,
                            fontFamily: theme.fontFamily,
                          }}
                        >
                          <MasterRecursiveComponent
                            content={slide.content}
                            onContentChange={() => {}}
                            isPreview={true}
                            isEditable={false}
                            slideId={slide.id}
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-md">
                        {index + 1}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: mouseIdle && !isGridView ? 100 : 0,
            opacity: mouseIdle && !isGridView ? 0 : 1,
          }}
          className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 p-2 shadow-2xl backdrop-blur-xl transition-colors hover:bg-black/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  className="h-10 w-10 rounded-full text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous (Left Arrow)</TooltipContent>
            </Tooltip>

            <div className="flex min-w-[80px] items-center justify-center gap-1 px-4 font-mono text-sm font-medium text-white/90">
              <span className="text-primary">{currentSlide + 1}</span>
              <span className="text-white/30">/</span>
              <span>{safeSlides.length}</span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentSlide === safeSlides.length - 1}
                  className="h-10 w-10 rounded-full text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next (Space/Right Arrow)</TooltipContent>
            </Tooltip>

            <div className="mx-2 h-6 w-px bg-white/10" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsGridView((previous) => !previous)}
                  className={cn(
                    "h-10 w-10 rounded-full text-white hover:bg-white/10",
                    isGridView && "bg-white/20 text-primary"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid View (G)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-10 w-10 rounded-full text-white hover:bg-white/10"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen (F)</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full text-white hover:bg-white/10"
                >
                  <Settings2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="border-white/10 bg-black/90 text-white backdrop-blur-xl"
                side="top"
              >
                <DropdownMenuLabel>Transition</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {(["slide", "fade", "scale", "stack"] as TransitionType[]).map(
                  (transition) => (
                    <DropdownMenuItem
                      key={transition}
                      onClick={() => setTransitionType(transition)}
                      className={cn(
                        "cursor-pointer capitalize",
                        transitionType === transition && "text-primary"
                      )}
                    >
                      {transition}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
