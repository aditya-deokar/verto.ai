"use client";

import { useSlideStore } from "@/store/useSlideStore";
import React, { useState, useEffect } from "react";
import { LayoutSlides } from "@/lib/types";
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

interface SlideCanvasProps {
  slide: any;
  index: number;
  handleDelete: (id: string) => void;
  isEditable: boolean;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  index,
  handleDelete,
  isEditable,
}) => {
  const { currentTheme, updateContentItem, setSelectedComponent, setCurrentSlide } = useSlideStore();

  const handleContentChange = (
    contentId: string,
    newContent: string | string[] | string[][]
  ) => {
    if (isEditable) {
      updateContentItem(slide.id, contentId, newContent);
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full relative bg-white shadow-2xl",
        "transition-all duration-200 ease-in-out",
        "flex flex-col",
        "p-10" // Added padding for better layout
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
      <div className="h-full w-full grow overflow-hidden">
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
    getOrderedSlides,
    currentSlide,
    removeSlide,
    addSlideAtIndex,
  } = useSlideStore();

  const orderedSlides = getOrderedSlides();
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);

  const handleDelete = (id: string) => {
    if (isEditable) {
      removeSlide(id);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") setLoading(false);
  }, []);

  const currentSlideData = orderedSlides[currentSlide];

  return (
    <div className="flex-1 flex flex-col h-full w-full mx-auto px-4 mb-20 relative bg-background">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Skeleton className="h-[60%] w-[80%] rounded-xl" />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex items-center justify-center p-8 relative">
          {/* Zoom Controls (Optional) */}
          {/* <div className="absolute bottom-4 right-4 flex gap-2 z-50">
                <Button size="icon" variant="outline" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="w-4 h-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => setScale(s => Math.min(2, s + 0.1))}><ZoomIn className="w-4 h-4" /></Button>
            </div> */}

          <div
            className="aspect-video w-full max-w-5xl shadow-2xl rounded-sm overflow-hidden ring-1 ring-black/5"
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            {currentSlideData ? (
              <SlideCanvas
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
