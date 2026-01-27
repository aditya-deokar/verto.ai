"use client";

import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface DeviceFrameSkeletonProps {
    style?: CSSProperties;
    className?: string;
}

export function DeviceFrameSkeleton({ style, className }: DeviceFrameSkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
                className
            )}
            style={style}
        >
            <div className="p-6 space-y-6">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                        <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                {/* Large circular element */}
                <div className="flex justify-center py-8">
                    <div className="h-48 w-48 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                    <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                    <div className="h-20 col-span-2 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                </div>

                {/* Bottom nav */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-200 dark:bg-gray-800">
                    <div className="flex justify-around">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="h-2 w-8 bg-gray-300 dark:bg-gray-700 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
