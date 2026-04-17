"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { layouts } from "@/lib/constants";
import { Layout } from "@/lib/types";
import { useSlideStore } from "@/store/useSlideStore";
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import LayoutPreviewItem from "./components-tab/LayoutPreviewItem";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Info } from "lucide-react";

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
        opacity: isDragging ? 0.4 : 1,
      }}
      className="group relative rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:ring-1 hover:ring-primary/50 cursor-grab active:cursor-grabbing overflow-visible"
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 z-10 bg-linear-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md shadow-orange-500/20 flex items-center gap-1 border border-white/20">
          <Sparkles className="w-3 h-3" />
          NEW
        </div>
      )}
      <div className="p-1">
        <LayoutPreviewItem
          name={name}
          Icon={icon}
          type={type}
          component={component}
        />
      </div>
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
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-transparent">
      {/* Search Bar */}
      <div className="p-4 shrink-0 bg-transparent">
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
            type="text"
            placeholder="Search premium layouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            />
        </div>
      </div>

      {/* Layout Count Badge */}
      <div className="px-5 py-2 flex items-center justify-between shrink-0 mb-2">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          {layouts.reduce((acc, group) => acc + group.layouts.length, 0)} Layouts
        </span>
        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-colors">
          {newLayoutTypes.length} New Drops
        </Badge>
      </div>

      <ScrollArea className="flex-1 min-h-0 bg-transparent">
        <div className="px-4 flex flex-col space-y-8 pb-24 pt-2">
          {filteredLayouts.map((group, idx) => (
            <div className="space-y-4" key={idx}>
              {/* Group Header with Count */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-foreground/90 flex items-center gap-2">
                  {group.name}
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                    {group.layouts.length}
                  </span>
                </h3>
                {group.name === "Advanced Layouts" && (
                  <div className="bg-linear-to-r from-orange-500/10 to-rose-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-500/20">
                    <Sparkles className="w-3 h-3" />
                  </div>
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
            <div className="text-center py-12 flex flex-col items-center gap-3 opacity-50">
              <Search className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">No layouts found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none flex justify-center">
        <div className="bg-background/80 backdrop-blur-md border border-border/50 text-muted-foreground shadow-lg px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 pointer-events-auto">
            <Info className="w-3.5 h-3.5 text-primary" /> Drag any layout to the slide
        </div>
      </div>
    </div>
  );
};

export default LayoutChooser;