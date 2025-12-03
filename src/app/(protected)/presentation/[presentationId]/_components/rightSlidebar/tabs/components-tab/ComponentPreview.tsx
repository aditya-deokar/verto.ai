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
              "border relative group",
              isDragging ? "opacity-50 scale-95" : "opacity-100"
            )}
          >
            {/* Accessibility Badge */}
            {hasAccessibility && (
              <Badge 
                className="absolute -top-2 -left-2 z-10 text-[8px] px-1.5 py-0.5 bg-blue-500"
                variant="default"
              >
                A11Y
              </Badge>
            )}

            {/* Variants Badge */}
            {hasVariants && (
              <Badge 
                className="absolute -top-2 -right-2 z-10 text-[8px] px-1.5 py-0.5 bg-purple-500"
                variant="default"
              >
                {styling.supportedVariants.length}x
              </Badge>
            )}

            <button
              className={cn(
                "flex flex-col items-center cursor-grab active:cursor-grabbing gap-2 p-2 rounded-lg",
                "hover:bg-primary/10 transition-all duration-200",
                "text-center w-full",
                "group-hover:scale-105 transform"
              )}
            >
              <div className="w-full aspect-video rounded-md border bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-2 shadow-xs hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center flex-col gap-2 h-full justify-center">
                  <span className="text-3xl text-primary group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-[10px] opacity-60 font-medium">
                    {item.name}
                  </span>
                </div>
              </div>
            </button>

            {/* Info Icon */}
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Info className="w-3 h-3 text-muted-foreground" />
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
