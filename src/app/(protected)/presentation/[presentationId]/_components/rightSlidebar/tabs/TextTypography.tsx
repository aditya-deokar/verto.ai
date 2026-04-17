"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { component } from '@/lib/constants';
import React, { useState, useMemo } from 'react';
import ComponentCard from './components-tab/ComponentPreview';
import { Type, Search, Info } from 'lucide-react';

const TextTypography = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate total components
  const totalComponents = useMemo(() => {
    return component.reduce((acc, group) => acc + group.components.length, 0);
  }, []);

  // Filter components based on search
  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return component;

    return component.map(group => ({
      ...group,
      components: group.components.filter(comp =>
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(group => group.components.length > 0);
  }, [searchQuery]);

  // Calculate filtered count
  const filteredCount = useMemo(() => {
    return filteredComponents.reduce((acc, group) => acc + group.components.length, 0);
  }, [filteredComponents]);

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-transparent">
      {/* Search Bar */}
      <div className="p-4 shrink-0 bg-transparent">
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
            type="text"
            placeholder="Search premium components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            />
        </div>
      </div>

      {/* Component Count */}
      <div className="px-5 py-2 flex items-center justify-between shrink-0 mb-2">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          {filteredCount} Components
        </span>
        {searchQuery && (
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-colors">
            Filtered
          </Badge>
        )}
      </div>

      {/* Components Scroll Area */}
      <ScrollArea className="flex-1 min-h-0 bg-transparent">
        <div className="px-4 flex flex-col space-y-8 pb-24 pt-2">
          {filteredComponents.map((group, idx) => (
            <div className="space-y-4" key={idx}>
              {/* Group Header with Count */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-foreground/90 flex items-center gap-2">
                  {group.name}
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                    {group.components.length}
                  </span>
                </h3>
              </div>

              {/* Component Grid */}
              <div className="grid grid-cols-2 gap-3">
                {group.components.map((item) => (
                  <ComponentCard key={item.componentType} item={item} />
                ))}
              </div>
            </div>
          ))}

          {filteredComponents.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center gap-3 opacity-50">
              <Search className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">No components found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none flex justify-center">
        <div className="bg-background/80 backdrop-blur-md border border-border/50 text-muted-foreground shadow-lg px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 pointer-events-auto">
            <Info className="w-3.5 h-3.5 text-primary" /> Showing {filteredCount} elements
        </div>
      </div>
    </div>
  );
};

export default TextTypography;