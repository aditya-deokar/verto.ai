"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

export function CanvasControls({
    onZoomIn,
    onZoomOut,
    onReset,
}: CanvasControlsProps) {
    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-background/95 backdrop-blur border rounded-lg p-2 shadow-lg">
            <Button
                variant="ghost"
                size="icon"
                onClick={onZoomIn}
                title="Zoom In"
            >
                <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={onZoomOut}
                title="Zoom Out"
            >
                <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                title="Reset Zoom"
            >
                <Maximize2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
