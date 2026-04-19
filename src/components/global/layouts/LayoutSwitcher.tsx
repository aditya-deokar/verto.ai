"use client";

import { useLayoutStore, GalleryLayoutType } from "@/store/useLayoutStore";
import { LayoutGrid, List, GalleryHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function LayoutSwitcher() {
  const { layout, setLayout } = useLayoutStore();

  const options = [
    { id: 'grid', icon: LayoutGrid, label: 'Grid' },
    { id: 'list', icon: List, label: 'List' },
    { id: 'showcase', icon: GalleryHorizontal, label: 'Showcase' },
  ] as const;

  return (
    <div className="flex items-center gap-1 bg-muted/40 backdrop-blur-md p-1 rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = layout === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setLayout(opt.id as any)}
            title={opt.label}
            className={cn(
              "p-2 rounded-lg transition-all duration-300",
              isActive 
                ? "bg-white dark:bg-[#0A0A0A] text-foreground shadow-sm border border-black/5 dark:border-white/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
