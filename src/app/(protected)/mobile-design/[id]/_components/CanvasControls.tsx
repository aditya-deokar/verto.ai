"use client";

import { ZoomIn, ZoomOut, Maximize2, MousePointer2, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOOL_MODE_ENUM, ToolModeType } from "@/mobile-design/constants/canvas";

interface CanvasControlsProps {
    zoomIn: () => void;
    zoomOut: () => void;
    zoomPercent?: number;
    toolMode: ToolModeType;
    setToolMode: (mode: ToolModeType) => void;
}

export function CanvasControls({
    zoomIn,
    zoomOut,
    zoomPercent = 100,
    toolMode,
    setToolMode,
}: CanvasControlsProps) {
    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-background/95 backdrop-blur border rounded-lg p-2 shadow-lg">
            {/* Tool Mode Toggle */}
            <div className="flex flex-col gap-1 pb-2 border-b">
                <Button
                    variant={toolMode === TOOL_MODE_ENUM.SELECT ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setToolMode(TOOL_MODE_ENUM.SELECT)}
                    title="Select Mode (V)"
                    className={cn(
                        "h-8 w-8",
                        toolMode === TOOL_MODE_ENUM.SELECT && "bg-primary text-primary-foreground"
                    )}
                >
                    <MousePointer2 className="h-4 w-4" />
                </Button>
                <Button
                    variant={toolMode === TOOL_MODE_ENUM.HAND ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setToolMode(TOOL_MODE_ENUM.HAND)}
                    title="Hand Mode (H)"
                    className={cn(
                        "h-8 w-8",
                        toolMode === TOOL_MODE_ENUM.HAND && "bg-primary text-primary-foreground"
                    )}
                >
                    <Hand className="h-4 w-4" />
                </Button>
            </div>

            {/* Zoom Controls */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomIn()}
                title="Zoom In"
                className="h-8 w-8"
            >
                <ZoomIn className="h-4 w-4" />
            </Button>

            <div className="text-center text-xs font-medium text-muted-foreground">
                {zoomPercent}%
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomOut()}
                title="Zoom Out"
                className="h-8 w-8"
            >
                <ZoomOut className="h-4 w-4" />
            </Button>
        </div>
    );
}

