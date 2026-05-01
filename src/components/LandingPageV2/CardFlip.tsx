'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, LucideIcon, Rocket } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

export interface CardFlipProps {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon?: LucideIcon;
  className?: string;
  variant?: 'design' | 'editor' | 'brand' | 'export' | 'copilot' | 'cdn';
}

export default function CardFlip({
  title,
  subtitle,
  description,
  features = [],
  icon: IconComponent = Rocket,
  className,
  variant = 'design'
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const renderSkeleton = () => {
    // Keeping the premium skeletons
    switch (variant) {
      case 'design':
        return (
          <div className="absolute inset-0 p-8 flex flex-col gap-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
             <div className="grid grid-cols-4 gap-2 h-32">
                {[...Array(8)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    className="bg-black dark:bg-white rounded-lg h-full w-full"
                  />
                ))}
             </div>
          </div>
        );
      case 'editor':
        return (
          <div className="absolute inset-0 p-8 space-y-3 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ width: 0 }}
                animate={{ width: ["0%", "80%", "80%"] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                className="h-1.5 bg-black dark:bg-white rounded-full"
              />
            ))}
          </div>
        );
      case 'brand':
        return (
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
             {[...Array(2)].map((_, i) => (
               <motion.div 
                key={i}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                className="w-24 h-24 rounded-full border border-black dark:border-white"
               />
             ))}
          </div>
        );
      default:
        return (
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none flex items-center justify-center">
                 <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-48 h-48 border border-dashed border-black dark:border-white rounded-full"
                 />
            </div>
        );
    }
  };

  return (
    <div
      className={cn("group relative h-[320px] w-full [perspective:2000px]", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          'relative h-full w-full',
          '[transform-style:preserve-3d]',
          'transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]',
          isFlipped
            ? '[transform:rotateY(180deg)]'
            : '[transform:rotateY(0deg)]',
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full',
            '[transform:rotateY(0deg)] [backface-visibility:hidden]',
            'overflow-hidden rounded-[32px]',
            'bg-white dark:bg-[#0A0A0A]',
            'border border-black/5 dark:border-white/10',
            'shadow-lg dark:shadow-xl',
            'flex flex-col p-8 transition-all duration-500',
            'group-hover:border-black/20 dark:group-hover:border-white/20'
          )}
        >
          {/* Skeleton Activity */}
          {renderSkeleton()}

          {/* Icon */}
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 text-black dark:text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 backdrop-blur-md">
             {IconComponent && <IconComponent className="h-5 w-5" />}
          </div>

          {/* Text Content */}
          <div className="mt-auto space-y-4">
            <h3 className="text-3xl font-bold tracking-[-0.04em] text-black dark:text-white font-[family-name:var(--font-inter-tight)] leading-[0.9]">
              {title}
            </h3>
            <p className="text-black/70 dark:text-white/60 text-base leading-snug font-[family-name:var(--font-outfit)] font-light tracking-tight">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full',
            '[transform:rotateY(180deg)] [backface-visibility:hidden]',
            'rounded-[32px] p-8',
            'bg-white dark:bg-[#0A0A0A]',
            'border border-black/5 dark:border-white/10',
            'shadow-lg dark:shadow-xl',
            'flex flex-col',
            'transition-all duration-500',
            'group-hover:border-black/20 dark:group-hover:border-white/20'
          )}
        >
          <div className="relative z-10 flex-1 space-y-8">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">
                    Overview
                    </h3>
                </div>
                <p className="text-sm text-black/60 dark:text-white/40 leading-relaxed font-[family-name:var(--font-inter)]">
                {description}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-y-3 pt-4 border-t border-black/5 dark:border-white/5">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 group/feature"
                  style={{
                    transitionDelay: `${index * 80}ms`,
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/50 dark:text-white/40 font-mono">
                   {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Link */}
          <div className="relative z-10 mt-auto pt-6 flex items-center justify-between border-t border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 group/link cursor-pointer">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 dark:text-white/30 group-hover:text-black dark:group-hover:text-white transition-all duration-300">
                    Documentation
                </span>
                <div className="w-0 group-hover:w-4 h-[1px] bg-black dark:bg-white transition-all duration-300" />
            </div>
            <ArrowRight className="h-4 w-4 text-black/40 dark:text-white/40 group-hover:translate-x-1 group-hover:text-black dark:group-hover:text-white transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}

