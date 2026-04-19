"use client";

import { useLayoutStore } from "@/store/useLayoutStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface ProjectGalleryWrapperProps {
  children: ReactNode;
}

export function ProjectGalleryWrapper({ children }: ProjectGalleryWrapperProps) {
  const { layout } = useLayoutStore();
  
  return (
    <motion.div 
      layout
      transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
      className={cn(
        "pb-10 w-full",
        layout === 'grid' && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4",
        layout === 'list' && "flex flex-col gap-3",
        layout === 'showcase' && "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      )}
    >
      {children}
    </motion.div>
  );
}
