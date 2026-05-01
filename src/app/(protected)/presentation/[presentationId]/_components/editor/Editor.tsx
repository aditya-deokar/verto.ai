"use client";

import { useSlideStore } from "@/store/useSlideStore";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { resolveThemeTokens } from "@/lib/themeUtils";
import { ContentItem, LayoutSlides } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Trash, ZoomIn, ZoomOut, RotateCcw, LayoutGrid } from "lucide-react";
import { MasterRecursiveComponent } from "./MasterRecursiveComponent";
import EditorToolbar from "./EditorToolbar";
import { useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent, useControls, useTransformContext } from "react-zoom-pan-pinch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dimensions will be dynamic from the store now
// const SLIDE_WIDTH = 1280;
// const SLIDE_HEIGHT = 720;

interface SlideCanvasProps {
  slide: any;
  index: number;
  handleDelete: (id: string) => void;
  isEditable: boolean;
}

// Helper to recursively assign new IDs to a component structure
const recursiveIdUpdate = (content: ContentItem): ContentItem => {
  const newId = uuidv4();

  if (Array.isArray(content.content)) {
    // Check if the array contains strings (not ContentItems)
    const isStringArray = content.content.length > 0 && typeof content.content[0] === 'string';
    const isStringArrayArray = content.content.length > 0 && Array.isArray(content.content[0]) && typeof (content.content[0] as any)[0] === 'string';

    if (isStringArray || isStringArrayArray) {
      return {
        ...content,
        id: newId
      };
    }

    return {
      ...content,
      id: newId,
      content: (content.content as ContentItem[]).map(recursiveIdUpdate)
    }
  }

  return {
    ...content,
    id: newId
  }
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  index,
  handleDelete,
  isEditable,
}) => {
  const { currentTheme, updateContentItem, setSelectedComponent, updateSlide } = useSlideStore();

  const handleContentChange = (
    contentId: string,
    newContent: string | string[] | string[][]
  ) => {
    if (isEditable) {
      updateContentItem(slide.id, contentId, newContent);
    }
  };

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'layout',
    drop: (item: { layoutType: string, component: LayoutSlides }) => {
      if (!isEditable) return;

      // Clone and update IDs to avoid collisions
      const newContent = recursiveIdUpdate(item.component.content);
      updateSlide(slide.id, newContent);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [slide.id, isEditable]);

    const tokens = resolveThemeTokens(currentTheme);

  return (
    <motion.div
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
      initial={false}
      animate={{
        backgroundImage: currentTheme.gradientBackground,
        backgroundColor: currentTheme.slideBackgroundColor || currentTheme.backgroundColor,
        color: currentTheme.fontColor,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={cn(
        "w-full h-full relative overflow-hidden @container",
        "group flex flex-col",
        "p-6 @sm:p-8 @md:p-12", // Responsive padding based on container size
        isOver && canDrop && "ring-4 ring-primary/50"
      )}
      style={{
        fontFamily: tokens.headingFontFamily,
        borderRadius: tokens.borderRadius,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedComponent(null);
      }}
    >
      <div className="h-full w-full grow overflow-y-auto custom-scrollbar pr-2">
        <MasterRecursiveComponent
          content={slide.content}
          isPreview={false}
          slideId={slide.id}
          isEditable={isEditable}
          onContentChange={handleContentChange}
        />
      </div>

      {isEditable && (
        <Popover>
          <PopoverTrigger asChild className="absolute top-2 left-2 sm:top-4 sm:left-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <Button size="sm" variant="secondary" className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full shadow-md backdrop-blur-md bg-white/20 hover:bg-white/40 border-none">
              <EllipsisVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span className="sr-only">Slide options</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-1 border-white/10 bg-black/80 backdrop-blur-xl text-white" align="start">
            <div className="flex flex-col">
              <Button variant="ghost" size="sm" className="justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(slide.id)}>
                <Trash className="w-4 h-4 mr-2" />
                Delete slide
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </motion.div>
  );
};

type Props = {
  isEditable: boolean;
};

const ZoomControls = ({ autoFitScale }: { autoFitScale: number }) => {
  const { zoomIn, zoomOut, centerView } = useControls();
  const { transformState } = useTransformContext();
  const currentScale = Math.round(transformState.scale * 100);

  return (
    <div className="absolute top-3 right-3 sm:top-auto sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50 flex items-center gap-1 sm:gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-1 sm:p-1.5 rounded-full shadow-2xl">
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

const Editor = ({ isEditable }: Props) => {
  const {
    currentSlide,
    removeSlide,
    slideDimensions,
  } = useSlideStore();

  const SLIDE_WIDTH = slideDimensions?.width || 1280;
  const SLIDE_HEIGHT = slideDimensions?.height || 720;

  const slides = useSlideStore(state => state.slides);
  const orderedSlides = [...slides].sort((a, b) => (a.slideOrder ?? 0) - (b.slideOrder ?? 0));

  const [loading, setLoading] = useState(true);
  const [autoFitScale, setAutoFitScale] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDelete = (id: string) => {
    if (isEditable) {
      removeSlide(id);
    }
  };

  // ─── Responsive auto-scaling ───
  const computeScale = useCallback(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();

    // Responsive padding: less padding on smaller screens
    const padX = width < 640 ? 24 : width < 1024 ? 48 : 80;
    const padY = height < 500 ? 24 : height < 768 ? 48 : 80;

    const availableW = width - padX * 2;
    const availableH = height - padY * 2;

    const scaleW = availableW / SLIDE_WIDTH;
    const scaleH = availableH / SLIDE_HEIGHT;

    setAutoFitScale(Math.max(0.15, Math.min(scaleW, scaleH, 1.2)));
  }, [SLIDE_WIDTH, SLIDE_HEIGHT]);

  useEffect(() => {
    if (typeof window !== "undefined") setLoading(false);

    if (!containerRef.current) return;

    // Initial compute
    computeScale();

    const observer = new ResizeObserver(() => {
      computeScale();
    });
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [loading, computeScale]);

  const currentSlideData = orderedSlides[currentSlide];

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center p-4">
          <Skeleton className="h-[60%] w-[90%] sm:w-[80%] rounded-xl" />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
        >
          {autoFitScale > 0 && (
            <TransformWrapper
              minScale={0.1}
              maxScale={3}
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
                <div
                  className="flex-shrink-0"
                  style={{
                    width: SLIDE_WIDTH,
                    height: SLIDE_HEIGHT,
                  }}
                >
                  {/* Slide shadow/ring container */}
                  <div
                    className="w-full h-full rounded-sm overflow-hidden"
                    style={{
                      boxShadow: '0 8px 40px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {currentSlideData ? (
                        <SlideCanvas
                          key={currentSlideData.id}
                          slide={currentSlideData}
                          index={currentSlide}
                          handleDelete={handleDelete}
                          isEditable={isEditable}
                        />
                      ) : (
                        <motion.div
                          key="empty-state"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center gap-4 sm:gap-6"
                        >
                          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-primary/10 flex items-center justify-center">
                            <LayoutGrid className="w-8 h-8 sm:w-12 sm:h-12 text-primary/40" />
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-lg sm:text-xl font-semibold">No slide selected</h3>
                            <p className="text-muted-foreground text-sm sm:text-base max-w-xs">Select a slide from the sidebar to begin editing your masterpiece.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </TransformComponent>
            </TransformWrapper>
          )}
        </div>
      )}
      <EditorToolbar isEditable={isEditable} />
    </div>
  );
};

export default Editor;
