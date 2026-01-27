"use client";

import { useState, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useCanvas } from "@/mobile-design/context/canvas-context";
import { CanvasControls } from "./CanvasControls";
import { GenerationProgress } from "./GenerationProgress";
import { DeviceFrame } from "@/mobile-design/components/canvas/DeviceFrame";
import { CanvasFloatingToolbar } from "@/mobile-design/components/canvas/CanvasFloatingToolbar";
import { HtmlDialog } from "@/mobile-design/components/canvas/HtmlDialog";
import { TOOL_MODE_ENUM, ToolModeType } from "@/mobile-design/constants/canvas";
import { cn } from "@/lib/utils";

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
    const { frames, selectedFrame, loadingStatus, theme, setSelectedFrameId } = useCanvas();
    const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT);
    const [zoomPercent, setZoomPercent] = useState<number>(53);
    const [currentScale, setCurrentScale] = useState<number>(0.53);
    const [openHtmlDialog, setOpenHtmlDialog] = useState(false);
    const [isScreenshotting, setIsScreenshotting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const canvasRootRef = useRef<HTMLDivElement>(null);

    const handleCanvasScreenshot = async () => {
        setIsScreenshotting(true);
        try {
            // Placeholder for screenshot functionality
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setIsScreenshotting(false);
        }
    };

    const onOpenHtmlDialog = () => {
        setOpenHtmlDialog(true);
    };

    const currentStatus = isSaving
        ? "finalizing"
        : isPending && (loadingStatus === null || loadingStatus === "idle")
            ? "fetching"
            : loadingStatus !== "idle" && loadingStatus !== "completed"
                ? loadingStatus
                : null;

    return (
        <>
            <div className="relative w-full h-full overflow-hidden">
                <CanvasFloatingToolbar
                    projectId={projectId}
                    isScreenshotting={isScreenshotting}
                    onScreenshot={handleCanvasScreenshot}
                />

                {currentStatus && <GenerationProgress status={currentStatus} />}

                <TransformWrapper
                    initialScale={0.53}
                    initialPositionX={40}
                    initialPositionY={50}
                    minScale={0.1}
                    maxScale={3}
                    wheel={{ step: 0.1 }}
                    pinch={{ step: 0.1 }}
                    doubleClick={{ disabled: true }}
                    centerZoomedOut={false}
                    centerOnInit={false}
                    smooth={true}
                    limitToBounds={false}
                    panning={{
                        disabled: toolMode !== TOOL_MODE_ENUM.HAND,
                    }}
                    onTransformed={(ref) => {
                        setZoomPercent(Math.round(ref.state.scale * 100));
                        setCurrentScale(ref.state.scale);
                    }}
                >
                    {({ zoomIn, zoomOut }) => (
                        <>
                            <div
                                ref={canvasRootRef}
                                onClick={() => {
                                    if (toolMode === TOOL_MODE_ENUM.SELECT) {
                                        setSelectedFrameId(null);
                                    }
                                }}
                                className={cn(
                                    `absolute inset-0 w-full h-full p-3`,
                                    `bg-[#eee] dark:bg-[#242423]`,
                                    toolMode === TOOL_MODE_ENUM.HAND
                                        ? "cursor-grab active:cursor-grabbing"
                                        : "cursor-default"
                                )}
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle, hsl(var(--primary) / 0.3) 1px, transparent 1px)",
                                    backgroundSize: "20px 20px",
                                }}
                            >
                                <TransformComponent
                                    wrapperStyle={{
                                        width: "100%",
                                        height: "100%",
                                        overflow: "unset",
                                    }}
                                    contentStyle={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                >
                                    <div>
                                        {frames?.map((frame, index: number) => {
                                            const baseX = 100 + index * 480;
                                            const y = 100;

                                            return (
                                                <DeviceFrame
                                                    key={frame.id}
                                                    frameId={frame.id}
                                                    projectId={projectId}
                                                    title={frame.title}
                                                    html={frame.htmlContent}
                                                    isLoading={frame.isLoading}
                                                    scale={currentScale}
                                                    initialPosition={{
                                                        x: baseX,
                                                        y,
                                                    }}
                                                    toolMode={toolMode}
                                                    theme_style={theme?.style}
                                                    onOpenHtmlDialog={onOpenHtmlDialog}
                                                />
                                            );
                                        })}
                                    </div>
                                </TransformComponent>
                            </div>

                            <CanvasControls
                                zoomIn={zoomIn}
                                zoomOut={zoomOut}
                                zoomPercent={zoomPercent}
                                toolMode={toolMode}
                                setToolMode={setToolMode}
                            />
                        </>
                    )}
                </TransformWrapper>
            </div>

            <HtmlDialog
                html={selectedFrame?.htmlContent || ""}
                title={selectedFrame?.title}
                theme_style={theme?.style}
                open={openHtmlDialog}
                onOpenChange={setOpenHtmlDialog}
            />
        </>
    );
}
