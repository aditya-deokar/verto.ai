"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { layouts } from "@/lib/constants";
import { Layout } from "@/lib/types";
import { useSlideStore } from "@/store/useSlideStore";
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import LayoutPreviewItem from "./components-tab/LayoutPreviewItem";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const DraggableLayoutItem = ({
  component,
  icon,
  layoutType,
  name,
  type,
  isNew,
}: Layout & { isNew?: boolean }) => {
  const { currentTheme } = useSlideStore();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "layout",
    item: { type, layoutType, component },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
      className="border rounded-lg relative hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-grab active:cursor-grabbing bg-card"
    >
      {isNew && (
        <Badge
          className="absolute -top-2 -right-2 z-10 bg-linear-to-r from-orange-500 to-red-500 border-none"
          variant="default"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          NEW
        </Badge>
      )}
      <LayoutPreviewItem
        name={name}
        Icon={icon}
        type={type}
        component={component}
      />
    </div>
  );
};

const LayoutChooser = () => {
  const { currentTheme } = useSlideStore();
  const [searchQuery, setSearchQuery] = useState("");

  // New layout types from the latest additions
  const newLayoutTypes = [
    'titleAndContent',
    'splitContentImage',
    'bigNumberLayout',
    'comparisonLayout',
    'quoteLayout',
    'timelineLayout',
    'fullImageBackground',
    'iconGrid',
    'sectionDivider',
    'processFlow',
    'callToAction',
  ];

  // Filter layouts based on search
  const filteredLayouts = layouts.map(group => ({
    ...group,
    layouts: group.layouts.filter(layout =>
      layout.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(group => group.layouts.length > 0);

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-background">
      {/* Search Bar */}
      <div className="p-4 border-b shrink-0 bg-muted/50">
        <input
          type="text"
          placeholder="Search layouts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Layout Count Badge */}
      <div className="px-4 py-2 flex items-center justify-between shrink-0 bg-muted/50 border-b">
        <span className="text-sm font-medium">
          {layouts.reduce((acc, group) => acc + group.layouts.length, 0)} Layouts Available
        </span>
        <Badge variant="outline">
          {newLayoutTypes.length} New
        </Badge>
      </div>

      <ScrollArea className="flex-1 min-h-0 bg-background">
        <div className="p-4 flex flex-col space-y-6 pb-20">
          {filteredLayouts.map((group, idx) => (
            <div className="space-y-3" key={idx}>
              {/* Group Header with Count */}
              <div className="flex items-center justify-between">
                <h3
                  className="text-sm font-semibold px-1 flex items-center gap-2 text-foreground"
                >
                  {group.name}
                  <Badge variant="secondary" className="text-xs">
                    {group.layouts.length}
                  </Badge>
                </h3>
                {group.name === "Advanced Layouts" && (
                  <Badge
                    className="bg-linear-to-r from-orange-500 to-red-500 text-white border-none"
                    variant="default"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Latest
                  </Badge>
                )}
              </div>

              {/* Layout Grid */}
              <div className="grid grid-cols-2 gap-3">
                {group.layouts.map((layout) => (
                  <DraggableLayoutItem
                    key={layout.layoutType}
                    {...layout}
                    isNew={newLayoutTypes.includes(layout.layoutType)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredLayouts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No layouts found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div
        className="p-3 border-t text-xs text-center shrink-0 bg-muted/30 text-muted-foreground"
      >
        Drag any layout to add to your slide
      </div>
    </div>
  );
};

export default LayoutChooser;