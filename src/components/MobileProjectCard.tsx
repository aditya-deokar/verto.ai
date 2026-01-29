"use client";

import { formatDistanceToNow } from "date-fns";
import { Smartphone, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    return (
        <Link href={`/mobile-design/${project.id}`}>
            <div className={cn(
                "group relative overflow-hidden rounded-[24px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#0A0A0A] hover:border-black/10 dark:hover:border-white/20 transition-all duration-300 hover:shadow-lg h-full flex flex-col",
                className
            )}>
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-black/5 to-transparent dark:from-white/5 pointer-events-none rounded-[24px]" />

                <div className="p-0 flex-1 flex flex-col z-10">
                    {/* Thumbnail */}
                    <div className="relative aspect-16/10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 overflow-hidden flex items-center justify-center m-2 rounded-xl">
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
                    </div>

                    {/* Info */}
                    <div className="px-4 pb-4 pt-1">
                        <h3 className="font-semibold truncate text-base mb-1 text-primary">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(project.createdAt), {
                                addSuffix: true,
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
