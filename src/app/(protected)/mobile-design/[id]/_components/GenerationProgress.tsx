"use client";

import { Loader2 } from "lucide-react";
import { LoadingStatusType } from "@/mobile-design/context/canvas-context";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
    status: LoadingStatusType | "fetching" | "finalizing";
}

export function GenerationProgress({ status }: GenerationProgressProps) {
    return (
        <div
            className={cn(
                `absolute top-4 left-1/2 -translate-x-1/2 min-w-40
                max-w-full px-4 pt-1.5 pb-2
                rounded-br-xl rounded-bl-xl shadow-md
                flex items-center space-x-2 z-20`,
                status === "fetching" && "bg-gray-500 text-white",
                status === "running" && "bg-amber-500 text-white",
                status === "analyzing" && "bg-blue-500 text-white",
                status === "generating" && "bg-purple-500 text-white",
                status === "finalizing" && "bg-purple-500 text-white",
                status === "idle" && "bg-green-500 text-white",
                status === "completed" && "bg-green-500 text-white"
            )}
        >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-semibold capitalize">
                {status === "fetching" ? "Loading Project" : status}
            </span>
        </div>
    );
}
