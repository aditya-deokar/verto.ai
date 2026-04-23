"use client";

import { useSlideStore } from "@/store/useSlideStore";
import React, { useState, useEffect, useRef } from "react";
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
        "w-full h-full relative shadow-2xl overflow-hidden",
        "group flex flex-col",
        "p-12", // Premium padding
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
          <PopoverTrigger asChild className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full shadow-md backdrop-blur-md bg-white/20 hover:bg-white/40 border-none">
              <EllipsisVertical className="w-4 h-4 text-white" />
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

const Editor = ({ isEditable }: Props) => {
  const {
    currentSlide,
    removeSlide,
  } = useSlideStore();

  const slides = useSlideStore(state => state.slides);
  const orderedSlides = [...slides].sort((a, b) => (a.slideOrder ?? 0) - (b.slideOrder ?? 0));

  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [autoScale, setAutoScale] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDelete = (id: string) => {
    if (isEditable) {
      removeSlide(id);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") setLoading(false);
    
    if (!containerRef.current || !autoScale) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const availableW = width - 128; // accounting for more padding
        const availableH = height - 128;
        const scaleW = availableW / 1280;
        const scaleH = availableH / 720;
        setScale(Math.max(0.1, Math.min(scaleW, scaleH, 1.2)));
      }
    });
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [loading, autoScale]);

  const currentSlideData = orderedSlides[currentSlide];

  return (
    <div className="flex-1 flex flex-col h-full w-full mx-auto px-4 relative">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Skeleton className="h-[60%] w-[80%] rounded-xl" />
        </div>
      ) : (
        <div ref={containerRef} className="flex-1 overflow-hidden flex items-center justify-center p-8 relative">
          <div
            className="shadow-2xl rounded-sm overflow-hidden ring-1 ring-black/5 flex-shrink-0"
            style={{
              width: '1280px',
              height: '720px',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-in-out'
            }}
          >
            {currentSlideData ? (
              <SlideCanvas
                key={currentSlideData.id}
                slide={currentSlideData}
                index={currentSlide}
                handleDelete={handleDelete}
                isEditable={isEditable}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-12 text-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <LayoutGrid className="w-12 h-12 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No slide selected</h3>
                  <p className="text-muted-foreground max-w-xs">Select a slide from the sidebar to begin editing your masterpiece.</p>
                </div>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-12 right-12 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => { setAutoScale(false); setScale(s => Math.max(0.1, s - 0.1)); }}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="px-2 min-w-[50px] text-center text-xs font-medium text-white/90 cursor-default select-none" onClick={() => setAutoScale(true)}>
              {Math.round(scale * 100)}%
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => { setAutoScale(false); setScale(s => Math.min(2, s + 0.1)); }}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10", autoScale && "text-primary")}
              onClick={() => setAutoScale(true)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      <EditorToolbar isEditable={isEditable} />
    </div>
  );
};

export default Editor;
