"use client";

import { formatDistanceToNow } from "date-fns";
import { Smartphone, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLayoutStore } from "@/store/useLayoutStore";

interface MobileProjectCardProps {
    project: {
        id: string;
        name: string;
        thumbnail?: string | null;
        frames: any[];
        createdAt: string | Date;
    };
    className?: string;
}

export function MobileProjectCard({ project, className }: MobileProjectCardProps) {
    const { layout } = useLayoutStore();
    const isList = layout === 'list';

    return (
        <Link href={`/mobile-design/${project.id}`} className="block w-full h-full">
            <motion.div 
               layout 
               transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
               style={{ borderRadius: 32 }}
               className={cn(
                "group relative overflow-hidden border border-black/[0.03] dark:border-white/[0.05] bg-white/80 dark:bg-black/40 backdrop-blur-xl hover:border-black/10 dark:hover:border-white/10 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] hover:-translate-y-1 p-3 transition-transform duration-500 ease-out",
                isList ? "flex flex-row items-center gap-4 h-auto" : "flex flex-col h-full",
                className
            )}>
                {/* Apple-style Inner Highlight */}
                <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none z-10" />

                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none rounded-[32px]" />

                <div className={cn("p-0 z-10", isList ? "flex items-center gap-4 flex-1" : "flex-1 flex flex-col")}>
                    {/* Thumbnail */}
                    <motion.div layout="position" transition={{ layout: { duration: 0.4, ease: "easeOut" } }} className={cn("relative bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 overflow-hidden flex items-center justify-center rounded-2xl border border-black/5 dark:border-white/5",
                        isList ? "w-32 sm:w-48 aspect-16/10 shrink-0" : "aspect-16/10 w-full"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />
                        {project.thumbnail ? (
                            <img
                                src={project.thumbnail}
                                alt={project.name}
                                className="object-contain max-h-full max-w-full shadow-md rounded-lg"
                            />
                        ) : project.frames?.[0]?.htmlContent ? (
                            <div className="scale-[0.25] origin-center w-[375px] h-[812px] bg-white text-black overflow-hidden shadow-xl rounded-3xl border-4 border-gray-200">
                                {/* We can render a mini iframe or just a placeholder. 
                                   Rendering HTML directly might be risky/heavy for a card list.
                                   Let's stick to the icon if no thumbnail for now.
                               */}
                                <div dangerouslySetInnerHTML={{ __html: project.frames[0].htmlContent }} className="w-full h-full pointer-events-none" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full w-full">
                                <Smartphone className="h-10 w-10 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </div>
                        )}

                        {/* Frame count badge */}
                        <div className="absolute top-2 right-2 bg-black/75 text-white px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-md">
                            {project.frames?.length || 0} screens
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 bg-violet-600/90 text-white px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-md">
                            Mobile App
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div layout="position" transition={{ layout: { duration: 0.4, ease: "easeOut" } }} className={cn("px-2 pb-1 pt-3 flex-1 flex flex-col", isList ? "justify-center pt-0" : "")}>
                        <h3 className={cn("font-semibold truncate mb-1 text-primary", isList ? "text-lg" : "text-base")}>{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(project.createdAt), {
                                addSuffix: true,
                            })}
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </Link>
    );
}
