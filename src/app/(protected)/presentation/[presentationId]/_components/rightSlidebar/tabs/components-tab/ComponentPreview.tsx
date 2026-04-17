import { ContentItem } from "@/lib/types";
import React from "react";
import { cn } from "@/lib/utils";
import { useDrag } from "react-dnd";
import { 
  getComponentAccessibility, 
  getComponentStyling,
  getComponentsByCategory 
} from "@/lib/slideComponents";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ComponentItemProps = {
  type: string;
  componentType: string;
  name: string;
  component: ContentItem;
  icon: string;
};

const ComponentCard = ({ item }: { item: ComponentItemProps }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "CONTENT_ITEM",
    item: item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Get component metadata from advanced component system
  const getComponentMetadata = () => {
    try {
      const accessibility = getComponentAccessibility({ type: item.componentType } as any);
      const styling = getComponentStyling({ type: item.componentType } as any);
      return { accessibility, styling };
    } catch {
      return { accessibility: null, styling: null };
    }
  };

  const { accessibility, styling } = getComponentMetadata();

  // Determine if component has special features
  const hasAccessibility = !!accessibility?.ariaLabel;
  const hasVariants = styling?.supportedVariants && styling.supportedVariants.length > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
            className={cn(
              "relative group rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all duration-300",
              isDragging ? "opacity-40 scale-95 ring-2 ring-primary/50 grayscale-[0.5]" : "hover:shadow-lg hover:-translate-y-1 hover:ring-1 hover:ring-primary/50 cursor-grab active:cursor-grabbing"
            )}
          >
            {/* Accessibility Badge */}
            {hasAccessibility && (
              <Badge 
                className="absolute -top-2 -left-2 z-10 text-[8px] font-bold px-1.5 py-0.5 bg-blue-500/90 text-white shadow-sm border-none"
                variant="default"
              >
                A11Y
              </Badge>
            )}

            {/* Variants Badge */}
            {hasVariants && (
              <Badge 
                className="absolute -top-2 -right-2 z-10 text-[8px] font-bold px-1.5 py-0.5 bg-purple-500/90 text-white shadow-sm border-none"
                variant="default"
              >
                {styling.supportedVariants.length}x
              </Badge>
            )}

            <button
              className={cn(
                "flex flex-col items-center gap-2 p-2 w-full h-full outline-none"
              )}
            >
              <div className="w-full aspect-video rounded-lg border border-border/30 bg-linear-to-br from-background to-muted/20 dark:from-muted/10 dark:to-muted/30 p-2 shadow-xs group-hover:shadow-sm transition-all duration-300 flex items-center justify-center flex-col gap-2">
                  <span className="text-3xl text-primary/80 group-hover:text-primary group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
              </div>
              <span className="text-[10px] font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                {item.name}
              </span>
            </button>

            {/* Info Icon */}
            <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Info className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-primary" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{item.name}</p>
            {accessibility?.ariaLabel && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Role:</span> {accessibility.role}
              </p>
            )}
            {styling?.defaultClasses && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Style:</span> {styling.supportedVariants?.length || 0} variants
              </p>
            )}
            <p className="text-xs italic">Drag to add to slide</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ComponentCard;
