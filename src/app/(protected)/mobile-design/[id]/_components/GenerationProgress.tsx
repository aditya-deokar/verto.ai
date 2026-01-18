"use client";

import { Loader2, Sparkles, Eye } from "lucide-react";
import { LoadingStatusType } from "@/mobile-design/context/canvas-context";

interface GenerationProgressProps {
    status: LoadingStatusType;
}

export function GenerationProgress({ status }: GenerationProgressProps) {
    const messages = {
        idle: { text: "Ready", icon: Eye },
        running: { text: "Starting generation...", icon: Loader2 },
        analyzing: { text: "Analyzing your app idea...", icon: Sparkles },
        generating: { text: "Creating mobile screens...", icon: Sparkles },
        completed: { text: "Generation complete!", icon: Eye },
    } as const;

    const current = messages[status];
    const Icon = current.icon;

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-background/95 backdrop-blur border rounded-full px-6 py-3 shadow-lg flex items-center gap-3">
                <Icon className={status !== "completed" ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
                <span className="font-medium text-sm">{current.text}</span>
            </div>
        </div>
    );
}
