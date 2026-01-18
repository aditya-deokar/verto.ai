"use client";

import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useCanvas } from "@/mobile-design/context/canvas-context";
import { CanvasControls } from "./CanvasControls";
import { FramePreview } from "./FramePreview";
import { FramesSidebar } from "./FramesSidebar";
import { GenerationProgress } from "./GenerationProgress";

interface MobileCanvasProps {
    projectId: string;
    projectName: string;
    isPending: boolean;
}

export function MobileCanvas({
    projectId,
    projectName,
    isPending,
}: MobileCanvasProps) {
    const { frames, selectedFrame, loadingStatus } = useCanvas();
    const [showSidebar, setShowSidebar] = useState(true);

    return (
        <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 overflow-hidden">
            {/* Sidebar */}
            {showSidebar && (
                <FramesSidebar
                    frames={frames}
                    projectId={projectId}
                    onClose={() => setShowSidebar(false)}
                />
            )}

            {/* Main Canvas Area */}
            <div className="h-full flex items-center justify-center p-8">
                {isPending || !selectedFrame ? (
                    <div className="text-center">
                        <p className="text-muted-foreground">
                            {isPending ? "Loading..." : "Select a screen to preview"}
                        </p>
                    </div>
                ) : (
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.1}
                        maxScale={3}
                        centerOnInit
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                <TransformComponent
                                    wrapperClass="!w-full !h-full"
                                    contentClass="!w-full !h-full flex items-center justify-center"
                                >
                                    <FramePreview
                                        frame={activeFrame}
                                        frameIndex={activeIndex}
                                    />
                                </TransformComponent>

                                <CanvasControls
                                    onZoomIn={zoomIn}
                                    onZoomOut={zoomOut}
                                    onReset={resetTransform}
                                />
                            </>
                        )}
                    </TransformWrapper>
                )}
            </div>

            {/* Generation Progress */}
            {loadingStatus && loadingStatus !== "idle" && (
                <GenerationProgress status={loadingStatus} />
            )}
        </div>
    );
}
