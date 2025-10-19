"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { component } from '@/lib/constants';
import React, { useState, useMemo } from 'react';
import ComponentCard from './components-tab/ComponentPreview';
import { Type, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="p-4 border-b space-y-3 flex-shrink-0 bg-muted/50">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2">
            <Type className="w-5 h-5" />
            Components
          </h2>
          <Badge variant="outline">
            {totalComponents} Total
          </Badge>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {/* Component Count */}
      <div className="px-4 py-2 flex items-center justify-between flex-shrink-0 bg-muted/50 border-b">
        <span className="text-sm font-medium">
          {filteredCount} Components Available
        </span>
        {searchQuery && (
          <Badge variant="secondary" className="text-xs">
            Filtered
          </Badge>
        )}
      </div>

      {/* Components Scroll Area */}
      <ScrollArea className="flex-1 min-h-0 bg-background">
        <div className="p-4 flex flex-col space-y-6 pb-20">
          {filteredComponents.map((group, idx) => (
            <div className="space-y-3" key={idx}>
              {/* Group Header with Count */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground px-1 flex items-center gap-2">
                  {group.name}
                  <Badge variant="secondary" className="text-xs">
                    {group.components.length}
                  </Badge>
                </h3>
              </div>

              {/* Component Grid */}
              <div className="grid grid-cols-3 gap-4">
                {group.components.map((item) => (
                  <ComponentCard key={item.componentType} item={item} />
                ))}
              </div>
            </div>
          ))}

          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Type className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No components found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-3 border-t text-xs text-center space-y-1 flex-shrink-0 bg-muted/30 text-muted-foreground">
        <p>Showing {filteredCount} of {totalComponents} components</p>
        <p className="text-[10px]">Drag any component to add to your slide</p>
      </div>
    </div>
  );
};

export default TextTypography;