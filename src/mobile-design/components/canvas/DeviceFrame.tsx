"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Rnd } from "react-rnd";
import { TOOL_MODE_ENUM, ToolModeType } from "@/mobile-design/constants/canvas";
import { useCanvas } from "@/mobile-design/context/canvas-context";
import { getHTMLWrapper } from "@/mobile-design/lib/frame-wrapper";
import { cn } from "@/lib/utils";
import { DeviceFrameToolbar } from "./DeviceFrameToolbar";
import { DeviceFrameSkeleton } from "./DeviceFrameSkeleton";
import { toast } from "sonner";
import { regenerateFrame } from "@/mobile-design/actions/regenerate-frame";
import { deleteFrame } from "@/mobile-design/actions/delete-frame";
import { useRouter } from "next/navigation";

type PropsType = {
    html: string;
    title?: string;
    width?: number;
    minHeight?: number | string;
    initialPosition?: { x: number; y: number };
    frameId: string;
    scale?: number;
    toolMode: ToolModeType;
    theme_style?: string;
    isLoading?: boolean;
    projectId: string;
    onOpenHtmlDialog: () => void;
};

export function DeviceFrame({
    html,
    title = "Untitled",
    width = 420,
    minHeight = 800,
    initialPosition = { x: 0, y: 0 },
    frameId,
    scale = 1,
    toolMode,
    theme_style,
    isLoading = false,
    projectId,
    onOpenHtmlDialog,
}: PropsType) {
    const { selectedFrameId, setSelectedFrameId, updateFrame, removeFrame, setIsRegenerating } = useCanvas();
    const [frameSize, setFrameSize] = useState({
        width,
        height: typeof minHeight === "number" ? minHeight : 800,
    });
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const isSelected = selectedFrameId === frameId;
    const fullHtml = getHTMLWrapper(html, title, theme_style, frameId);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (
                event.data.type === "FRAME_HEIGHT" &&
                event.data.frameId === frameId
            ) {
                setFrameSize((prev) => ({
                    ...prev,
                    height: Math.max(event.data.height, typeof minHeight === "number" ? minHeight : 800),
                }));
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [frameId, minHeight]);

    const handleDownloadPng = useCallback(async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            // For now, just show a toast - screenshot API would need server implementation
            toast.info("Download feature coming soon!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download");
        } finally {
            setIsDownloading(false);
        }
    }, [isDownloading]);

    const handleRegenerate = useCallback(
        (prompt: string) => {
            if (!prompt || prompt.trim() === "") {
                toast.error("Please enter a prompt for regeneration");
                return;
            }
            startTransition(async () => {
                try {
                    // Enable subscription and mark frame as loading
                    setIsRegenerating(true);
                    updateFrame(frameId, { isLoading: true });
                    await regenerateFrame(frameId, projectId, prompt);
                    toast.success("Regeneration started");
                } catch (error) {
                    console.error("Regeneration failed:", error);
                    updateFrame(frameId, { isLoading: false });
                    setIsRegenerating(false);
                    toast.error("Failed to regenerate frame");
                }
            });
        },
        [frameId, projectId, updateFrame, setIsRegenerating]
    );

    const handleDeleteFrame = useCallback(async () => {
        setIsDeleting(true);
        try {
            await deleteFrame(frameId, projectId);
            removeFrame(frameId);
            toast.success("Frame deleted");
        } catch (error) {
            toast.error("Failed to delete frame");
        } finally {
            setIsDeleting(false);
        }
    }, [frameId, projectId, removeFrame]);

    return (
        <Rnd
            default={{
                x: initialPosition.x,
                y: initialPosition.y,
                width,
                height: frameSize.height,
            }}
            minWidth={width}
            minHeight={typeof minHeight === "number" ? minHeight : 800}
            size={{
                width: frameSize.width,
                height: frameSize.height,
            }}
            disableDragging={toolMode === TOOL_MODE_ENUM.HAND}
            enableResizing={isSelected && toolMode !== TOOL_MODE_ENUM.HAND}
            scale={scale}
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (toolMode === TOOL_MODE_ENUM.SELECT) {
                    setSelectedFrameId(frameId);
                }
            }}
            resizeHandleComponent={{
                topLeft: isSelected ? <Handle /> : undefined,
                topRight: isSelected ? <Handle /> : undefined,
                bottomLeft: isSelected ? <Handle /> : undefined,
                bottomRight: isSelected ? <Handle /> : undefined,
            }}
            resizeHandleStyles={{
                top: { cursor: "ns-resize" },
                bottom: { cursor: "ns-resize" },
                left: { cursor: "ew-resize" },
                right: { cursor: "ew-resize" },
            }}
            onResize={(e, direction, ref) => {
                setFrameSize({
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                });
            }}
            className={cn(
                "relative z-10",
                isSelected &&
                toolMode !== TOOL_MODE_ENUM.HAND &&
                "ring-2 ring-blue-400 ring-offset-1",
                toolMode === TOOL_MODE_ENUM.HAND
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-move"
            )}
        >
            <div className="w-full h-full">
                <DeviceFrameToolbar
                    title={title}
                    isSelected={isSelected && toolMode !== TOOL_MODE_ENUM.HAND}
                    disabled={isDownloading || isLoading || isPending || isDeleting}
                    isDownloading={isDownloading}
                    isRegenerating={isPending}
                    isDeleting={isDeleting}
                    onDownloadPng={handleDownloadPng}
                    onRegenerate={handleRegenerate}
                    onDeleteFrame={handleDeleteFrame}
                    onOpenHtmlDialog={onOpenHtmlDialog}
                />

                <div
                    className={cn(
                        `relative w-full h-auto rounded-[36px] overflow-hidden bg-black shadow-2xl`,
                        isSelected && toolMode !== TOOL_MODE_ENUM.HAND && "rounded-none"
                    )}
                >
                    <div className="relative bg-white dark:bg-background overflow-hidden">
                        {isLoading ? (
                            <DeviceFrameSkeleton
                                style={{
                                    position: "relative",
                                    width,
                                    minHeight: typeof minHeight === "number" ? minHeight : 800,
                                    height: `${frameSize.height}px`,
                                }}
                            />
                        ) : (
                            <iframe
                                ref={iframeRef}
                                srcDoc={fullHtml}
                                title={title}
                                sandbox="allow-scripts allow-same-origin"
                                style={{
                                    width: "100%",
                                    minHeight: `${typeof minHeight === "number" ? minHeight : 800}px`,
                                    height: `${frameSize.height}px`,
                                    border: "none",
                                    pointerEvents: "none",
                                    display: "block",
                                    background: "transparent",
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Rnd>
    );
}

function Handle() {
    return (
        <div className="z-30 h-4 w-4 bg-white border-2 border-blue-500" />
    );
}
