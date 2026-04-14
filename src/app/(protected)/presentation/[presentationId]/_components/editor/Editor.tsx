"use client";

import { useSlideStore } from "@/store/useSlideStore";
import React, { useState, useEffect, useRef } from "react";
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
import { EllipsisVertical, Trash, ZoomIn, ZoomOut } from "lucide-react";
import { MasterRecursiveComponent } from "./MasterRecursiveComponent";
import EditorToolbar from "./EditorToolbar";
import { useDrop } from "react-dnd";

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

  return (
    <div
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
      className={cn(
        "w-full h-full relative bg-white shadow-2xl",
        "transition-all duration-200 ease-in-out",
        "flex flex-col",
        "p-10", // Added padding for better layout
        isOver && canDrop && "ring-4 ring-primary/50"
      )}
      style={{
        backgroundImage: currentTheme.gradientBackground,
        backgroundColor: currentTheme.backgroundColor,
        color: currentTheme.fontColor,
        fontFamily: currentTheme.fontFamily,
      }}
      onClick={() => {
        // setCurrentSlide(index) // Already current
        setSelectedComponent(null)
      }}
    >
      <div className="h-full w-full grow">
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
          <PopoverTrigger asChild className="absolute top-4 left-4 opacity-0 hover:opacity-100 transition-opacity z-50">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full shadow-md">
              <EllipsisVertical className="w-4 h-4" />
              <span className="sr-only">Slide options</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-1" align="start">
            <div className="flex flex-col">
              <Button variant="ghost" size="sm" className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(slide.id)}>
                <Trash className="w-4 h-4 mr-2" />
                Delete slide
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDelete = (id: string) => {
    if (isEditable) {
      removeSlide(id);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") setLoading(false);
    
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const availableW = width - 64; // accounting for p-8 (32px * 2)
        const availableH = height - 64;
        const scaleW = availableW / 1280;
        const scaleH = availableH / 720;
        // Allows shrink to fit, caps maximum scale to prevent distortion
        setScale(Math.max(0.1, Math.min(scaleW, scaleH, 1.5)));
      }
    });
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [loading]);

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
                key={currentSlideData.id} // Add key to force remount on slide change
                slide={currentSlideData}
                index={currentSlide}
                handleDelete={handleDelete}
                isEditable={isEditable}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white text-muted-foreground">
                No slide selected
              </div>
            )}
          </div>
        </div>
      )}
      <EditorToolbar isEditable={isEditable} />
    </div>
  );
};

export default Editor;
